/**
 * Bridge Prisma rows → pure-engine inputs, and compute readiness/coverage for a
 * deployment. The engines never touch the DB; this is the only place that maps.
 */
import { parseSlots } from "@/lib/domain/json";
import type { EvidenceInput, ApprovalInput } from "@/lib/domain/types";
import type {
  EvidenceCategory,
  EvidenceKind,
  ReadinessCategory,
  Criticality,
  EvidenceStatus,
  ApprovalStatus,
  Role,
} from "@/lib/domain/enums";
import { computeReadiness, type ReadinessInput } from "@/lib/engine/readiness";
import { computeCoverage } from "@/lib/engine/coverage";

/** Minimal row shapes we read (structurally compatible with Prisma results). */
export interface EvidenceRow {
  code: string;
  title: string;
  category: string;
  kind: string;
  readinessCategory: string;
  scopeSlots: string;
  criticality: string;
  status: string;
  required: boolean;
  applicable: boolean;
  archivedAt: Date | null;
  uri: string | null;
}

export interface ApprovalRow {
  id: string;
  title: string;
  readinessCategory: string;
  role: string;
  scopeSlots: string;
  status: string;
}

export function toEvidenceInput(e: EvidenceRow): EvidenceInput {
  return {
    code: e.code,
    title: e.title,
    category: e.category as EvidenceCategory,
    kind: e.kind as EvidenceKind,
    readinessCategory: e.readinessCategory as ReadinessCategory,
    scopeSlots: parseSlots(e.scopeSlots),
    criticality: e.criticality as Criticality,
    status: e.status as EvidenceStatus,
    required: e.required,
    applicable: e.applicable,
    archived: e.archivedAt !== null,
    uri: e.uri,
  };
}

export function toApprovalInput(a: ApprovalRow): ApprovalInput {
  return {
    id: a.id,
    title: a.title,
    readinessCategory: a.readinessCategory as ReadinessCategory,
    role: a.role as Role,
    scopeSlots: parseSlots(a.scopeSlots),
    status: a.status as ApprovalStatus,
  };
}

export interface DeploymentMetricInputs {
  evidence: EvidenceRow[];
  approvals: ApprovalRow[];
  hasSerial: boolean;
  activeHashMatchesBaseline: boolean;
  /** A registered-but-unapproved change means newer config pending review. */
  hasPendingChange: boolean;
}

export function deploymentReadiness(inputs: DeploymentMetricInputs) {
  const readinessInput: ReadinessInput = {
    evidence: inputs.evidence.filter((e) => e.archivedAt === null).map(toEvidenceInput),
    approvals: inputs.approvals.map(toApprovalInput),
    identity: {
      hasSerial: inputs.hasSerial,
      activeHashMatchesBaseline: inputs.activeHashMatchesBaseline,
      hasNewerUnapprovedSnapshot: inputs.hasPendingChange,
    },
  };
  return computeReadiness(readinessInput);
}

export function deploymentCoverage(evidence: EvidenceRow[]) {
  return computeCoverage(evidence.filter((e) => e.archivedAt === null).map(toEvidenceInput));
}
