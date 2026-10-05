import { describe, expect, it } from "vitest";
import {
  scenarioArtifactSchema,
  scenarioFindingSchema,
  scenarioRunSchema,
  scenarioSpecSchema,
} from "@/lib/scenarios";
import { GOLDEN_SCENARIO_SPEC } from "./fixtures";

describe("Scenario Domain schemas", () => {
  it("fails explicitly when a critical scenario ref is missing", () => {
    const result = scenarioSpecSchema.safeParse({
      ...GOLDEN_SCENARIO_SPEC,
      robotRef: "",
    });

    expect(result.success).toBe(false);
  });

  it("roundtrips a ScenarioSpec without semantic loss", () => {
    const first = scenarioSpecSchema.parse(GOLDEN_SCENARIO_SPEC);
    const serialized = JSON.stringify(first);
    const second = scenarioSpecSchema.parse(JSON.parse(serialized));

    expect(second).toEqual(first);
  });

  it("prevents generated artifacts from claiming OBSERVED truth", () => {
    const artifact = {
      artifactId: "ART-001",
      runId: "RUN-001",
      kind: "VIDEO",
      localPath: "/tmp/generated.mp4",
      sha256: "c".repeat(64),
      sensitivity: "INTERNAL",
      evidenceClass: "OBSERVED",
    };

    expect(scenarioArtifactSchema.safeParse(artifact).success).toBe(false);
  });

  it("keeps model findings separate from HUMAN_CONFIRMED decisions", () => {
    const finding = {
      findingId: "FND-001",
      runId: "RUN-001",
      claim: "A candidate task-execution issue requires review.",
      evidenceRefs: ["ART-001"],
      evidenceClass: "HUMAN_CONFIRMED",
      limitations: ["Synthetic test case."],
      humanReviewStatus: "PENDING",
    };

    expect(scenarioFindingSchema.safeParse(finding).success).toBe(false);
  });

  it("requires provider and model provenance on ScenarioRun", () => {
    const run = {
      runId: "RUN-001",
      scenarioId: GOLDEN_SCENARIO_SPEC.scenarioId,
      scenarioHash: "b".repeat(64),
      provider: "mock",
      providerVersion: "1",
      model: "mock-reasoner",
      modelVersion: "",
      runtime: "ci",
      seed: null,
      parameters: {},
      inputArtifactRefs: [],
      startedAt: "2026-10-05T12:00:00.000Z",
      completedAt: null,
      status: "SUCCEEDED",
    };

    expect(scenarioRunSchema.safeParse(run).success).toBe(false);
  });
});
