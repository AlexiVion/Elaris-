import type {
  EvidenceProvenance,
  ScenarioSpec,
} from "@/lib/scenarios";

export const GOLDEN_SCENARIO_SPEC: ScenarioSpec = {
  scenarioId: "SCN-G1-KNEE-001",
  title: "Unitree G1 left-knee reduced-performance review",
  purpose: "Evaluate a synthetic replay-first scenario before Dataset #001 exists.",
  robotRef: "robot:unitree-g1:synthetic",
  configurationRef: "configuration:us21-replay-v0",
  baselineRef: "baseline:synthetic-replay-v0",
  deploymentRef: "deployment:representative-v0",
  taskRef: "task:representative-manipulation-v0",
  environmentRef: "environment:shared-workspace-v0",
  componentRefs: [
    "component:unitree-g1:imu",
    "component:unitree-g1:left-knee",
  ],
  executionContextRef: null,
  observedEvidenceRefs: [],
  assumptions: [
    "All robot state used by this fixture is synthetic replay data, not field evidence.",
    "Reduced actuator performance is hypothetical.",
  ],
  disturbances: [
    "Reduced left-knee actuator performance",
    "Human enters shared workspace",
  ],
  failureHypotheses: [
    "Reduced actuator performance may alter task execution and requires review.",
  ],
  humanExposure: "SHARED_WORKSPACE",
  requestedCapabilities: ["REASON"],
  createdBy: "elaris-test-fixture",
  createdAt: "2026-10-05T12:00:00.000Z",
};

export const APPROVED_REAL_EVIDENCE: EvidenceProvenance = {
  ref: "dataset:us21-001:knee-window-001",
  evidenceClass: "OBSERVED",
  sourceKind: "REAL_WORLD",
  scenarioUseApproval: "APPROVED",
  sourceSha256: "a".repeat(64),
  note: "Test-only provenance record representing an approved real-world source.",
};
