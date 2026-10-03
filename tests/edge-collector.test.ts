import { afterEach, describe, expect, it } from "vitest";
import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { CaptureSessionWriter, approveCaptureExport, decryptTelemetrySample, readCaptureManifest, readCaptureSummary } from "@/lib/edge-collector/session";
import { SessionCrypto } from "@/lib/edge-collector/crypto";
import { ReplayTransport, UnitreeG1Adapter } from "@/lib/robot-adapters";

const cleanup: string[] = [];

afterEach(async () => {
  while (cleanup.length > 0) {
    const path = cleanup.pop();
    if (path) await rm(path, { recursive: true, force: true });
  }
});

describe("Elaris Edge Collector V0", () => {
  it("encrypts and decrypts JSON with AES-256-GCM", () => {
    const crypto = SessionCrypto.create("correct-horse-battery-staple");
    const encrypted = crypto.encryptJson({ secret: "robot-serial-123", value: 42 });

    expect(JSON.stringify(encrypted)).not.toContain("robot-serial-123");

    const decrypted = crypto.decryptJson<{ secret: string; value: number }>(encrypted);
    expect(decrypted).toEqual({ secret: "robot-serial-123", value: 42 });
  });

  it("writes sensitive capture data encrypted and leaves export unapproved by default", async () => {
    const root = await mkdtemp(join(tmpdir(), "elaris-edge-"));
    cleanup.push(root);

    const adapter = new UnitreeG1Adapter();
    const transport = new ReplayTransport([
      { name: "rt/lowstate", messageType: "unitree_hg.msg.dds_.LowState_" },
      { name: "rt/lowcmd", messageType: "unitree_hg.msg.dds_.LowCmd_" },
    ]);
    await transport.connect();

    const discovery = await adapter.discover(transport, {
      manufacturer: "Unitree",
      model: "G1",
      serial: "SENSITIVE-SERIAL",
    });

    const writer = await CaptureSessionWriter.create({
      rootDir: root,
      passphrase: "correct-horse-battery-staple",
      purpose: "component health baseline",
      robotId: "US21-G1-01",
      robot: {
        manufacturer: "Unitree",
        model: "G1",
        serial: "SENSITIVE-SERIAL",
      },
      adapterId: adapter.id,
      transportKind: "replay",
      configurationId: "cfg-001",
      discovery,
    });

    const payload = {
      mode_pr: 0,
      mode_machine: 5,
      tick: 123,
      imu_state: {
        rpy: [0.1, 0.2, 0.3],
        gyroscope: [0.4, 0.5, 0.6],
      },
      motor_state: [
        {},
        {},
        {},
        {
          q: 0.42,
          dq: 1.25,
          ddq: 0.15,
          tau_est: 11.8,
          temperature: [54, 63],
          vol: 48.1,
          motorstate: 7,
        },
      ],
    };

    const events = adapter.normalize(
      { name: "rt/lowstate" },
      payload,
      {
        robotId: "US21-G1-01",
        captureSessionId: "test-session",
        configurationId: "cfg-001",
        transportKind: "replay",
      }
    );

    await writer.append({
      rawFrame: {
        timestamp: "2026-10-02T15:00:00.000Z",
        channel: "rt/lowstate",
        payload,
      },
      events,
    });

    const result = await writer.finalize();
    await transport.close();

    const summary = await readCaptureSummary(result.sessionDir);
    expect(summary).toMatchObject({
      classification: "SENSITIVE",
      state: "FINALIZED",
      exportApproval: "NOT_APPROVED",
      frameCount: 1,
    });
    expect(summary.eventCount).toBeGreaterThan(0);

    const manifestText = await readFile(join(result.sessionDir, "manifest.enc.json"), "utf8");
    const rawText = await readFile(join(result.sessionDir, "raw.ndjson.enc"), "utf8");
    const telemetryText = await readFile(join(result.sessionDir, "telemetry.ndjson.enc"), "utf8");

    expect(manifestText).not.toContain("SENSITIVE-SERIAL");
    expect(manifestText).not.toContain("component health baseline");
    expect(rawText).not.toContain("tau_est");
    expect(rawText).not.toContain("11.8");
    expect(telemetryText).not.toContain("joint.torque_estimate");
    expect(telemetryText).not.toContain("11.8");

    const manifest = await readCaptureManifest(
      result.sessionDir,
      "correct-horse-battery-staple"
    );
    expect(manifest.robot.serial).toBe("SENSITIVE-SERIAL");
    expect(manifest.collectionPolicy.cloudUploadDuringCapture).toBe("DISABLED");

    const sample = await decryptTelemetrySample(
      result.sessionDir,
      "correct-horse-battery-staple",
      20
    );
    expect(sample).toEqual(expect.arrayContaining([
      expect.objectContaining({
        componentId: "unitree-g1-joint-03-left-knee",
        signal: "joint.torque_estimate",
        value: 11.8,
        sensitivity: "SENSITIVE",
      }),
    ]));

    const files = await readdir(result.sessionDir);
    expect(files).toEqual(expect.arrayContaining([
      "session.public.json",
      "manifest.enc.json",
      "raw.ndjson.enc",
      "telemetry.ndjson.enc",
      "checksums.sha256",
    ]));
  });

  it("requires explicit approval before a capture is marked approved for export", async () => {
    const root = await mkdtemp(join(tmpdir(), "elaris-edge-"));
    cleanup.push(root);

    const adapter = new UnitreeG1Adapter();
    const transport = new ReplayTransport([{ name: "rt/lowstate" }]);
    await transport.connect();
    const discovery = await adapter.discover(transport, {
      manufacturer: "Unitree",
      model: "G1",
    });

    const writer = await CaptureSessionWriter.create({
      rootDir: root,
      passphrase: "correct-horse-battery-staple",
      purpose: "baseline",
      robotId: "robot-01",
      robot: { manufacturer: "Unitree", model: "G1" },
      adapterId: adapter.id,
      transportKind: "replay",
      discovery,
    });

    const result = await writer.finalize();
    await transport.close();

    const approved = await approveCaptureExport(
      result.sessionDir,
      "correct-horse-battery-staple",
      {
        reviewer: "Authorized reviewer",
        reason: "Reviewed and sanitized for research analysis",
      }
    );

    expect(approved.exportApproval).toBe("APPROVED");
    const approvalText = await readFile(
      join(result.sessionDir, "export-approval.enc.json"),
      "utf8"
    );
    expect(approvalText).not.toContain("Authorized reviewer");
    expect(approvalText).not.toContain("Reviewed and sanitized");
  });
});
