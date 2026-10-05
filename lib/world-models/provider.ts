import type {
  WorldModelCapability,
  WorldModelCapabilityProfile,
  WorldModelDescriptor,
  WorldModelDynamicsOutput,
  WorldModelDynamicsRequest,
  WorldModelGenerateOutput,
  WorldModelGenerateRequest,
  WorldModelHealth,
  WorldModelInvocationResult,
  WorldModelPolicyOutput,
  WorldModelPolicyRequest,
  WorldModelReasonOutput,
  WorldModelReasonRequest,
  WorldModelRequestBase,
  WorldModelRuntimeDescriptor,
} from "./types";

export interface WorldModelProvider {
  readonly descriptor: WorldModelDescriptor;

  capabilities(): Promise<WorldModelCapabilityProfile>;
  health(): Promise<WorldModelHealth>;

  reason(
    request: WorldModelReasonRequest
  ): Promise<WorldModelInvocationResult<WorldModelReasonOutput>>;

  generate(
    request: WorldModelGenerateRequest
  ): Promise<WorldModelInvocationResult<WorldModelGenerateOutput>>;

  forwardDynamics?(
    request: WorldModelDynamicsRequest
  ): Promise<WorldModelInvocationResult<WorldModelDynamicsOutput>>;

  inverseDynamics?(
    request: WorldModelDynamicsRequest
  ): Promise<WorldModelInvocationResult<WorldModelDynamicsOutput>>;

  policy?(
    request: WorldModelPolicyRequest
  ): Promise<WorldModelInvocationResult<WorldModelPolicyOutput>>;
}

export class UnsupportedWorldModelCapabilityError extends Error {
  constructor(
    readonly providerId: string,
    readonly capability: WorldModelCapability
  ) {
    super(
      `World model provider ${providerId} does not support capability ${capability}`
    );
    this.name = "UnsupportedWorldModelCapabilityError";
  }
}

export class WorldModelDataBoundaryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WorldModelDataBoundaryError";
  }
}

export class WorldModelRequestValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WorldModelRequestValidationError";
  }
}

const SECRET_KEYS = new Set([
  "apikey",
  "authorization",
  "bearer",
  "password",
  "secret",
  "accesstoken",
  "refreshtoken",
  "ngcapikey",
]);

function normalizedKey(key: string) {
  return key.replace(/[^a-z0-9]/gi, "").toLowerCase();
}

function assertNoSecretLikeKeys(
  value: unknown,
  path = "parameters"
): void {
  if (!value || typeof value !== "object") {
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) =>
      assertNoSecretLikeKeys(item, `${path}[${index}]`)
    );
    return;
  }

  for (const [key, nested] of Object.entries(
    value as Record<string, unknown>
  )) {
    if (SECRET_KEYS.has(normalizedKey(key))) {
      throw new WorldModelRequestValidationError(
        `Secret-like key is forbidden in world-model request metadata: ${path}.${key}`
      );
    }
    assertNoSecretLikeKeys(nested, `${path}.${key}`);
  }
}

function assertSha256(value: string, ref: string) {
  if (!/^[0-9a-f]{64}$/i.test(value)) {
    throw new WorldModelRequestValidationError(
      `Invalid SHA-256 for world-model input ${ref}`
    );
  }
}

export function assertWorldModelRequestBoundary(
  request: WorldModelRequestBase,
  runtime: WorldModelRuntimeDescriptor
) {
  if (!request.requestId.trim()) {
    throw new WorldModelRequestValidationError(
      "World-model request requires requestId"
    );
  }

  if (
    request.scenario.hash !== request.scenario.provenance.scenarioHash
  ) {
    throw new WorldModelRequestValidationError(
      "Compiled scenario hash and provenance hash do not match"
    );
  }

  assertNoSecretLikeKeys(request.parameters);

  for (const input of request.inputArtifacts) {
    if (!input.ref.trim()) {
      throw new WorldModelRequestValidationError(
        "World-model input artifact requires ref"
      );
    }
    if (input.sha256) {
      assertSha256(input.sha256, input.ref);
    }
  }

  if (runtime.dataEgress !== "EXTERNAL") {
    return;
  }

  const protectedRequest =
    request.dataPolicy.sensitivity === "SENSITIVE" ||
    request.dataPolicy.sensitivity === "RESTRICTED";

  if (
    protectedRequest &&
    request.dataPolicy.externalUseApproval !== "APPROVED"
  ) {
    throw new WorldModelDataBoundaryError(
      "Sensitive world-model request cannot leave the approved boundary without explicit external-use approval"
    );
  }

  for (const input of request.inputArtifacts) {
    const protectedInput =
      input.sensitivity === "SENSITIVE" ||
      input.sensitivity === "RESTRICTED";

    if (
      protectedInput &&
      input.externalUseApproval !== "APPROVED"
    ) {
      throw new WorldModelDataBoundaryError(
        `Sensitive input ${input.ref} cannot leave the approved boundary without explicit external-use approval`
      );
    }
  }
}

export function assertWorldModelCapability(
  profile: WorldModelCapabilityProfile,
  descriptor: WorldModelDescriptor,
  capability: WorldModelCapability
) {
  if (!profile.supported.includes(capability)) {
    throw new UnsupportedWorldModelCapabilityError(
      descriptor.provider,
      capability
    );
  }
}

export function evidenceClassForCapability(
  capability: WorldModelCapability
): "INFERRED" | "SIMULATED" {
  return capability === "REASON" ? "INFERRED" : "SIMULATED";
}

export function buildWorldModelResult<TOutput>(input: {
  request: WorldModelRequestBase;
  descriptor: WorldModelDescriptor;
  capability: WorldModelCapability;
  output: TOutput;
  startedAt: string;
  completedAt: string;
}): WorldModelInvocationResult<TOutput> {
  return Object.freeze({
    requestId: input.request.requestId,
    capability: input.capability,
    scenarioHash: input.request.scenario.hash,
    provider: input.descriptor,
    inputArtifactRefs: input.request.inputArtifacts.map(
      (artifact) => artifact.ref
    ),
    inputHashes: input.request.inputArtifacts.flatMap(
      (artifact) => (artifact.sha256 ? [artifact.sha256] : [])
    ),
    evidenceClass: evidenceClassForCapability(input.capability),
    output: input.output,
    startedAt: input.startedAt,
    completedAt: input.completedAt,
  });
}
