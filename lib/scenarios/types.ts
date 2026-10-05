import type { EvidenceProvenance } from "./evidence-class";

export const SCENARIO_CAPABILITIES = [
  "REASON",
  "GENERATE",
  "FORWARD_DYNAMICS",
  "INVERSE_DYNAMICS",
  "POLICY",
  "PHYSICS_SIMULATION",
] as const;

export type ScenarioCapability = (typeof SCENARIO_CAPABILITIES)[number];

export type ScenarioSpec = Readonly<{
  scenarioId: string;
  title: string;
  purpose: string;
  robotRef: string;
  configurationRef: string;
  baselineRef: string;
  deploymentRef: string;
  taskRef: string;
  environmentRef: string;
  componentRefs: readonly string[];
  executionContextRef?: string | null;
  observedEvidenceRefs: readonly string[];
  assumptions: readonly string[];
  disturbances: readonly string[];
  failureHypotheses: readonly string[];
  humanExposure?: string | null;
  requestedCapabilities: readonly ScenarioCapability[];
  createdBy: string;
  createdAt: string;
}>;

export type ScenarioRunStatus =
  | "PENDING"
  | "RUNNING"
  | "SUCCEEDED"
  | "FAILED"
  | "CANCELLED";

export type ScenarioRun = Readonly<{
  runId: string;
  scenarioId: string;
  scenarioHash: string;
  provider: string;
  providerVersion: string;
  model: string;
  modelVersion: string;
  runtime: string;
  seed: string | number | null;
  parameters: Readonly<Record<string, unknown>>;
  inputArtifactRefs: readonly string[];
  startedAt: string;
  completedAt?: string | null;
  status: ScenarioRunStatus;
}>;

export type ScenarioArtifactKind =
  | "TEXT_REASONING"
  | "IMAGE"
  | "VIDEO"
  | "ACTION_TRAJECTORY"
  | "PHYSICS_TRACE"
  | "METRIC";

export type ScenarioArtifact = Readonly<{
  artifactId: string;
  runId: string;
  kind: ScenarioArtifactKind;
  uri?: string | null;
  localPath?: string | null;
  sha256: string;
  sensitivity: "PUBLIC" | "INTERNAL" | "SENSITIVE" | "RESTRICTED";
  evidenceClass: "SIMULATED" | "INFERRED";
}>;

export type ScenarioFinding = Readonly<{
  findingId: string;
  runId: string;
  claim: string;
  evidenceRefs: readonly string[];
  evidenceClass: "INFERRED" | "HYPOTHESIS";
  confidenceDescriptor?: string | null;
  limitations: readonly string[];
  humanReviewStatus:
    | "PENDING"
    | "CONFIRMED"
    | "REJECTED"
    | "NEEDS_REVISION";
}>;

export type ScenarioEvaluationCheck = Readonly<{
  checkId: string;
  label: string;
  status: "PASS" | "FAIL" | "NOT_APPLICABLE";
  detail?: string | null;
}>;

export type ScenarioEvaluation = Readonly<{
  evaluationId: string;
  runId: string;
  evaluator: string;
  checks: readonly ScenarioEvaluationCheck[];
  result: "PASS" | "FAIL" | "REVIEW_REQUIRED";
  limitations: readonly string[];
}>;

export type ScenarioSourceRefKind =
  | "ROBOT"
  | "CONFIGURATION"
  | "BASELINE"
  | "DEPLOYMENT"
  | "TASK"
  | "ENVIRONMENT"
  | "COMPONENT"
  | "EXECUTION_CONTEXT"
  | "OBSERVED_EVIDENCE";

export type ScenarioSourceRef = Readonly<{
  kind: ScenarioSourceRefKind;
  ref: string;
}>;

export type ScenarioProvenance = Readonly<{
  compilerVersion: string;
  scenarioHash: string;
  compiledAt: string;
  sourceRefs: readonly ScenarioSourceRef[];
  evidence: readonly EvidenceProvenance[];
}>;

export type CompiledScenario = Readonly<{
  spec: ScenarioSpec;
  hash: string;
  provenance: ScenarioProvenance;
}>;
