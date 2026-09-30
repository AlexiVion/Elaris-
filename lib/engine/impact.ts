/**
 * Impact engine (spec §6.3). Pure. No DB access, no LLM. Deterministic.
 *
 * Input: diff + applicable evidence/requirements + approvals + humanExposure.
 * Output: the ordered ImpactResult[] plus the four Potential Impact counters.
 */
import type {
  ImpactEngineInput,
  ImpactResult,
  ImpactCounts,
  DiffEntry,
} from "@/lib/domain/types";
import type { Severity } from "@/lib/domain/enums";
import { changedSlots as slotsOfDiff } from "./diff";
import {
  KIND_ACTION,
  reasonFor,
  triggersCyberCheck,
  triggersSharedAreaRiskEscalation,
} from "./rules";

const SEVERITY_RANK: Record<Severity, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };

function intersects<T>(a: T[], b: Set<T>): boolean {
  return a.some((x) => b.has(x));
}

export interface ImpactOutput {
  items: ImpactResult[];
  counts: ImpactCounts;
}

export function computeImpact(input: ImpactEngineInput): ImpactOutput {
  const changed = slotsOfDiff(input.diff);
  const items: ImpactResult[] = [];

  // 1) Evidence & requirements: applicable, not archived, scope ∩ changed ≠ ∅.
  for (const ev of input.evidence) {
    if (ev.archived || !ev.applicable) continue;
    if (!intersects(ev.scopeSlots, changed)) continue;

    items.push({
      targetType: ev.category, // EVIDENCE | REQUIREMENT
      targetCode: ev.code,
      title: ev.title,
      reason: reasonFor(ev.kind, ev.scopeSlots, input.diff),
      suggestedAction: KIND_ACTION[ev.kind],
      severity: ev.criticality,
    });
  }

  // 2) Approvals: only APPROVED ones whose scope overlaps the change.
  //    Severity HIGH if SAFETY_LEAD, MEDIUM if CUSTOMER_ENGINEER (else MEDIUM).
  for (const ap of input.approvals) {
    if (ap.status !== "APPROVED") continue;
    if (!intersects(ap.scopeSlots, changed)) continue;

    items.push({
      targetType: "APPROVAL",
      targetCode: null,
      title: ap.title,
      reason:
        ap.role === "SAFETY_LEAD"
          ? "Change overlaps an approved safety scope — re-approval required"
          : "Change overlaps an approved customer scope — re-approval required",
      suggestedAction: "RE_APPROVE",
      severity: ap.role === "SAFETY_LEAD" ? "HIGH" : "MEDIUM",
    });
  }

  // 3a) Shared-area escalation: every affected RISK_ASSESSMENT → HIGH.
  if (triggersSharedAreaRiskEscalation(changed, input.humanExposure)) {
    const riskCodes = new Set(
      input.evidence.filter((e) => e.kind === "RISK_ASSESSMENT").map((e) => e.code)
    );
    for (const it of items) {
      if (it.targetCode && riskCodes.has(it.targetCode)) it.severity = "HIGH";
    }
  }

  // 3b) Global cyber check (FIRMWARE / CONTROL_STACK / NETWORK_PROFILE).
  if (triggersCyberCheck(changed)) {
    items.push({
      targetType: "CHECK",
      targetCode: null,
      title: "Confirm no cyber impact",
      reason: "Firmware, control stack or network profile changed — confirm no cyber impact",
      suggestedAction: "CONFIRM",
      severity: "LOW",
    });
  }

  // 4) Order: severity HIGH→LOW, then code (coded items first, then
  //    approvals/checks by title).
  items.sort(compareImpact);

  return { items, counts: countImpact(items, input.diff) };
}

function compareImpact(a: ImpactResult, b: ImpactResult): number {
  const sev = SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity];
  if (sev !== 0) return sev;

  // Coded items before uncoded (approvals / checks).
  const aCoded = a.targetCode !== null;
  const bCoded = b.targetCode !== null;
  if (aCoded !== bCoded) return aCoded ? -1 : 1;

  if (aCoded && bCoded) return a.targetCode!.localeCompare(b.targetCode!);
  return a.title.localeCompare(b.title);
}

function countImpact(items: ImpactResult[], diff: DiffEntry[]): ImpactCounts {
  return {
    evidence: items.filter((i) => i.targetType === "EVIDENCE").length,
    requirements: items.filter((i) => i.targetType === "REQUIREMENT").length,
    approvals: items.filter((i) => i.targetType === "APPROVAL").length,
    // A change targets exactly one deployment; it is "affected" iff it has a diff.
    deployments: diff.length > 0 ? 1 : 0,
  };
}
