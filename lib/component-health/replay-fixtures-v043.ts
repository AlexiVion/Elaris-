import type { RobotFrameMetadata } from "@/lib/robot-adapters";

export type G1ReplayScenarioV043 = {
  id:
    | "G1_23_DOF"
    | "G1_29_DOF_WRIST_STATIC"
    | "G1_29_DOF_WRIST_MOVING"
    | "DUPLICATE_CAPTURE_TIMESTAMP";
  modeMachine: number;
  frames: Array<{
    channel: "rt/lowstate";
    payload: unknown;
    metadata?: RobotFrameMetadata;
  }>;
};

type WristSample = {
  q: number;
  dq?: number;
  ddq?: number;
  tau_est?: number;
  motorstate?: number;
};

export function buildG1LowstatePayload(
  modeMachine: number,
  tick: number,
  wrist: WristSample
) {
  const motor_state = Array.from({ length: 29 }, () => ({}));
  motor_state[28] = {
    q: wrist.q,
    dq: wrist.dq ?? 0,
    ddq: wrist.ddq ?? 0,
    tau_est: wrist.tau_est ?? 0,
    temperature: [0, 0],
    vol: 0,
    motorstate: wrist.motorstate ?? 0,
  };

  return {
    mode_pr: 0,
    mode_machine: modeMachine,
    tick,
    imu_state: { rpy: [0, 0, 0], gyroscope: [0, 0, 0] },
    motor_state,
  };
}

export const COMPONENT_HEALTH_V043_REPLAY_SCENARIOS: Record<
  G1ReplayScenarioV043["id"],
  G1ReplayScenarioV043
> = {
  G1_23_DOF: scenario("G1_23_DOF", 4, [
    { q: 0 },
    { q: 0 },
    { q: 0 },
  ]),
  G1_29_DOF_WRIST_STATIC: scenario("G1_29_DOF_WRIST_STATIC", 5, [
    { q: 0, motorstate: 2147483648 },
    { q: 0, motorstate: 2147483648 },
    { q: 0, motorstate: 2147483648 },
  ]),
  G1_29_DOF_WRIST_MOVING: scenario("G1_29_DOF_WRIST_MOVING", 5, [
    { q: 0, dq: 0 },
    { q: 0.12, dq: 0.3 },
    { q: 0.27, dq: 0.2 },
  ]),
  DUPLICATE_CAPTURE_TIMESTAMP: {
    id: "DUPLICATE_CAPTURE_TIMESTAMP",
    modeMachine: 5,
    frames: [0, 1, 2].map((index) => ({
      channel: "rt/lowstate" as const,
      payload: buildG1LowstatePayload(5, 100 + index, { q: index / 10 }),
      metadata: {
        callbackSequence: index + 1,
        emittedSequence: index + 1,
        receivedAt:
          index < 2
            ? "2026-10-07T18:00:00.000Z"
            : "2026-10-07T18:00:00.050Z",
      },
    })),
  },
};

function scenario(
  id: G1ReplayScenarioV043["id"],
  modeMachine: number,
  samples: WristSample[]
): G1ReplayScenarioV043 {
  return {
    id,
    modeMachine,
    frames: samples.map((wrist, index) => ({
      channel: "rt/lowstate",
      payload: buildG1LowstatePayload(modeMachine, 100 + index, wrist),
      metadata: {
        callbackSequence: index + 1,
        emittedSequence: index + 1,
        receivedAt: new Date(
          Date.parse("2026-10-07T18:00:00.000Z") + index * 50
        ).toISOString(),
      },
    })),
  };
}
