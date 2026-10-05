export const EVIDENCE_CLASSES = [
  "OBSERVED",
  "SIMULATED",
  "INFERRED",
  "HYPOTHESIS",
  "HUMAN_CONFIRMED",
] as const;

export type EvidenceClass = (typeof EVIDENCE_CLASSES)[number];

export const EVIDENCE_SOURCE_KINDS = [
  "REAL_WORLD",
  "SYNTHETIC_FIXTURE",
  "SIMULATION",
  "MODEL_OUTPUT",
  "HUMAN_REVIEW",
] as const;

export type EvidenceSourceKind = (typeof EVIDENCE_SOURCE_KINDS)[number];

export const SCENARIO_USE_APPROVALS = [
  "APPROVED",
  "NOT_APPROVED",
  "NOT_REQUIRED",
] as const;

export type ScenarioUseApproval = (typeof SCENARIO_USE_APPROVALS)[number];

export type EvidenceProvenance = {
  ref: string;
  evidenceClass: EvidenceClass;
  sourceKind: EvidenceSourceKind;
  scenarioUseApproval: ScenarioUseApproval;
  sourceSha256?: string | null;
  note?: string | null;
};

/**
 * Enforces the V0 truth boundary before evidence can enter a compiled scenario.
 *
 * In particular, synthetic/model/simulation material can never be upgraded to
 * OBSERVED, and real-world material referenced as OBSERVED must be explicitly
 * approved for scenario use.
 */
export function assertEvidenceBoundary(evidence: EvidenceProvenance) {
  if (!evidence.ref.trim()) {
    throw new Error("Evidence provenance requires a non-empty ref");
  }

  if (
    evidence.sourceSha256 &&
    !/^[0-9a-f]{64}$/i.test(evidence.sourceSha256)
  ) {
    throw new Error(`Evidence provenance has an invalid SHA-256: ${evidence.ref}`);
  }

  if (
    evidence.evidenceClass === "OBSERVED" &&
    evidence.sourceKind !== "REAL_WORLD"
  ) {
    throw new Error(
      `Evidence ${evidence.ref} cannot be OBSERVED because its source is ${evidence.sourceKind}`
    );
  }

  if (
    evidence.evidenceClass === "OBSERVED" &&
    evidence.scenarioUseApproval !== "APPROVED"
  ) {
    throw new Error(
      `Observed evidence ${evidence.ref} is not approved for scenario use`
    );
  }
}
