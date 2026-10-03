import { assertReadOnlyChannel, defaultTelemetrySensitivity, READ_ONLY_SECURITY_PROFILE } from "./security";
import type {
  NormalizationContext,
  NormalizedTelemetryEvent,
  ReadableRobotChannel,
  ReadOnlyRobotTransport,
  RobotAdapter,
  RobotComponentDescriptor,
  RobotDiscoveryResult,
  RobotIdentity,
  RobotSignalDescriptor,
} from "./types";

export const UNITREE_G1_LOWSTATE_CHANNEL = "rt/lowstate";
export const UNITREE_G1_BLOCKED_CHANNELS = ["rt/lowcmd", "rt/arm_sdk"] as const;
export const UNITREE_G1_OPTIONAL_STATE_CHANNELS = [
  "rt/inspire/state",
  "rt/dex3/left/state",
  "rt/dex3/right/state",
] as const;

type JointDefinition = {
  index: number;
  key: string;
  name: string;
  position: string;
  availability: "STANDARD" | "VARIANT_DEPENDENT";
};

/**
 * Public Unitree SDK2 examples expose 29 G1 motor slots. Some slots are
 * variant-dependent (for example locked-waist / 23-DOF configurations).
 * Discovery on a real robot must confirm the actual active configuration.
 */
export const UNITREE_G1_JOINTS: readonly JointDefinition[] = [
  { index: 0, key: "left-hip-pitch", name: "Left hip pitch", position: "left hip", availability: "STANDARD" },
  { index: 1, key: "left-hip-roll", name: "Left hip roll", position: "left hip", availability: "STANDARD" },
  { index: 2, key: "left-hip-yaw", name: "Left hip yaw", position: "left hip", availability: "STANDARD" },
  { index: 3, key: "left-knee", name: "Left knee", position: "left knee", availability: "STANDARD" },
  { index: 4, key: "left-ankle-pitch", name: "Left ankle pitch", position: "left ankle", availability: "STANDARD" },
  { index: 5, key: "left-ankle-roll", name: "Left ankle roll", position: "left ankle", availability: "STANDARD" },
  { index: 6, key: "right-hip-pitch", name: "Right hip pitch", position: "right hip", availability: "STANDARD" },
  { index: 7, key: "right-hip-roll", name: "Right hip roll", position: "right hip", availability: "STANDARD" },
  { index: 8, key: "right-hip-yaw", name: "Right hip yaw", position: "right hip", availability: "STANDARD" },
  { index: 9, key: "right-knee", name: "Right knee", position: "right knee", availability: "STANDARD" },
  { index: 10, key: "right-ankle-pitch", name: "Right ankle pitch", position: "right ankle", availability: "STANDARD" },
  { index: 11, key: "right-ankle-roll", name: "Right ankle roll", position: "right ankle", availability: "STANDARD" },
  { index: 12, key: "waist-yaw", name: "Waist yaw", position: "waist", availability: "STANDARD" },
  { index: 13, key: "waist-roll", name: "Waist roll", position: "waist", availability: "VARIANT_DEPENDENT" },
  { index: 14, key: "waist-pitch", name: "Waist pitch", position: "waist", availability: "VARIANT_DEPENDENT" },
  { index: 15, key: "left-shoulder-pitch", name: "Left shoulder pitch", position: "left shoulder", availability: "STANDARD" },
  { index: 16, key: "left-shoulder-roll", name: "Left shoulder roll", position: "left shoulder", availability: "STANDARD" },
  { index: 17, key: "left-shoulder-yaw", name: "Left shoulder yaw", position: "left shoulder", availability: "STANDARD" },
  { index: 18, key: "left-elbow", name: "Left elbow", position: "left elbow", availability: "STANDARD" },
  { index: 19, key: "left-wrist-roll", name: "Left wrist roll", position: "left wrist", availability: "STANDARD" },
  { index: 20, key: "left-wrist-pitch", name: "Left wrist pitch", position: "left wrist", availability: "VARIANT_DEPENDENT" },
  { index: 21, key: "left-wrist-yaw", name: "Left wrist yaw", position: "left wrist", availability: "VARIANT_DEPENDENT" },
  { index: 22, key: "right-shoulder-pitch", name: "Right shoulder pitch", position: "right shoulder", availability: "STANDARD" },
  { index: 23, key: "right-shoulder-roll", name: "Right shoulder roll", position: "right shoulder", availability: "STANDARD" },
  { index: 24, key: "right-shoulder-yaw", name: "Right shoulder yaw", position: "right shoulder", availability: "STANDARD" },
  { index: 25, key: "right-elbow", name: "Right elbow", position: "right elbow", availability: "STANDARD" },
  { index: 26, key: "right-wrist-roll", name: "Right wrist roll", position: "right wrist", availability: "STANDARD" },
  { index: 27, key: "right-wrist-pitch", name: "Right wrist pitch", position: "right wrist", availability: "VARIANT_DEPENDENT" },
  { index: 28, key: "right-wrist-yaw", name: "Right wrist yaw", position: "right wrist", availability: "VARIANT_DEPENDENT" },
] as const;

