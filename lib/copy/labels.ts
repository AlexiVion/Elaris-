/**
 * Display labels + pill tones for every enum token (spec §1.3, §3.1).
 * Pills ALWAYS render text — color never carries meaning alone. Tones:
 *   green  Ready · Approved · Live · Resolved · Valid
 *   amber  Review required · Pending · Medium · Required
 *   red    Missing · High
 *   blue   In review · Limited · Investigating
 *   gray   Not started · Not requested · Low · Closed · Test · Draft
 */

export type Tone = "green" | "amber" | "red" | "blue" | "gray";

interface Pill {
  label: string;
  tone: Tone;
}

const P = (label: string, tone: Tone): Pill => ({ label, tone });

/** Evidence/requirement item status. */
export const evidenceStatusPill: Record<string, Pill> = {
  VALID: P("Valid", "green"),
  REVIEW_REQUIRED: P("Review required", "amber"),
  IN_REVIEW: P("In review", "blue"),
  PENDING: P("Pending", "amber"),
  MISSING: P("Missing", "red"),
  NOT_STARTED: P("Not started", "gray"),
};

export const approvalStatusPill: Record<string, Pill> = {
  APPROVED: P("Approved", "green"),
  PENDING: P("Pending", "amber"),
  REQUIRED: P("Required", "amber"),
  NOT_STARTED: P("Not started", "gray"),
  REVOKED: P("Revoked", "gray"),
};

export const severityPill: Record<string, Pill> = {
  HIGH: P("High", "red"),
  MEDIUM: P("Medium", "amber"),
  LOW: P("Low", "gray"),
};

export const impactStatusPill: Record<string, Pill> = {
  PENDING: P("Pending", "amber"),
  IN_REVIEW: P("In review", "blue"),
  RESOLVED: P("Resolved", "green"),
  WAIVED: P("Waived", "gray"),
};

export const changeStatusPill: Record<string, Pill> = {
  DRAFT: P("Draft", "gray"),
  REVIEW_REQUIRED: P("Review required", "amber"),
  APPROVED: P("Approved", "green"),
  REJECTED: P("Rejected", "red"),
};

export const lifecyclePill: Record<string, Pill> = {
  TEST: P("Test", "gray"),
  PILOT: P("Pilot", "gray"),
  LIMITED: P("Limited", "blue"),
  PRODUCTION: P("Production", "green"),
};

export const operationalStatePill: Record<string, Pill> = {
  PLANNED: P("Planned", "gray"),
  PRESENT: P("Present", "blue"),
  LIVE: P("Live", "green"),
  PAUSED: P("Paused", "amber"),
  ENDED: P("Ended", "gray"),
};

export const incidentStatusPill: Record<string, Pill> = {
  OPEN: P("Open", "amber"),
  INVESTIGATING: P("Investigating", "blue"),
  CLOSED: P("Closed", "gray"),
};

export const readinessStatusPill: Record<string, Pill> = {
  READY: P("Ready", "green"),
  REVIEW_REQUIRED: P("Review required", "amber"),
  MISSING: P("Missing", "red"),
  NOT_REQUESTED: P("Not requested", "gray"),
};

export const robotStatusPill: Record<string, Pill> = {
  ACTIVE: P("Active", "green"),
  INACTIVE: P("Inactive", "gray"),
};

/** Plain human labels (no pill) for structural enums. */
export const deploymentContextKindLabel: Record<string, string> = {
  COMMERCIAL_DEPLOYMENT: "Commercial deployment",
  INSTITUTIONAL_PLACEMENT: "Institutional placement",
  INTERNAL_LAB: "Internal lab",
  DEMO: "Demo",
};

export const slotLabel: Record<string, string> = {
  CHASSIS: "Chassis",
  HANDS: "Hands",
  FIRMWARE: "Firmware",
  CONTROL_STACK: "Control stack",
  SKILL: "Skill",
  AI_MODEL: "AI model",
  NETWORK_PROFILE: "Network profile",
  TASK_PARAMETERS: "Task parameters",
  SAFETY_ZONE: "Safety zone",
  OPERATING_LIMITS: "Operating limits",
};

export const readinessCategoryLabel: Record<string, string> = {
  SYSTEM_IDENTITY: "System identity",
  CONFIGURATION: "Configuration",
  SAFETY_EVIDENCE: "Safety evidence",
  CUSTOMER_REQUIREMENTS: "Customer requirements",
  INSURANCE: "Insurance",
  MAINTENANCE: "Maintenance",
};

export const roleLabel: Record<string, string> = {
  ENGINEER: "Engineer",
  SAFETY_LEAD: "Safety Lead",
  CUSTOMER_ENGINEER: "Customer Engineer",
  VIEWER: "Viewer",
};

export const environmentLabel: Record<string, string> = {
  INDOOR_INDUSTRIAL: "Indoor industrial",
  GAS_FACILITY: "Gas facility",
  WAREHOUSE: "Warehouse",
  PUBLIC_SPACE: "Public space",
  LAB: "Lab",
};

export const operatingModeLabel: Record<string, string> = {
  SUPERVISED: "Supervised",
  AUTONOMOUS_ZONED: "Autonomous (zoned)",
  TELEOPERATED: "Teleoperated",
};

export const humanExposureLabel: Record<string, string> = {
  NONE: "None",
  SEPARATED: "Separated",
  SHARED_AREA: "Shared work area",
};

export const categoryLabel: Record<string, string> = {
  EVIDENCE: "Evidence",
  REQUIREMENT: "Requirement",
};

export const kindLabel: Record<string, string> = {
  TEST: "Test",
  CALIBRATION: "Calibration",
  RISK_ASSESSMENT: "Risk assessment",
  TECHNICAL_DOSSIER: "Technical dossier",
  INSURANCE_APPENDIX: "Insurance appendix",
  OPERATING_LIMIT: "Operating limit",
  CERTIFICATE: "Certificate",
  PROCEDURE: "Procedure",
  MAINTENANCE_PLAN: "Maintenance plan",
  OTHER: "Other",
};

export const criticalityLike: Record<string, string> = {
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
};

export const suggestedActionLabel: Record<string, string> = {
  RE_RUN: "Re-run",
  REVIEW: "Review",
  UPDATE: "Update",
  CONFIRM: "Confirm",
  RE_APPROVE: "Re-approve",
};
