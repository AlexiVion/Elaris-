/**
 * Domain enums (spec §5). Stored as String in Prisma for SQLite→Postgres
 * portability; these const objects + unions are the single source of truth,
 * validated by Zod in lib/domain/schemas.ts.
 */

export const ROLES = ["ENGINEER", "SAFETY_LEAD", "CUSTOMER_ENGINEER", "VIEWER"] as const;
export type Role = (typeof ROLES)[number];

export const ROBOT_STATUS = ["ACTIVE", "INACTIVE"] as const;
export type RobotStatus = (typeof ROBOT_STATUS)[number];

export const ENVIRONMENT_TYPES = [
  "INDOOR_INDUSTRIAL",
  "GAS_FACILITY",
  "WAREHOUSE",
  "PUBLIC_SPACE",
  "LAB",
] as const;
export type EnvironmentType = (typeof ENVIRONMENT_TYPES)[number];

export const SLOTS = [
  "CHASSIS",
  "HANDS",
  "FIRMWARE",
  "CONTROL_STACK",
  "SKILL",
  "AI_MODEL",
  "NETWORK_PROFILE",
  "TASK_PARAMETERS",
  "SAFETY_ZONE",
  "OPERATING_LIMITS",
] as const;
export type Slot = (typeof SLOTS)[number];

export const DEPLOYMENT_CONTEXT_KINDS = [
  "COMMERCIAL_DEPLOYMENT",
  "INSTITUTIONAL_PLACEMENT",
  "INTERNAL_LAB",
  "DEMO",
] as const;
export type DeploymentContextKind = (typeof DEPLOYMENT_CONTEXT_KINDS)[number];

export const LIFECYCLES = ["TEST", "PILOT", "LIMITED", "PRODUCTION"] as const;
export type Lifecycle = (typeof LIFECYCLES)[number];

export const OPERATIONAL_STATES = ["PLANNED", "PRESENT", "LIVE", "PAUSED", "ENDED"] as const;
export type OperationalState = (typeof OPERATIONAL_STATES)[number];

export const OPERATING_MODES = ["SUPERVISED", "AUTONOMOUS_ZONED", "TELEOPERATED"] as const;
export type OperatingMode = (typeof OPERATING_MODES)[number];

export const HUMAN_EXPOSURES = ["NONE", "SEPARATED", "SHARED_AREA"] as const;
export type HumanExposure = (typeof HUMAN_EXPOSURES)[number];

export const EVIDENCE_CATEGORIES = ["EVIDENCE", "REQUIREMENT"] as const;
export type EvidenceCategory = (typeof EVIDENCE_CATEGORIES)[number];

export const EVIDENCE_KINDS = [
  "TEST",
  "CALIBRATION",
  "RISK_ASSESSMENT",
  "TECHNICAL_DOSSIER",
  "INSURANCE_APPENDIX",
  "OPERATING_LIMIT",
  "CERTIFICATE",
  "PROCEDURE",
  "MAINTENANCE_PLAN",
  "OTHER",
] as const;
export type EvidenceKind = (typeof EVIDENCE_KINDS)[number];

export const READINESS_CATEGORIES = [
  "SYSTEM_IDENTITY",
  "CONFIGURATION",
  "SAFETY_EVIDENCE",
  "CUSTOMER_REQUIREMENTS",
  "INSURANCE",
  "MAINTENANCE",
] as const;
export type ReadinessCategory = (typeof READINESS_CATEGORIES)[number];

export const EVIDENCE_SOURCES = ["INTERNAL", "CUSTOMER", "REGULATION", "INSURER"] as const;
export type EvidenceSource = (typeof EVIDENCE_SOURCES)[number];

export const CRITICALITIES = ["HIGH", "MEDIUM", "LOW"] as const;
export type Criticality = (typeof CRITICALITIES)[number];

export const EVIDENCE_STATUSES = [
  "VALID",
  "REVIEW_REQUIRED",
  "IN_REVIEW",
  "PENDING",
  "MISSING",
  "NOT_STARTED",
] as const;
export type EvidenceStatus = (typeof EVIDENCE_STATUSES)[number];

export const APPROVAL_STATUSES = [
  "APPROVED",
  "PENDING",
  "REQUIRED",
  "NOT_STARTED",
  "REVOKED",
] as const;
export type ApprovalStatus = (typeof APPROVAL_STATUSES)[number];

export const CHANGE_STATUSES = ["DRAFT", "REVIEW_REQUIRED", "APPROVED", "REJECTED"] as const;
export type ChangeStatus = (typeof CHANGE_STATUSES)[number];

export const IMPACT_TARGET_TYPES = ["EVIDENCE", "REQUIREMENT", "APPROVAL", "CHECK"] as const;
export type ImpactTargetType = (typeof IMPACT_TARGET_TYPES)[number];

export const SUGGESTED_ACTIONS = ["RE_RUN", "REVIEW", "UPDATE", "CONFIRM", "RE_APPROVE"] as const;
export type SuggestedAction = (typeof SUGGESTED_ACTIONS)[number];

export const SEVERITIES = ["HIGH", "MEDIUM", "LOW"] as const;
export type Severity = (typeof SEVERITIES)[number];

export const IMPACT_STATUSES = ["PENDING", "IN_REVIEW", "RESOLVED", "WAIVED"] as const;
export type ImpactStatus = (typeof IMPACT_STATUSES)[number];

export const INCIDENT_STATUSES = ["OPEN", "INVESTIGATING", "CLOSED"] as const;
export type IncidentStatus = (typeof INCIDENT_STATUSES)[number];

export const SHARE_VIEWS = ["SYSTEM_PASSPORT", "READINESS_PACK", "CHANGE_IMPACT"] as const;
export type ShareView = (typeof SHARE_VIEWS)[number];

export const DIFF_TYPES = ["ADDED", "REMOVED", "CHANGED"] as const;
export type DiffType = (typeof DIFF_TYPES)[number];
