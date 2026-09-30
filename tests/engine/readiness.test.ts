import { describe, it, expect } from "vitest";
import { computeReadiness, type ReadinessInput } from "@/lib/engine/readiness";
import { DEP17_EVIDENCE, DEP17_APPROVALS } from "./fixtures";
import type { EvidenceInput, ApprovalInput, ReadinessCategoryStatus } from "@/lib/domain/types";
import type { ReadinessCategory } from "@/lib/domain/enums";

function statusOf(input: ReadinessInput, category: ReadinessCategory): ReadinessCategoryStatus {
  return computeReadiness(input).categories.find((c) => c.category === category)!.status;
}

const identityReady = { hasSerial: true, activeHashMatchesBaseline: true, hasNewerUnapprovedSnapshot: false };

describe("readiness — golden DEP-0017 (spec §6.5, §9.3)", () => {
  const input: ReadinessInput = {
    evidence: DEP17_EVIDENCE,
    approvals: DEP17_APPROVALS,
    identity: { hasSerial: true, activeHashMatchesBaseline: true, hasNewerUnapprovedSnapshot: true },
  };
  const result = computeReadiness(input);
  const byCat = Object.fromEntries(result.categories.map((c) => [c.category, c.status]));

  it("computes the six category statuses", () => {
    expect(byCat).toEqual({
      SYSTEM_IDENTITY: "READY",
      CONFIGURATION: "REVIEW_REQUIRED", // newer C005 pending + NET-002 not started
      SAFETY_EVIDENCE: "REVIEW_REQUIRED", // SZR-002 in review
      CUSTOMER_REQUIREMENTS: "MISSING", // OPT-005 + SAT-006 missing
      INSURANCE: "NOT_REQUESTED", // INS-003 not required
      MAINTENANCE: "READY",
    });
  });

  it("computes readiness % = 9/14 = 64 (nothing hardcoded)", () => {
    expect(result.requiredTotal).toBe(14);
    expect(result.requiredSatisfied).toBe(9);
    expect(result.percent).toBe(64);
  });

  it("Customer requirements description reports the missing count", () => {
    const cat = result.categories.find((c) => c.category === "CUSTOMER_REQUIREMENTS")!;
    expect(cat.description).toBe("2 items missing");
  });
});

describe("readiness — category status rules (spec §6.5)", () => {
  const req = (over: Partial<EvidenceInput>): EvidenceInput => ({
    code: "E", title: "e", category: "REQUIREMENT", kind: "PROCEDURE", readinessCategory: "SAFETY_EVIDENCE",
    scopeSlots: [], criticality: "LOW", status: "VALID", required: true, applicable: true, archived: false, uri: null,
    ...over,
  });

  it("MISSING beats REVIEW_REQUIRED", () => {
    const input: ReadinessInput = {
      evidence: [req({ code: "A", status: "MISSING" }), req({ code: "B", status: "IN_REVIEW" })],
      approvals: [],
      identity: identityReady,
    };
    expect(statusOf(input, "SAFETY_EVIDENCE")).toBe("MISSING");
  });

  it("an undecided approval makes the category Review required", () => {
    const approvals: ApprovalInput[] = [
      { id: "a", title: "Safety", readinessCategory: "SAFETY_EVIDENCE", role: "SAFETY_LEAD", scopeSlots: [], status: "PENDING" },
    ];
    const input: ReadinessInput = { evidence: [req({ status: "VALID" })], approvals, identity: identityReady };
    expect(statusOf(input, "SAFETY_EVIDENCE")).toBe("REVIEW_REQUIRED");
  });

  it("all valid + approvals approved → Ready", () => {
    const approvals: ApprovalInput[] = [
      { id: "a", title: "Safety", readinessCategory: "SAFETY_EVIDENCE", role: "SAFETY_LEAD", scopeSlots: [], status: "APPROVED" },
    ];
    const input: ReadinessInput = { evidence: [req({ status: "VALID" })], approvals, identity: identityReady };
    expect(statusOf(input, "SAFETY_EVIDENCE")).toBe("READY");
  });

  it("no required items/approvals → Not requested", () => {
    const input: ReadinessInput = {
      evidence: [req({ readinessCategory: "INSURANCE", required: false })],
      approvals: [],
      identity: identityReady,
    };
    expect(statusOf(input, "INSURANCE")).toBe("NOT_REQUESTED");
  });

  it("non-revoked approvals count as required in %", () => {
    const approvals: ApprovalInput[] = [
      { id: "a", title: "x", readinessCategory: "SAFETY_EVIDENCE", role: "SAFETY_LEAD", scopeSlots: [], status: "APPROVED" },
      { id: "b", title: "y", readinessCategory: "SAFETY_EVIDENCE", role: "SAFETY_LEAD", scopeSlots: [], status: "REVOKED" },
    ];
    const result = computeReadiness({ evidence: [], approvals, identity: identityReady });
    expect(result.requiredTotal).toBe(1); // revoked excluded
    expect(result.percent).toBe(100);
  });

  it("System identity is Review required when active hash ≠ baseline", () => {
    const input: ReadinessInput = {
      evidence: [],
      approvals: [],
      identity: { hasSerial: true, activeHashMatchesBaseline: false, hasNewerUnapprovedSnapshot: false },
    };
    expect(statusOf(input, "SYSTEM_IDENTITY")).toBe("REVIEW_REQUIRED");
  });

  it("empty deployment → 100% readiness", () => {
    const result = computeReadiness({ evidence: [], approvals: [], identity: identityReady });
    expect(result.percent).toBe(100);
  });
});
