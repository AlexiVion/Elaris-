import { describe, expect, it } from "vitest";
import {
  ReplayTransport,
  RobotAdapterRegistry,
  UNITREE_G1_LOWSTATE_CHANNEL,
  UNITREE_G1_JOINTS,
  UnitreeG1Adapter,
  assertReadOnlyChannel,
} from "@/lib/robot-adapters";

describe("Elaris Robot Adapter V0", () => {
  it("keeps the transport contract read-only and blocks known command channels", () => {
    expect(() => assertReadOnlyChannel("rt/lowstate")).not.toThrow();
    expect(() => assertReadOnlyChannel("rt/lowcmd")).toThrow(/read-only policy/i);
    expect(() => assertReadOnlyChannel("rt/arm_sdk", ["rt/arm_sdk"])).toThrow(/read-only policy/i);

    const adapter = new UnitreeG1Adapter();
    expect(adapter.security).toMatchObject({
      mode: "READ_ONLY",
      controlCommands: "DISABLED",
      actuation: "DISABLED",
      cloudUpload: "DISABLED_BY_DEFAULT",
    });
  });

  it("registers a universal adapter contract and resolves Unitree G1 specifically", () => {
    const registry = new RobotAdapterRegistry([new UnitreeG1Adapter()]);
    const adapter = registry.require({ manufacturer: "Unitree", model: "G1" });

    expect(adapter.id).toBe("unitree-g1");
    expect(registry.find({ manufacturer: "Other", model: "Unknown" })).toBeNull();
  });

  it("maps the public G1 29-motor index into stable Elaris component identities", () => {
    expect(UNITREE_G1_JOINTS).toHaveLength(29);
    expect(UNITREE_G1_JOINTS[3]).toMatchObject({
      index: 3,
      key: "left-knee",
      name: "Left knee",
    });

    const leftKnee = new UnitreeG1Adapter().components().find((component) => component.oemIndex === 3);
    expect(leftKnee?.id).toBe("unitree-g1-joint-03-left-knee");
  });

  it("discovers only explicitly allowed state channels", async () => {
    const adapter = new UnitreeG1Adapter();
    const transport = new ReplayTransport([
      { name: "rt/lowstate", messageType: "unitree_hg.msg.dds_.LowState_" },
      { name: "rt/lowcmd", messageType: "unitree_hg.msg.dds_.LowCmd_" },
      { name: "rt/dex3/left/state", messageType: "unitree_hg.msg.dds_.HandState_" },
    ]);

    await transport.connect();
    const discovery = await adapter.discover(transport, { manufacturer: "Unitree", model: "G1" });

    expect(discovery.readableChannels.map((channel) => channel.name)).toEqual([
      "rt/lowstate",
      "rt/dex3/left/state",
    ]);
    expect(discovery.notes.join(" ")).toMatch(/command\/control channels are excluded/i);

    await transport.close();
  });

  it("normalizes a G1 low-state frame into OEM-independent telemetry events", () => {
    const adapter = new UnitreeG1Adapter();
    const motors = Array.from({ length: 29 }, () => ({}));
    motors[3] = {
      q: 0.42,
      dq: 1.25,
      ddq: 0.15,
      tau_est: 11.8,
      temperature: [54, 63],
      vol: 48.1,
      motorstate: 7,
    };

    const events = adapter.normalize(
      { name: UNITREE_G1_LOWSTATE_CHANNEL },
      {
        motor_state: motors,
        imu_state: {
          rpy: [0.1, 0.2, 0.3],
          gyroscope: [0.4, 0.5, 0.6],
        },
        mode_pr: 0,
        mode_machine: 5,
        tick: 12345,
      },
      {
        robotId: "US21-G1-01",
        configurationId: "cfg-discovery-001",
        captureSessionId: "cap-001",
        timestamp: "2026-10-02T15:00:00.000Z",
        transportKind: "replay",
      }
    );

    const leftKnee = events.filter((event) => event.componentId === "unitree-g1-joint-03-left-knee");

    expect(leftKnee).toEqual(expect.arrayContaining([
      expect.objectContaining({ signal: "joint.position", value: 0.42, unit: "rad" }),
      expect.objectContaining({ signal: "joint.velocity", value: 1.25, unit: "rad/s" }),
      expect.objectContaining({ signal: "joint.torque_estimate", value: 11.8, unit: "N·m" }),
      expect.objectContaining({ signal: "motor.temperature.casing", value: 54, unit: "°C" }),
      expect.objectContaining({ signal: "motor.temperature.winding", value: 63, unit: "°C" }),
      expect.objectContaining({ signal: "motor.voltage", value: 48.1, unit: "V" }),
    ]));

    expect(events.every((event) => event.sensitivity === "SENSITIVE")).toBe(true);
    expect(events.some((event) => event.signal === "imu.gyroscope_z" && event.value === 0.6)).toBe(true);
    expect(events.some((event) => event.signal === "system.tick" && event.value === 12345)).toBe(true);
  });

  it("can replay captured frames without adding any command capability", async () => {
    const adapter = new UnitreeG1Adapter();
    const transport = new ReplayTransport(
      [{ name: UNITREE_G1_LOWSTATE_CHANNEL }],
      [{
        channel: UNITREE_G1_LOWSTATE_CHANNEL,
        payload: { motor_state: [{ q: 0.1 }] },
      }]
    );

    await transport.connect();

    const normalized: string[] = [];
    await transport.subscribe(UNITREE_G1_LOWSTATE_CHANNEL, (payload, channel) => {
      for (const event of adapter.normalize(channel, payload, {
        robotId: "replay-robot",
        captureSessionId: "replay-session",
        transportKind: "replay",
      })) {
        normalized.push(event.signal);
      }
    });

    await transport.replayAll();
    expect(normalized).toContain("joint.position");

    await transport.close();
  });
});
