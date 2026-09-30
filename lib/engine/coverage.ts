/**
 * Evidence coverage (spec §6.6). Pure. No DB access.
 *
 * Coverage = EVIDENCE-category applicable items with a uri AND status VALID,
 * divided by EVIDENCE-category applicable items. Displayed as
 * "X of Y applicable evidence items linked" with real numbers. Standard
 * rounding (§3.2): 12 of 18 → 67%.
 */
import type { EvidenceInput, CoverageResult } from "@/lib/domain/types";
import { roundPct } from "./round";

export function computeCoverage(evidence: EvidenceInput[]): CoverageResult {
  const applicableItems = evidence.filter((e) => e.category === "EVIDENCE" && e.applicable);
  const linkedItems = applicableItems.filter((e) => e.status === "VALID" && !!e.uri);

  const applicable = applicableItems.length;
  const linked = linkedItems.length;

  return {
    linked,
    applicable,
    percent: applicable === 0 ? 0 : roundPct((linked / applicable) * 100),
  };
}
