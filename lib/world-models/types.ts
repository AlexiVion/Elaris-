import type { CompiledScenario } from "@/lib/scenarios";

export const WORLD_MODEL_CAPABILITIES = [
  "REASON",
  "GENERATE",
  "FORWARD_DYNAMICS",
  "INVERSE_DYNAMICS",
  "POLICY",
] as const;

export type WorldModelCapability =
  (typeof WORLD_MODEL_CAPABILITIES)[number];

export const WORLD_MODEL_RUNTIME_KINDS = [
  "MOCK",
  "NVIDIA_HOSTED",
  "NIM_CLOUD",
  "NIM_DEDICATED",
  "NIM_LOCAL",
  "COSMOS_FRAMEWORK",
] as const;

export type WorldModelRuntimeKind =
  (typeof WORLD_MODEL_RUNTIME_KINDS)[number];

export type WorldModelDataSensitivity =
  | "PUBLIC"
  | "INTERNAL"
  | "SENSITIVE"
  | "RESTRICTED";

export type ExternalUseApproval =
  | "APPROVED"
  | "NOT_APPROVED"
  | "NOT_REQUIRED";

export type WorldModelRuntimeDescriptor = Readonly<{
  kind: WorldModelRuntimeKind;
  runtimeId: string;
  dataEgress: "NONE" | "EXTERNAL";
  endpointClass:
    | "MOCK"
    | "LOCAL"
    | "PRIVATE"
    | "MANAGED_PUBLIC";
  region?: string | null;
}>;

export type WorldModelDescriptor = Readonly<{
  provider: string;
  providerVersion: string;
  model: string;
  modelVersion: string;
  runtime: WorldModelRuntimeDescriptor;
}>;

export type WorldModelCapabilityProfile = Readonly<{
  supported: readonly WorldModelCapability[];
  constraints: Readonly<Record<string, string>>;
}>;

export type WorldModelHealth = Readonly<{
  status: "READY" | "DEGRADED" | "UNAVAILABLE";
  checkedAt: string;
  descriptor: WorldModelDescriptor;
  detail?: string | null;
}>;

export type WorldModelInputArtifactRef = Readonly<{
  ref: string;
  sha256?: string | null;
  sensitivity: WorldModelDataSensitivity;
  externalUseApproval: ExternalUseApproval;
}>;

export type WorldModelRequestDataPolicy = Readonly<{
  sensitivity: WorldModelDataSensitivity;
  externalUseApproval: ExternalUseApproval;
}>;

export type WorldModelRequestBase = Readonly<{
  requestId: string;
  scenario: CompiledScenario;
  inputArtifacts: readonly WorldModelInputArtifactRef[];
  dataPolicy: WorldModelRequestDataPolicy;
  parameters: Readonly<Record<string, unknown>>;
  requestedAt: string;
}>;

export type WorldModelReasonRequest = WorldModelRequestBase &
  Readonly<{
    instruction: string;
  }>;

export type WorldModelGenerateRequest = WorldModelRequestBase &
  Readonly<{
    prompt: string;
    seed?: string | number | null;
  }>;

export type WorldModelDynamicsRequest = WorldModelRequestBase &
  Readonly<{
    actionDomain: string;
    actionDimensions?: number | null;
    payload: Readonly<Record<string, unknown>>;
  }>;

export type WorldModelPolicyRequest = WorldModelRequestBase &
  Readonly<{
    actionDomain: string;
    observation: Readonly<Record<string, unknown>>;
  }>;

export type WorldModelReasonOutput = Readonly<{
  text: string;
}>;

export type WorldModelGenerateOutput = Readonly<{
  artifactRefs: readonly string[];
  summary?: string | null;
}>;

export type WorldModelDynamicsOutput = Readonly<{
  trajectoryRef?: string | null;
  values?: readonly unknown[];
}>;

export type WorldModelPolicyOutput = Readonly<{
  actionRef?: string | null;
  values?: readonly unknown[];
}>;

export type WorldModelInvocationResult<TOutput> = Readonly<{
  requestId: string;
  capability: WorldModelCapability;
  scenarioHash: string;
  provider: WorldModelDescriptor;
  inputArtifactRefs: readonly string[];
  inputHashes: readonly string[];
  evidenceClass: "INFERRED" | "SIMULATED";
  output: TOutput;
  startedAt: string;
  completedAt: string;
}>;
