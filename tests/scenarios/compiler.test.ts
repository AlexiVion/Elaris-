import { describe, expect, it } from "vitest";
import {
  compileScenario,
  type EvidenceProvenance,
} from "@/lib/scenarios";
import {
  APPROVED_REAL_EVIDENCE,
  GOLDEN_SCENARIO_SPEC,
} from "./fixtures";

describe("Scenario Compiler V0", () => {
  it("produces the same hash for the same canonical input", () => {
    const first = compileScenario({ spec: GOLDEN_SCENARIO_SPEC });
    const second = compileScenario({
      spec: {
        ...GOLDEN_SCENARIO_SPEC,
        componentRefs: [...GOLDEN_SCENARIO_SPEC.componentRefs].reverse(),
        assumptions: [...GOLDEN_SCENARIO_SPEC.assumptions].reverse(),
        disturbances: [...GOLDEN_SCENARIO_SPEC.disturbances].reverse(),
      },
    });

    expect(first.hash).toBe(second.hash);
    expect(first.spec).toEqual(second.spec);
  });

  it("changes the hash when a material assumption changes", () => {
    const first = compileScenario({ spec: GOLDEN_SCENARIO_SPEC });
    const second = compileScenario({
      spec: {
        ...GOLDEN_SCENARIO_SPEC,
        assumptions: [
          ...GOLDEN_SCENARIO_SPEC.assumptions,
          "Payload is increased for this scenario.",
        ],
      },
    });

    expect(second.hash).not.toBe(first.hash);
  });

  it("rejects synthetic material when it is presented as OBSERVED", () => {
    const syntheticAsObserved: EvidenceProvenance = {
      ref: "fixture:unitree-g1-synthetic",
      evidenceClass: "OBSERVED",
      sourceKind: "SYNTHETIC_FIXTURE",
      scenarioUseApproval: "APPROVED",
    };

    expect(() =>
      compileScenario({
        spec: {
          ...GOLDEN_SCENARIO_SPEC,
          observedEvidenceRefs: [syntheticAsObserved.ref],
        },
        evidence: [syntheticAsObserved],
      })
    ).toThrow(/cannot be OBSERVED/i);
  });

  it("requires provenance for every observed evidence ref", () => {
    expect(() =>
      compileScenario({
        spec: {
          ...GOLDEN_SCENARIO_SPEC,
          observedEvidenceRefs: [APPROVED_REAL_EVIDENCE.ref],
        },
      })
    ).toThrow(/missing provenance/i);
  });

  it("preserves all structural source refs and approved observed evidence", () => {
    const compiled = compileScenario({
      spec: {
        ...GOLDEN_SCENARIO_SPEC,
        observedEvidenceRefs: [APPROVED_REAL_EVIDENCE.ref],
      },
      evidence: [APPROVED_REAL_EVIDENCE],
    });

    expect(compiled.provenance.sourceRefs).toEqual(expect.arrayContaining([
      { kind: "ROBOT", ref: GOLDEN_SCENARIO_SPEC.robotRef },
      { kind: "CONFIGURATION", ref: GOLDEN_SCENARIO_SPEC.configurationRef },
      { kind: "COMPONENT", ref: "component:unitree-g1:left-knee" },
      { kind: "OBSERVED_EVIDENCE", ref: APPROVED_REAL_EVIDENCE.ref },
    ]));
    expect(compiled.provenance.evidence).toEqual([APPROVED_REAL_EVIDENCE]);
  });

  it("freezes compiled source truth so downstream model output cannot mutate it", () => {
    const compiled = compileScenario({ spec: GOLDEN_SCENARIO_SPEC });

    expect(Object.isFrozen(compiled)).toBe(true);
    expect(Object.isFrozen(compiled.spec)).toBe(true);
    expect(Object.isFrozen(compiled.spec.assumptions)).toBe(true);

    expect(() => {
      (compiled.spec as { robotRef: string }).robotRef = "robot:mutated";
    }).toThrow();

    expect(compiled.spec.robotRef).toBe(GOLDEN_SCENARIO_SPEC.robotRef);
  });
});