const SYSTEM_COMPONENTS: readonly RobotComponentDescriptor[] = [
  {
    id: "unitree-g1-system",
    name: "G1 system",
    kind: "system",
    availability: "STANDARD",
  },
  {
    id: "unitree-g1-imu",
    name: "Torso IMU",
    kind: "imu",
    position: "torso",
    availability: "STANDARD",
  },
];

const COMPONENTS: readonly RobotComponentDescriptor[] = [
  ...UNITREE_G1_JOINTS.map((joint) => ({
    id: `unitree-g1-joint-${String(joint.index).padStart(2, "0")}-${joint.key}`,
    name: joint.name,
    kind: "joint" as const,
    position: joint.position,
    oemIndex: joint.index,
    availability: joint.availability,
    metadata: { source: "Unitree SDK2 public G1 joint index" },
  })),
  ...SYSTEM_COMPONENTS,
];

const SIGNALS: readonly RobotSignalDescriptor[] = [
  { name: "joint.position", unit: "rad", componentKind: "joint", valueType: "number", description: "Joint position reported by the robot." },
  { name: "joint.velocity", unit: "rad/s", componentKind: "joint", valueType: "number", description: "Joint velocity reported by the robot." },
  { name: "joint.acceleration", unit: "rad/s²", componentKind: "joint", valueType: "number", description: "Joint acceleration reported by the robot when available." },
  { name: "joint.torque_estimate", unit: "N·m", componentKind: "joint", valueType: "number", description: "Estimated joint torque reported by the robot." },
  { name: "motor.temperature.casing", unit: "°C", componentKind: "joint", valueType: "number", description: "Motor casing temperature slot from Unitree MotorState." },
  { name: "motor.temperature.winding", unit: "°C", componentKind: "joint", valueType: "number", description: "Motor winding temperature slot from Unitree MotorState." },
  { name: "motor.voltage", unit: "V", componentKind: "joint", valueType: "number", description: "Motor voltage reported by the robot." },
  { name: "motor.state_code", componentKind: "joint", valueType: "number", description: "OEM motor-state code retained as an observed signal." },
  { name: "imu.roll", unit: "rad", componentKind: "imu", valueType: "number", description: "IMU roll." },
  { name: "imu.pitch", unit: "rad", componentKind: "imu", valueType: "number", description: "IMU pitch." },
  { name: "imu.yaw", unit: "rad", componentKind: "imu", valueType: "number", description: "IMU yaw." },
  { name: "imu.gyroscope_x", unit: "rad/s", componentKind: "imu", valueType: "number", description: "IMU angular velocity X." },
  { name: "imu.gyroscope_y", unit: "rad/s", componentKind: "imu", valueType: "number", description: "IMU angular velocity Y." },
  { name: "imu.gyroscope_z", unit: "rad/s", componentKind: "imu", valueType: "number", description: "IMU angular velocity Z." },
  { name: "system.mode_pr", componentKind: "system", valueType: "number", description: "Unitree low-state PR/AB mode field." },
  { name: "system.mode_machine", componentKind: "system", valueType: "number", description: "Unitree low-state machine mode field." },
  { name: "system.tick", componentKind: "system", valueType: "number", description: "Unitree low-state tick counter." },
];

type UnknownRecord = Record<string, unknown>;

function record(value: unknown): UnknownRecord | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as UnknownRecord)
    : null;
}

