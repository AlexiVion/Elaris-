/**
 * Impact rules (spec §6.3). Pure, data-only. No DB access, no LLM.
 *
 * - kind → suggested action (the table in §6.3)
 * - (kind, slot) → reason template, with a generic fallback
 * - global cyber-check + shared-area risk-assessment escalation predicates
 */
import type { DiffEntry } from "@/lib/domain/types";
import type { EvidenceKind, SuggestedAction, Slot, HumanExposure } from "@/lib/domain/enums";
import { SLOTS } from "@/lib/domain/enums";
import { slotLabel } from "@/lib/copy/labels";

/** kind → suggested action (spec §6.3 table). */
export const KIND_ACTION: Record<EvidenceKind, SuggestedAction> = {
  TEST: "RE_RUN",
  CALIBRATION: "RE_RUN",
  RISK_ASSESSMENT: "REVIEW",
  TECHNICAL_DOSSIER: "UPDATE",
  INSURANCE_APPENDIX: "REVIEW",
  OPERATING_LIMIT: "CONFIRM",
  CERTIFICATE: "REVIEW",
  PROCEDURE: "UPDATE",
  MAINTENANCE_PLAN: "REVIEW",
  OTHER: "REVIEW",
};

/** (kind, slot) → reason template (spec §6.3 examples + coherent extensions). */
const REASON_TEMPLATES: Partial<Record<EvidenceKind, Partial<Record<Slot, string>>>> = {
  TEST: {
    HANDS: "Hand interface changed",
    CONTROL_STACK: "Control stack changed — integration test affected",
    FIRMWARE: "Firmware changed — test re-run required",
  },
  RISK_ASSESSMENT: {
    HANDS: "New hand requires safety assessment update",
    OPERATING_LIMITS: "Operating limits changed — reassess risk",
    SAFETY_ZONE: "Safety zone changed — reassess risk",
  },
  TECHNICAL_DOSSIER: {
    HANDS: "Hardware change affects technical specification",
    FIRMWARE: "Firmware change affects technical specification",
    CONTROL_STACK: "Software change affects technical specification",
  },
  INSURANCE_APPENDIX: {
    HANDS: "Hardware change may affect insurance terms",
  },
  CALIBRATION: {
    HANDS: "New hand requires calibration record",
  },
  OPERATING_LIMIT: {
    HANDS: "Grasp characteristics may affect operating limits",
    OPERATING_LIMITS: "Operating limits changed — confirm limits",
  },
};

const SLOT_INDEX = new Map(SLOTS.map((s, i) => [s, i]));

/**
 * Pick the reason for an item, based on the first changed slot (in canonical
 * order) that is in the item's scope. Uses the (kind, slot) template, else the
 * generic "<Slot> changed: <before> → <after>" fallback (spec §6.3).
 */
export function reasonFor(
  kind: EvidenceKind,
  scopeSlots: Slot[],
  diff: DiffEntry[]
): string {
  const scope = new Set(scopeSlots);
  const relevant = diff
    .filter((d) => scope.has(d.slot))
    .sort((a, b) => SLOT_INDEX.get(a.slot)! - SLOT_INDEX.get(b.slot)!);

  const first = relevant[0];
  if (!first) return "Configuration changed";

  const template = REASON_TEMPLATES[kind]?.[first.slot];
  if (template) return template;

  const before = first.before ?? "—";
  const after = first.after ?? "—";
  return `${slotLabel[first.slot]} changed: ${before} → ${after}`;
}

/** Slots that trigger the "confirm no cyber impact" check (spec §6.3). */
export const CYBER_SLOTS: Slot[] = ["FIRMWARE", "CONTROL_STACK", "NETWORK_PROFILE"];

/** Slots that, under SHARED_AREA exposure, escalate risk assessments (spec §6.3). */
export const SHARED_AREA_RISK_SLOTS: Slot[] = ["HANDS", "OPERATING_LIMITS", "SAFETY_ZONE"];

export function triggersCyberCheck(changed: Set<Slot>): boolean {
  return CYBER_SLOTS.some((s) => changed.has(s));
}

export function triggersSharedAreaRiskEscalation(
  changed: Set<Slot>,
  humanExposure: HumanExposure
): boolean {
  return humanExposure === "SHARED_AREA" && SHARED_AREA_RISK_SLOTS.some((s) => changed.has(s));
}
