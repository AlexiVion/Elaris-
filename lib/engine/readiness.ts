/**
 * Readiness engine (spec §6.5). Pure. No DB access, no LLM.
 *
 * Six categories per deployment. Category status priority (top→bottom):
 *   MISSING  — a required item is MISSING
 *   REVIEW_REQUIRED — a required item is REVIEW_REQUIRED/IN_REVIEW/PENDING/
 *                     NOT_STARTED, or a category approval is not yet decided
 *   READY    — all required items VALID and category approvals APPROVED
 *   NOT_REQUESTED — the category has no required items/approvals
 *
 * System identity & Configuration also derive from data (serial + active-hash
 * vs. active baseline; a newer snapshot without an approved baseline). We assign
 * the "newer snapshot pending" signal to Configuration (config drift), while
 * System identity reflects identity verification (serial + hash match).
 *
 * Readiness % = required&applicable items VALID + non-revoked approvals APPROVED
 *             ÷ required&applicable items + non-revoked approvals. Standard round.
 */
import type {
  EvidenceInput,
  ApprovalInput,
  ReadinessResult,
  ReadinessCategoryStatus,
  ReadinessCategoryResult,
} from "@/lib/domain/types";
import { READINESS_CATEGORIES, type ReadinessCategory } from "@/lib/domain/enums";
import { readinessCategoryLabel } from "@/lib/copy/labels";
import { roundPct } from "./round";

export interface ReadinessIdentityInput {
  hasSerial: boolean;
  activeHashMatchesBaseline: boolean;
  hasNewerUnapprovedSnapshot: boolean;
}

export interface ReadinessInput {
  evidence: EvidenceInput[];
  approvals: ApprovalInput[];
  identity: ReadinessIdentityInput;
}

const OPEN_ITEM_STATUSES = new Set(["REVIEW_REQUIRED", "IN_REVIEW", "PENDING", "NOT_STARTED"]);
const RANK: Record<ReadinessCategoryStatus, number> = {
  NOT_REQUESTED: 0,
  READY: 1,
  REVIEW_REQUIRED: 2,
  MISSING: 3,
};

function worst(a: ReadinessCategoryStatus, b: ReadinessCategoryStatus): ReadinessCategoryStatus {
  return RANK[a] >= RANK[b] ? a : b;
}

/** Status from a category's required items + its non-revoked approvals. */
function statusFromItems(
  category: ReadinessCategory,
  evidence: EvidenceInput[],
  approvals: ApprovalInput[]
): { status: ReadinessCategoryStatus; missingCount: number } {
  const requiredItems = evidence.filter(
    (e) => e.readinessCategory === category && e.required && e.applicable
  );
  const catApprovals = approvals.filter(
    (a) => a.readinessCategory === category && a.status !== "REVOKED"
  );

  if (requiredItems.length === 0 && catApprovals.length === 0) {
    return { status: "NOT_REQUESTED", missingCount: 0 };
  }

  const missingCount = requiredItems.filter((e) => e.status === "MISSING").length;
  if (missingCount > 0) return { status: "MISSING", missingCount };

  const hasOpenItem = requiredItems.some((e) => OPEN_ITEM_STATUSES.has(e.status));
  const hasUndecidedApproval = catApprovals.some((a) => a.status !== "APPROVED");
  if (hasOpenItem || hasUndecidedApproval) return { status: "REVIEW_REQUIRED", missingCount: 0 };

  return { status: "READY", missingCount: 0 };
}

function describe(
  category: ReadinessCategory,
  status: ReadinessCategoryStatus,
  missingCount: number
): string {
  const label = readinessCategoryLabel[category] ?? category;
  switch (status) {
    case "NOT_REQUESTED":
      return `${label} not requested for this deployment`;
    case "MISSING":
      return `${missingCount} ${missingCount === 1 ? "item" : "items"} missing`;
    case "REVIEW_REQUIRED":
      return `Required ${label.toLowerCase()} under review`;
    case "READY":
      return `${label} verified`;
  }
}

export function computeReadiness(input: ReadinessInput): ReadinessResult {
  const { evidence, approvals, identity } = input;

  const categories: ReadinessCategoryResult[] = READINESS_CATEGORIES.map((category) => {
    const fromItems = statusFromItems(category, evidence, approvals);
    let status = fromItems.status;

    if (category === "SYSTEM_IDENTITY") {
      const base: ReadinessCategoryStatus =
        identity.hasSerial && identity.activeHashMatchesBaseline ? "READY" : "REVIEW_REQUIRED";
      status = worst(base, status);
    } else if (category === "CONFIGURATION") {
      const base: ReadinessCategoryStatus =
        identity.activeHashMatchesBaseline && !identity.hasNewerUnapprovedSnapshot
          ? "READY"
          : "REVIEW_REQUIRED";
      status = worst(base, status);
    }

    return { category, status, description: describe(category, status, fromItems.missingCount) };
  });

  // Whole-deployment %.
  const reqEvidence = evidence.filter((e) => e.required && e.applicable);
  const validEvidence = reqEvidence.filter((e) => e.status === "VALID");
  const reqApprovals = approvals.filter((a) => a.status !== "REVOKED");
  const approvedApprovals = reqApprovals.filter((a) => a.status === "APPROVED");

  const requiredTotal = reqEvidence.length + reqApprovals.length;
  const requiredSatisfied = validEvidence.length + approvedApprovals.length;
  const percent = requiredTotal === 0 ? 100 : roundPct((requiredSatisfied / requiredTotal) * 100);

  return { percent, requiredTotal, requiredSatisfied, categories };
}