function numberValue(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function numberArray(value: unknown): number[] {
  return Array.isArray(value)
    ? value.filter((candidate): candidate is number => typeof candidate === "number" && Number.isFinite(candidate))
    : [];
}

function event(
  context: NormalizationContext,
  channel: string,
  componentId: string,
  signal: string,
  value: number,
  unit?: string,
  rawField?: string
): NormalizedTelemetryEvent {
  return {
    timestamp: context.timestamp ?? new Date().toISOString(),
    captureSessionId: context.captureSessionId,
    robotId: context.robotId,
    configurationId: context.configurationId,
    componentId,
    signal,
    value,
    unit,
    sensitivity: defaultTelemetrySensitivity(),
    source: {
      adapterId: "unitree-g1",
      transportKind: context.transportKind,
      channel,
      rawField,
    },
  };
}

export class UnitreeG1Adapter implements RobotAdapter {
  readonly id = "unitree-g1";
  readonly displayName = "Unitree G1";
  readonly security = READ_ONLY_SECURITY_PROFILE;

  supports(robot: RobotIdentity) {
    return robot.manufacturer.toLowerCase().includes("unitree") && robot.model.toLowerCase().includes("g1");
  }

  allowedChannels() {
    return [UNITREE_G1_LOWSTATE_CHANNEL, ...UNITREE_G1_OPTIONAL_STATE_CHANNELS] as const;
  }

  blockedChannels() {
    return UNITREE_G1_BLOCKED_CHANNELS;
  }

  components() {
    return COMPONENTS;
  }

  signals() {
    return SIGNALS;
  }

  async discover(transport: ReadOnlyRobotTransport, robot: RobotIdentity): Promise<RobotDiscoveryResult> {
    if (!this.supports(robot)) {
      throw new Error(`UnitreeG1Adapter does not support ${robot.manufacturer} ${robot.model}`);
    }

    const discovered = await transport.listReadableChannels();
    const allowed = new Set(this.allowedChannels());

    const readableChannels = discovered.filter((channel) => {
      if (!allowed.has(channel.name as (typeof UNITREE_G1_OPTIONAL_STATE_CHANNELS)[number] | typeof UNITREE_G1_LOWSTATE_CHANNEL)) {
        return false;
      }

      assertReadOnlyChannel(channel.name, this.blockedChannels());
      return true;
    });

    const discoveredNames = new Set(discovered.map((channel) => channel.name));
    const notes = [
      discoveredNames.has(UNITREE_G1_LOWSTATE_CHANNEL)
        ? "rt/lowstate is available for read-only normalization."
        : "rt/lowstate was not discovered; live telemetry normalization is not available yet.",
      "Command/control channels are excluded by policy even if visible on the robot network.",
      "The actual G1 DOF/hand configuration must be confirmed on the physical robot.",
    ];

    return {
      adapterId: this.id,
      robot,
      transportKind: transport.kind,
      readableChannels,
      components: [...this.components()],
      signals: [...this.signals()],
      notes,
    };
  }

  normalize(
    channel: ReadableRobotChannel,
    payload: unknown,
    context: NormalizationContext
  ): readonly NormalizedTelemetryEvent[] {
    assertReadOnlyChannel(channel.name, this.blockedChannels());

    if (channel.name !== UNITREE_G1_LOWSTATE_CHANNEL) {
      return [];
    }

    const frame = record(payload);
    if (!frame) {
      return [];
    }

    const events: NormalizedTelemetryEvent[] = [];
    const motors = Array.isArray(frame.motor_state) ? frame.motor_state : [];

    for (const joint of UNITREE_G1_JOINTS) {
      const motor = record(motors[joint.index]);
      if (!motor) continue;

      const componentId = `unitree-g1-joint-${String(joint.index).padStart(2, "0")}-${joint.key}`;

      const scalarMappings: Array<[string, unknown, string | undefined, string]> = [
        ["joint.position", motor.q, "rad", `motor_state[${joint.index}].q`],
        ["joint.velocity", motor.dq, "rad/s", `motor_state[${joint.index}].dq`],
        ["joint.acceleration", motor.ddq, "rad/s²", `motor_state[${joint.index}].ddq`],
        ["joint.torque_estimate", motor.tau_est, "N·m", `motor_state[${joint.index}].tau_est`],
        ["motor.voltage", motor.vol, "V", `motor_state[${joint.index}].vol`],
        ["motor.state_code", motor.motorstate, undefined, `motor_state[${joint.index}].motorstate`],
      ];

      for (const [signal, rawValue, unit, rawField] of scalarMappings) {
        const value = numberValue(rawValue);
        if (value !== null) {
          events.push(event(context, channel.name, componentId, signal, value, unit, rawField));
        }
      }

      const temperatures = numberArray(motor.temperature);
      const casing = temperatures[0];
      const winding = temperatures[1];

      if (casing !== undefined) {
        events.push(event(context, channel.name, componentId, "motor.temperature.casing", casing, "°C", `motor_state[${joint.index}].temperature[0]`));
      }
      if (winding !== undefined) {
        events.push(event(context, channel.name, componentId, "motor.temperature.winding", winding, "°C", `motor_state[${joint.index}].temperature[1]`));
      }
    }

    const imu = record(frame.imu_state);
    if (imu) {
      const rpy = numberArray(imu.rpy);
      const gyroscope = numberArray(imu.gyroscope);
      const imuMappings: Array<[string, number | undefined, string, string]> = [
        ["imu.roll", rpy[0], "rad", "imu_state.rpy[0]"],
        ["imu.pitch", rpy[1], "rad", "imu_state.rpy[1]"],
        ["imu.yaw", rpy[2], "rad", "imu_state.rpy[2]"],
        ["imu.gyroscope_x", gyroscope[0], "rad/s", "imu_state.gyroscope[0]"],
        ["imu.gyroscope_y", gyroscope[1], "rad/s", "imu_state.gyroscope[1]"],
        ["imu.gyroscope_z", gyroscope[2], "rad/s", "imu_state.gyroscope[2]"],
      ];

      for (const [signal, value, unit, rawField] of imuMappings) {
        if (value !== undefined) {
          events.push(event(context, channel.name, "unitree-g1-imu", signal, value, unit, rawField));
        }
      }
    }

    const systemMappings: Array<[string, unknown, string]> = [
      ["system.mode_pr", frame.mode_pr, "mode_pr"],
      ["system.mode_machine", frame.mode_machine, "mode_machine"],
      ["system.tick", frame.tick, "tick"],
    ];

    for (const [signal, rawValue, rawField] of systemMappings) {
      const value = numberValue(rawValue);
      if (value !== null) {
        events.push(event(context, channel.name, "unitree-g1-system", signal, value, undefined, rawField));
      }
    }

    return events;
  }
}
