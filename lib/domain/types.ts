/**
 * Engine-facing domain types (spec §6). These are plain data shapes consumed
 * by the pure functions in lib/engine — deliberately decoupled from Prisma
 * models so the engine never touches the database.
 */
import type {
  Slot,
  DiffType,
  EvidenceCategory,
  EvidenceKind,
  ReadinessCategory,
  Criticality,
  EvidenceStatus,
  ApprovalStatus,
  Role,
  HumanExposure,
  ImpactTargetType,
  SuggestedAction,
  Severity,
} from "./enums";

/** A single configuration line inside a snapshot. */
export interface ConfigItemInput {
  slot: Slot;
  value: string;
  vendor?: string | null;
  version?: string | null;
}

/** One entry of a Before→After diff (spec §6.2). */
export interface DiffEntry {
  slot: Slot;
  before: string | null;
  after: string | null;
  type: DiffType;
}

/** Evidence/requirement item as the impact + readiness engines see it. */
export interface EvidenceInput {
  code: string;
  title: string;
  category: EvidenceCategory;
  kind: EvidenceKind;
  readinessCategory: ReadinessCategory;
  scopeSlots: Slot[];
  criticality: Criticality;
  status: EvidenceStatus;
  required: boolean;
  applicable: boolean;
  archived: boolean;
  uri?: string | null;
}

/** Approval as the impact + readiness engines see it. */
export interface ApprovalInput {
  id: string;
  title: string;
  readinessCategory: ReadinessCategory;
  role: Role;
  scopeSlots: Slot[];
  status: ApprovalStatus;
}

/** Full input to the impact engine (spec §6.3). */
export interface ImpactEngineInput {
  diff: DiffEntry[];
  evidence: EvidenceInput[];
  approvals: ApprovalInput[];
  humanExposure: HumanExposure;
}

/** One computed impact item (spec §6.3). targetCode is the human code or null (checks). */
export interface ImpactResult {
  targetType: ImpactTargetType;
  targetCode: string | null;
  title: string;
  reason: string;
  suggestedAction: SuggestedAction;
  severity: Severity;
}

/** The four Potential Impact counters (spec §7.4). */
export interface ImpactCounts {
  evidence: number;
  requirements: number;
  approvals: number;
  deployments: number;
}

export type ReadinessCategoryStatus = "READY" | "REVIEW_REQUIRED" | "MISSING" | "NOT_REQUESTED";

/** Per-category readiness row (spec §6.5). */
export interface ReadinessCategoryResult {
  category: ReadinessCategory;
  status: ReadinessCategoryStatus;
  description: string;
}

/** Whole-deployment readiness (spec §6.5). */
export interface ReadinessResult {
  percent: number; // 0..100, standard rounding
  requiredTotal: number;
  requiredSatisfied: number;
  categories: ReadinessCategoryResult[];
}

/** Evidence coverage (spec §6.6). */
export interface CoverageResult {
  linked: number;
  applicable: number;
  percent: number; // 0..100, standard rounding
}
