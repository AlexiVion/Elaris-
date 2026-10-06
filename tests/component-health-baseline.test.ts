import { afterEach, describe, expect, it } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { analyzeComponentHealthBaseline } from "@/lib/component-health/baseline";
import { CaptureSessionWriter } from "@/lib/edge-collector/session";
import { ReplayTransport, UnitreeG1Adapter } from "@/lib/robot-adapters";

const cleanup: string[] = [];

afterEach(async () => {
  while (cleanup.length > 0) {
    const path = cleanup.pop();
    if (path) await rm(path, { recursive: true, force: true });
  }
});

describe("Component Health observed baseline V0", () => {
  it("aggregates real-shaped encrypted telemetry without creating a health claim", async () => {
    const root = await mkdtemp(join(tmpdir(), "elaris-health-"));
    cleanup.push(root);

    const passphrase = "baseline-test-passphrase";
    const adapter = new UnitreeG1Adapter();
    const transport = new ReplayTransport([{ name: "rt/lowstate" }]);
    await transport.connect();

    const discovery = await adapter.discover(transport, {
      manufacturer: "Unitree",
      model: "G1",
    });

    const writer = await CaptureSessionWriter.create({
      rootDir: root,
      passphrase,
      purpose: "component-health-baseline",
      robotId: "G1-TEST",
      robot: { manufacturer: "Unitree", model: "G1" },
      adapterId: adapter.id,
      transportKind: "replay",
      discovery,
    });

    const frames = [
      { q: 0.10, dq: 0.20, ddq: 0.0, tau_est: 1.0, temperature: [30, 32], vol: 48.0, motorstate: 0 },
      { q: 0.20, dq: 0.40, ddq: 0.0, tau_est: 2.0, temperature: [31, 33], vol: 47.8, motorstate: 0 },
      { q: 0.30, dq: 0.60, ddq: 0.0, tau_est: 3.0, temperature: [32, 35], vol: 47.6, motorstate: 1 },
    ];

    for (const [index, motor] of frames.entries()) {
      const motors = Array.from({ length: 29 }, () => ({}));
      motors[3] = motor;
      const timestamp = `2026-10-06T14:45:0${index}.000Z`;
      const payload = { motor_state: motors };

      const events = adapter.normalize(
        { name: "rt/lowstate" },
        payload,
        {
          robotId: "G1-TEST",
          captureSessionId: "test",
          timestamp,
          transportKind: "replay",
        }
      );

      await writer.append({
        rawFrame: { timestamp, channel: "rt/lowstate", payload },
        events,
      });
    }

    const finalized = await writer.finalize();
    await transport.close();

    const baseline = await analyzeComponentHealthBaseline(
      finalized.sessionDir,
      passphrase
    );

    expect(baseline).toMatchObject({
      evidenceClass: "OBSERVED",
      assessment: "BASELINE_ONLY",
      frameCount: 3,
      componentCount: 1,
      usableComponentCount: 1,
      unresolvedSlotCount: 0,
    });

    const knee = baseline.components[0]!;
    expect(knee.componentName).toBe("Left knee");
    expect(knee.evidenceState).toBe("OBSERVED_USABLE");

    expect(knee.signals["motor.temperature.casing"]).toMatchObject({
      samples: 3,
      coverage: 1,
      min: 30,
      mean: 31,
      max: 32,
      first: 30,
      last: 32,
      delta: 2,
    });

    expect(knee.signals["joint.torque_estimate"]?.absP95).toBeCloseTo(2.9);
    expect(knee.signals["joint.acceleration"]?.quality).toBe("CONSTANT_ZERO");

    const state = knee.signals["motor.state_code"];
    expect(state && "observedValues" in state ? state.observedValues : []).toEqual([0, 1]);
    expect(state && "transitions" in state ? state.transitions : null).toBe(1);

    expect(baseline.limitations.join(" ")).toMatch(/not a diagnosis/i);
    expect(baseline.limitations.join(" ")).toMatch(/remaining useful life/i);
  });

  it("marks an all-zero physical motor slot with a non-zero state code as unresolved", async () => {
    const root = await mkdtemp(join(tmpdir(), "elaris-health-slot-"));
    cleanup.push(root);

    const passphrase = "baseline-test-passphrase";
    const adapter = new UnitreeG1Adapter();
    const transport = new ReplayTransport([{ name: "rt/lowstate" }]);
    await transport.connect();

    const discovery = await adapter.discover(transport, {
      manufacturer: "Unitree",
      model: "G1",
    });

    const writer = await CaptureSessionWriter.create({
      rootDir: root,
      passphrase,
      purpose: "component-health-baseline",
      robotId: "G1-TEST",
      robot: { manufacturer: "Unitree", model: "G1" },
      adapterId: adapter.id,
      transportKind: "replay",
      discovery,
    });

    for (let index = 0; index < 3; index += 1) {
      const motors = Array.from({ length: 29 }, () => ({}));
      motors[28] = {
        q: 0,
        dq: 0,
        ddq: 0,
        tau_est: 0,
        temperature: [0, 0],
        vol: 0,
        motorstate: 2147483648,
      };
      const timestamp = `2026-10-06T14:46:0${index}.000Z`;
      const payload = { motor_state: motors };

      const events = adapter.normalize(
        { name: "rt/lowstate" },
        payload,
        {
          robotId: "G1-TEST",
          captureSessionId: "test-slot",
          timestamp,
          transportKind: "replay",
        }
      );

      await writer.append({
        rawFrame: { timestamp, channel: "rt/lowstate", payload },
        events,
      });
    }

    const finalized = await writer.finalize();
    await transport.close();

    const baseline = await analyzeComponentHealthBaseline(
      finalized.sessionDir,
      passphrase
    );

    expect(baseline).toMatchObject({
      componentCount: 1,
      usableComponentCount: 0,
      unresolvedSlotCount: 1,
    });
    expect(baseline.components[0]).toMatchObject({
      componentName: "Right wrist yaw",
      evidenceState: "OBSERVED_UNRESOLVED_SLOT",
    });
    expect(baseline.components[0]?.signals["motor.voltage"]?.quality).toBe("CONSTANT_ZERO");
  });
});
