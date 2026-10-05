import {
  assertEvidenceBoundary,
  type EvidenceProvenance,
} from "./evidence-class";
import type {
  ScenarioProvenance,
  ScenarioSourceRef,
  ScenarioSpec,
} from "./types";

export const SCENARIO_COMPILER_VERSION = "scenario-compiler-v0";

export function collectScenarioSourceRefs(
  spec: ScenarioSpec
): ScenarioSourceRef[] {
  const refs: ScenarioSourceRef[] = [
    { kind: "ROBOT", ref: spec.robotRef },
    { kind: "CONFIGURATION", ref: spec.configurationRef },
    { kind: "BASELINE", ref: spec.baselineRef },
    { kind: "DEPLOYMENT", ref: spec.deploymentRef },
    { kind: "TASK", ref: spec.taskRef },
    { kind: "ENVIRONMENT", ref: spec.environmentRef },
    ...spec.componentRefs.map((ref) => ({ kind: "COMPONENT" as const, ref })),
    ...(spec.executionContextRef
      ? [{ kind: "EXECUTION_CONTEXT" as const, ref: spec.executionContextRef }]
      : []),
    ...spec.observedEvidenceRefs.map((ref) => ({
      kind: "OBSERVED_EVIDENCE" as const,
      ref,
    })),
  ];

  return refs;
}

export function validateEvidenceProvenance(
  spec: ScenarioSpec,
  evidence: readonly EvidenceProvenance[]
) {
  const byRef = new Map<string, EvidenceProvenance>();

  for (const item of evidence) {
    assertEvidenceBoundary(item);
    if (byRef.has(item.ref)) {
      throw new Error(`Duplicate evidence provenance ref: ${item.ref}`);
    }
    byRef.set(item.ref, item);
  }

  for (const ref of spec.observedEvidenceRefs) {
    const item = byRef.get(ref);
    if (!item) {
      throw new Error(
        `Observed evidence ref ${ref} is missing provenance`
      );
    }
    if (item.evidenceClass !== "OBSERVED") {
      throw new Error(
        `Scenario ref ${ref} is listed as observed but provenance is ${item.evidenceClass}`
      );
    }
  }

  return spec.observedEvidenceRefs.map((ref) => byRef.get(ref)!);
}

export function buildScenarioProvenance(
  spec: ScenarioSpec,
  scenarioHash: string,
  evidence: readonly EvidenceProvenance[]
): ScenarioProvenance {
  const observed = validateEvidenceProvenance(spec, evidence);

  return {
    compilerVersion: SCENARIO_COMPILER_VERSION,
    scenarioHash,
    compiledAt: spec.createdAt,
    sourceRefs: collectScenarioSourceRefs(spec),
    evidence: observed.map((item) => ({ ...item })),
  };
}
