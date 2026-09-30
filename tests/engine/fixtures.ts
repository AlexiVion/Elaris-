/**
 * Golden-scenario fixtures (spec §9.2 / §9.3), rebuilt from scratch — this is
 * the pristine pre-change state the impact engine test recreates. Independent
 * of the seed/DB.
 */
import type { ConfigItemInput, EvidenceInput, ApprovalInput } from "@/lib/domain/types";
import type { Slot } from "@/lib/domain/enums";

function ci(slot: Slot, value: string): ConfigItemInput {
  return { slot, value, vendor: null, version: null };
}

/** Snapshot C004 of G1 #017 (spec §9.2). */
export const C004: ConfigItemInput[] = [
  ci("CHASSIS", "Unitree G1"),
  ci("HANDS", "BrainCo Revo2"),
  ci("FIRMWARE", "1.4.2"),
  ci("CONTROL_STACK", "Humandroid Control v2.3"),
  ci("SKILL", "Valve Manipulation v4"),
  ci("AI_MODEL", "VLA-HM-12"),
  ci("NETWORK_PROFILE", "Plant Profile A"),
  ci("OPERATING_LIMITS", "Max speed 0.5 m/s in shared zone"),
];

/** C005: golden change CHG-0005 — HANDS + CONTROL_STACK changed (spec §9.3). */
export const C005: ConfigItemInput[] = C004.map((i) =>
  i.slot === "HANDS"
    ? ci("HANDS", "Inspire RH56DFX")
    : i.slot === "CONTROL_STACK"
      ? ci("CONTROL_STACK", "Humandroid Control v2.4")
      : i
);

type EvSeed = Omit<EvidenceInput, "applicable" | "archived"> &
  Partial<Pick<EvidenceInput, "applicable" | "archived">>;

const ev = (e: EvSeed): EvidenceInput => ({
  applicable: true,
  archived: false,
  uri: e.uri ?? null,
  ...e,
});

/** Evidence & requirements of DEP-0017 at their §9.3 (pre-change) states. */
export const DEP17_EVIDENCE: EvidenceInput[] = [
  ev({ code: "INT-042", title: "Integration test", category: "EVIDENCE", kind: "TEST", readinessCategory: "SAFETY_EVIDENCE", scopeSlots: ["HANDS", "CONTROL_STACK"], criticality: "HIGH", status: "VALID", required: true, uri: "u" }),
  ev({ code: "SAF-017", title: "Safety assessment", category: "REQUIREMENT", kind: "RISK_ASSESSMENT", readinessCategory: "SAFETY_EVIDENCE", scopeSlots: ["HANDS", "SKILL", "OPERATING_LIMITS"], criticality: "HIGH", status: "VALID", required: true }),
  ev({ code: "CTD-009", title: "Customer technical dossier", category: "EVIDENCE", kind: "TECHNICAL_DOSSIER", readinessCategory: "CUSTOMER_REQUIREMENTS", scopeSlots: ["HANDS", "FIRMWARE", "CONTROL_STACK"], criticality: "MEDIUM", status: "VALID", required: true, uri: "u" }),
  ev({ code: "INS-003", title: "Insurance appendix", category: "REQUIREMENT", kind: "INSURANCE_APPENDIX", readinessCategory: "INSURANCE", scopeSlots: ["HANDS"], criticality: "MEDIUM", status: "VALID", required: false }),
  ev({ code: "CAL-021", title: "Calibration record", category: "EVIDENCE", kind: "CALIBRATION", readinessCategory: "SAFETY_EVIDENCE", scopeSlots: ["HANDS"], criticality: "LOW", status: "VALID", required: true, uri: "u" }),
  ev({ code: "SZL-004", title: "Shared-zone operating limits", category: "REQUIREMENT", kind: "OPERATING_LIMIT", readinessCategory: "SAFETY_EVIDENCE", scopeSlots: ["HANDS", "OPERATING_LIMITS"], criticality: "LOW", status: "VALID", required: true }),
  ev({ code: "ESV-001", title: "Emergency stop validation", category: "EVIDENCE", kind: "TEST", readinessCategory: "SAFETY_EVIDENCE", scopeSlots: ["CHASSIS", "FIRMWARE"], criticality: "HIGH", status: "VALID", required: true, uri: null }),
  ev({ code: "SZR-002", title: "Shared-zone risk assessment", category: "REQUIREMENT", kind: "RISK_ASSESSMENT", readinessCategory: "SAFETY_EVIDENCE", scopeSlots: ["SAFETY_ZONE", "TASK_PARAMETERS"], criticality: "MEDIUM", status: "IN_REVIEW", required: true }),
  ev({ code: "NET-002", title: "Network access review", category: "REQUIREMENT", kind: "PROCEDURE", readinessCategory: "CONFIGURATION", scopeSlots: ["NETWORK_PROFILE"], criticality: "MEDIUM", status: "NOT_STARTED", required: true }),
  ev({ code: "OPT-005", title: "Operator training record", category: "REQUIREMENT", kind: "PROCEDURE", readinessCategory: "CUSTOMER_REQUIREMENTS", scopeSlots: ["TASK_PARAMETERS"], criticality: "MEDIUM", status: "MISSING", required: true }),
  ev({ code: "SAT-006", title: "Site acceptance test", category: "REQUIREMENT", kind: "TEST", readinessCategory: "CUSTOMER_REQUIREMENTS", scopeSlots: ["SAFETY_ZONE"], criticality: "MEDIUM", status: "MISSING", required: true }),
  ev({ code: "MNT-001", title: "Maintenance plan", category: "EVIDENCE", kind: "MAINTENANCE_PLAN", readinessCategory: "MAINTENANCE", scopeSlots: ["CHASSIS"], criticality: "LOW", status: "VALID", required: true, uri: "u" }),
];

/** Approvals of DEP-0017 (spec §9.3). */
export const DEP17_APPROVALS: ApprovalInput[] = [
  { id: "ap-safety", title: "Safety approval", readinessCategory: "SAFETY_EVIDENCE", role: "SAFETY_LEAD", scopeSlots: ["HANDS", "SKILL", "OPERATING_LIMITS"], status: "APPROVED" },
  { id: "ap-cust-eng", title: "Customer engineering approval", readinessCategory: "CUSTOMER_REQUIREMENTS", role: "CUSTOMER_ENGINEER", scopeSlots: ["HANDS", "CHASSIS"], status: "APPROVED" },
  { id: "ap-cust-tech", title: "Customer technical approval", readinessCategory: "CUSTOMER_REQUIREMENTS", role: "CUSTOMER_ENGINEER", scopeSlots: ["TASK_PARAMETERS", "SAFETY_ZONE"], status: "PENDING" },
];
