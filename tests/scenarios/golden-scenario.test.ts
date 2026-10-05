import { describe, expect, it } from "vitest";
import {
  applyScenarioTemplate,
  compileScenario,
  REDUCED_COMPONENT_PERFORMANCE_TEMPLATE,
} from "@/lib/scenarios";
import { GOLDEN_SCENARIO_SPEC } from "./fixtures";

describe("golden scenario — replay-first Unitree G1 left knee", () => {
  it("remains explicitly synthetic/hypothetical before Dataset #001", () => {
    const compiled = compileScenario({ spec: GOLDEN_SCENARIO_SPEC });

    expect(compiled.hash).toMatch(/^[0-9a-f]{64}$/);
    expect(compiled.spec.observedEvidenceRefs).toEqual([]);
    expect(compiled.provenance.evidence).toEqual([]);
    expect(compiled.spec.assumptions.join(" ")).toMatch(/synthetic replay data/i);
    expect(compiled.spec.failureHypotheses.join(" ")).toMatch(/requires review/i);
    expect(compiled.spec.requestedCapabilities).toEqual(["REASON"]);
  });

  it("can apply the generic reduced-performance template without adding facts", () => {
    const templated = applyScenarioTemplate(
      GOLDEN_SCENARIO_SPEC,
      REDUCED_COMPONENT_PERFORMANCE_TEMPLATE
    );
    const compiled = compileScenario({ spec: templated });

    expect(compiled.spec.observedEvidenceRefs).toEqual([]);
    expect(compiled.spec.assumptions).toEqual(expect.arrayContaining([
      expect.stringMatching(/hypothesis/i),
    ]));
    expect(compiled.spec.failureHypotheses).toEqual(expect.arrayContaining([
      expect.stringMatching(/may alter task execution/i),
    ]));
  });
});
