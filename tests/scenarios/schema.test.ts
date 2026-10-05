import { describe, expect, it } from "vitest";
import {
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
