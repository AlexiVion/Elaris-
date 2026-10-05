import { describe, expect, it } from "vitest";
import {
  buildScenarioProvenance,
  compileScenario,
  validateEvidenceProvenance,
  type EvidenceProvenance,
} from "@/lib/scenarios";
import {
  APPROVED_REAL_EVIDENCE,
  GOLDEN_SCENARIO_SPEC,
} from "./fixtures";

describe("Scenario provenance", () => {
  it("accepts approved real-world evidence as OBSERVED", () => {
    const spec = {
      ...GOLDEN_SCENARIO_SPEC,
      observedEvidenceRefs: [APPROVED_REAL_EVIDENCE.ref],
    };

    expect(
      validateEvidenceProvenance(spec, [APPROVED_REAL_EVIDENCE])
    ).toEqual([APPROVED_REAL_EVIDENCE]);
  });

  it("rejects unapproved real-world material as OBSERVED scenario input", () => {
    const unapproved: EvidenceProvenance = {
      ...APPROVED_REAL_EVIDENCE,
      scenarioUseApproval: "NOT_APPROVED",
    };
    const spec = {
      ...GOLDEN_SCENARIO_SPEC,
      observedEvidenceRefs: [unapproved.ref],
    };

    expect(() =>
      validateEvidenceProvenance(spec, [unapproved])
    ).toThrow(/not approved for scenario use/i);
  });

  it("rejects duplicate provenance refs instead of resolving them silently", () => {
    const spec = {
      ...GOLDEN_SCENARIO_SPEC,
      observedEvidenceRefs: [APPROVED_REAL_EVIDENCE.ref],
    };

    expect(() =>
      validateEvidenceProvenance(spec, [
        APPROVED_REAL_EVIDENCE,
        { ...APPROVED_REAL_EVIDENCE },
      ])
    ).toThrow(/duplicate evidence provenance ref/i);
  });

  it("keeps provenance deterministic and linked to the scenario hash", () => {
    const compiled = compileScenario({ spec: GOLDEN_SCENARIO_SPEC });
    const rebuilt = buildScenarioProvenance(
      compiled.spec,
      compiled.hash,
      []
    );

    expect(rebuilt).toEqual(compiled.provenance);
    expect(rebuilt.scenarioHash).toBe(compiled.hash);
    expect(rebuilt.compiledAt).toBe(GOLDEN_SCENARIO_SPEC.createdAt);
  });
});
