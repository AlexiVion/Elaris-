import { describe, expect, it } from "vitest";
import {
  MockWorldModelProvider,
  UnsupportedWorldModelCapabilityError,
  WorldModelDataBoundaryError,
  WorldModelRequestValidationError,
  type WorldModelDescriptor,
} from "@/lib/world-models";
import { compileScenario } from "@/lib/scenarios";
import { GOLDEN_SCENARIO_SPEC } from "@/tests/scenarios/fixtures";

const compiled = compileScenario({
  spec: GOLDEN_SCENARIO_SPEC,
});

const baseRequest = {
  requestId: "WM-REQ-001",
  scenario: compiled,
  inputArtifacts: [],
  dataPolicy: {
    sensitivity: "INTERNAL" as const,
    externalUseApproval: "NOT_REQUIRED" as const,
  },
  parameters: {},
  requestedAt: "2026-10-05T13:00:00.000Z",
};

describe("WorldModelProvider contract", () => {
  it("exposes capabilities, health and complete provider metadata", async () => {
    const provider = new MockWorldModelProvider({
      clock: () => "2026-10-05T13:00:01.000Z",
    });

    const capabilities = await provider.capabilities();
    const health = await provider.health();

    expect(capabilities.supported).toEqual([
      "REASON",
      "GENERATE",
    ]);
    expect(health.status).toBe("READY");
    expect(health.descriptor).toMatchObject({
      provider: "mock-world-model",
      providerVersion: "v0",
      model: "mock-physical-ai",
      modelVersion: "v0",
      runtime: {
        kind: "MOCK",
        dataEgress: "NONE",
      },
    });
  });

  it("preserves scenario/input provenance and classifies reasoning as INFERRED", async () => {
    const provider = new MockWorldModelProvider({
      clock: () => "2026-10-05T13:00:01.000Z",
    });

    const result = await provider.reason({
      ...baseRequest,
      inputArtifacts: [
        {
          ref: "artifact:fixture-001",
          sha256: "a".repeat(64),
          sensitivity: "INTERNAL",
          externalUseApproval: "NOT_REQUIRED",
        },
      ],
      instruction: "Review the synthetic scenario.",
    });

    expect(result.scenarioHash).toBe(compiled.hash);
    expect(result.inputArtifactRefs).toEqual([
      "artifact:fixture-001",
    ]);
    expect(result.inputHashes).toEqual(["a".repeat(64)]);
    expect(result.evidenceClass).toBe("INFERRED");
    expect(result.provider.modelVersion).toBe("v0");
    expect(result.provider.runtime.kind).toBe("MOCK");
  });

  it("classifies generated output as SIMULATED", async () => {
    const provider = new MockWorldModelProvider();

    const result = await provider.generate({
      ...baseRequest,
      prompt: "Generate a synthetic environment variation.",
      seed: 42,
    });

    expect(result.evidenceClass).toBe("SIMULATED");
    expect(result.scenarioHash).toBe(compiled.hash);
  });

  it("fails closed on unsupported capabilities", async () => {
    const provider = new MockWorldModelProvider({
      capabilities: ["REASON"],
    });

    await expect(
      provider.generate({
        ...baseRequest,
        prompt: "This capability is disabled.",
      })
    ).rejects.toBeInstanceOf(
      UnsupportedWorldModelCapabilityError
    );
  });

  it("blocks sensitive egress without explicit approval", async () => {
    const externalDescriptor: WorldModelDescriptor = {
      provider: "mock-external",
      providerVersion: "v0",
      model: "mock",
      modelVersion: "v0",
      runtime: {
        kind: "NVIDIA_HOSTED",
        runtimeId: "hosted-test",
        dataEgress: "EXTERNAL",
        endpointClass: "MANAGED_PUBLIC",
      },
    };

    const provider = new MockWorldModelProvider({
      descriptor: externalDescriptor,
      capabilities: ["REASON"],
    });

    await expect(
      provider.reason({
        ...baseRequest,
        dataPolicy: {
          sensitivity: "SENSITIVE",
          externalUseApproval: "NOT_APPROVED",
        },
        instruction: "Do not send this outside the boundary.",
      })
    ).rejects.toBeInstanceOf(WorldModelDataBoundaryError);
  });

  it("allows explicitly approved sensitive egress and preserves the approval boundary", async () => {
    const externalDescriptor: WorldModelDescriptor = {
      provider: "mock-external",
      providerVersion: "v0",
      model: "mock",
      modelVersion: "v0",
      runtime: {
        kind: "NVIDIA_HOSTED",
        runtimeId: "hosted-test",
        dataEgress: "EXTERNAL",
        endpointClass: "MANAGED_PUBLIC",
      },
    };

    const provider = new MockWorldModelProvider({
      descriptor: externalDescriptor,
      capabilities: ["REASON"],
    });

    const result = await provider.reason({
      ...baseRequest,
      dataPolicy: {
        sensitivity: "SENSITIVE",
        externalUseApproval: "APPROVED",
      },
      instruction: "Approved non-production test.",
    });

    expect(result.evidenceClass).toBe("INFERRED");
  });

  it("rejects secret-like keys from request metadata so they cannot enter provenance/loggable parameters", async () => {
    const provider = new MockWorldModelProvider();

    await expect(
      provider.reason({
        ...baseRequest,
        parameters: {
          temperature: 0.2,
          nested: {
            api_key: "must-not-be-here",
          },
        },
        instruction: "Review.",
      })
    ).rejects.toBeInstanceOf(
      WorldModelRequestValidationError
    );
  });

  it("rejects scenario provenance/hash mismatch", async () => {
    const provider = new MockWorldModelProvider();
    const tampered = {
      ...compiled,
      provenance: {
        ...compiled.provenance,
        scenarioHash: "b".repeat(64),
      },
    };

    await expect(
      provider.reason({
        ...baseRequest,
        scenario: tampered,
        instruction: "Review.",
      })
    ).rejects.toThrow(/hash and provenance hash do not match/i);
  });
});
