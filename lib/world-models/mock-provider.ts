import {
  assertWorldModelCapability,
  assertWorldModelRequestBoundary,
  buildWorldModelResult,
} from "./provider";
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
} from "./types";
import type { WorldModelProvider } from "./provider";

export type MockWorldModelProviderOptions = Readonly<{
  descriptor?: WorldModelDescriptor;
  capabilities?: readonly WorldModelCapability[];
  clock?: () => string;
}>;

const DEFAULT_DESCRIPTOR: WorldModelDescriptor = Object.freeze({
  provider: "mock-world-model",
  providerVersion: "v0",
  model: "mock-physical-ai",
  modelVersion: "v0",
  runtime: Object.freeze({
    kind: "MOCK",
    runtimeId: "mock-local-v0",
    dataEgress: "NONE",
    endpointClass: "MOCK",
    region: null,
  }),
});

export class MockWorldModelProvider implements WorldModelProvider {
  readonly descriptor: WorldModelDescriptor;

  private readonly supported: readonly WorldModelCapability[];
  private readonly clock: () => string;

  constructor(options: MockWorldModelProviderOptions = {}) {
    this.descriptor = options.descriptor ?? DEFAULT_DESCRIPTOR;
    this.supported = Object.freeze([
      ...(options.capabilities ?? ["REASON", "GENERATE"]),
    ]);
    this.clock =
      options.clock ?? (() => new Date().toISOString());
  }

  async capabilities(): Promise<WorldModelCapabilityProfile> {
    return Object.freeze({
      supported: this.supported,
      constraints: Object.freeze({
        mode: "deterministic-test-double",
      }),
    });
  }

  async health(): Promise<WorldModelHealth> {
    return Object.freeze({
      status: "READY",
      checkedAt: this.clock(),
      descriptor: this.descriptor,
      detail: "Mock provider; no external runtime contacted.",
    });
  }

  async reason(
    request: WorldModelReasonRequest
  ): Promise<WorldModelInvocationResult<WorldModelReasonOutput>> {
    return this.invoke(
      "REASON",
      request,
      Object.freeze({
        text: `Mock reasoning for scenario ${request.scenario.hash}`,
      })
    );
  }

  async generate(
    request: WorldModelGenerateRequest
  ): Promise<WorldModelInvocationResult<WorldModelGenerateOutput>> {
    return this.invoke(
      "GENERATE",
      request,
      Object.freeze({
        artifactRefs: Object.freeze([]),
        summary: `Mock generation for scenario ${request.scenario.hash}`,
      })
    );
  }

  async forwardDynamics(
    request: WorldModelDynamicsRequest
  ): Promise<WorldModelInvocationResult<WorldModelDynamicsOutput>> {
    return this.invoke(
      "FORWARD_DYNAMICS",
      request,
      Object.freeze({
        trajectoryRef: null,
        values: Object.freeze([]),
      })
    );
  }

  async inverseDynamics(
    request: WorldModelDynamicsRequest
  ): Promise<WorldModelInvocationResult<WorldModelDynamicsOutput>> {
    return this.invoke(
      "INVERSE_DYNAMICS",
      request,
      Object.freeze({
        trajectoryRef: null,
        values: Object.freeze([]),
      })
    );
  }

  async policy(
    request: WorldModelPolicyRequest
  ): Promise<WorldModelInvocationResult<WorldModelPolicyOutput>> {
    return this.invoke(
      "POLICY",
      request,
      Object.freeze({
        actionRef: null,
        values: Object.freeze([]),
      })
    );
  }

  private async invoke<TOutput>(
    capability: WorldModelCapability,
    request:
      | WorldModelReasonRequest
      | WorldModelGenerateRequest
      | WorldModelDynamicsRequest
      | WorldModelPolicyRequest,
    output: TOutput
  ): Promise<WorldModelInvocationResult<TOutput>> {
    const profile = await this.capabilities();
    assertWorldModelCapability(
      profile,
      this.descriptor,
      capability
    );
    assertWorldModelRequestBoundary(
      request,
      this.descriptor.runtime
    );

    const startedAt = this.clock();
    const completedAt = this.clock();

    return buildWorldModelResult({
      request,
      descriptor: this.descriptor,
      capability,
      output,
      startedAt,
      completedAt,
    });
  }
}
