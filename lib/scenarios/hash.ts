import { sha256Canonical } from "@/lib/engine/hash";
import type { ScenarioSpec } from "./types";

function sortedUnique(values: readonly string[]) {
  return [...new Set(values)].sort();
}

/**
 * Canonical V0 scenario form.
 *
 * Arrays that represent sets are de-duplicated and sorted. Optional refs are
 * normalized to null, so omitted vs explicit null does not create a false
 * scenario difference.
 */
export function canonicalScenarioSpec(spec: ScenarioSpec): ScenarioSpec {
  return {
    ...spec,
    componentRefs: sortedUnique(spec.componentRefs),
    executionContextRef: spec.executionContextRef ?? null,
    observedEvidenceRefs: sortedUnique(spec.observedEvidenceRefs),
    assumptions: sortedUnique(spec.assumptions),
    disturbances: sortedUnique(spec.disturbances),
    failureHypotheses: sortedUnique(spec.failureHypotheses),
    humanExposure: spec.humanExposure ?? null,
    requestedCapabilities: sortedUnique(
      spec.requestedCapabilities
    ) as ScenarioSpec["requestedCapabilities"],
  };
}

/**
 * Hashes the complete canonical ScenarioSpec. V0 intentionally treats changes
 * to any spec field as a new scenario hash rather than guessing which metadata
 * is non-material.
 */
export function hashScenario(spec: ScenarioSpec) {
  return sha256Canonical(canonicalScenarioSpec(spec));
}
