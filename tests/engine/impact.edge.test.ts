import { describe, it, expect } from "vitest";
import { computeImpact } from "@/lib/engine/impact";
import type { EvidenceInput, ApprovalInput, DiffEntry, ImpactEngineInput } from "@/lib/domain/types";

const baseEvidence = (over: Partial<EvidenceInput>): EvidenceInput => ({
  code: "EV-1",
  title: "Item",
  category: "EVIDENCE",
  kind: "TEST",
  readinessCategory: "SAFETY_EVIDENCE",
  scopeSlots: ["HANDS"],
  criticality: "MEDIUM",
  status: "VALID",
  required: true,
  applicable: true,
  archived: false,
  uri: null,
  ...over,
});

const handsDiff: DiffEntry[] = [{ slot: "HANDS", before: "A", after: "B", type: "CHANGED" }];

const run = (over: Partial<ImpactEngineInput>) =>
  computeImpact({ diff: handsDiff, evidence: [], approvals: [], humanExposure: "NONE", ...over });

describe("impact engine — edge cases (spec §10)", () => {
  it("empty diff → no impact, deployment count 0", () => {
    const { items, counts } = computeImpact({
      diff: [],
      evidence: [baseEvidence({})],
      approvals: [],
      humanExposure: "SHARED_AREA",
    });
    expect(items).toEqual([]);
    expect(counts).toEqual({ evidence: 0, requirements: 0, approvals: 0, deployments: 0 });
  });

  it("ADDED slot still triggers impact on items scoped to it", () => {
    const diff: DiffEntry[] = [{ slot: "SAFETY_ZONE", before: null, after: "Z", type: "ADDED" }];
    const { items } = run({ diff, evidence: [baseEvidence({ scopeSlots: ["SAFETY_ZONE"] })] });
    expect(items).toHaveLength(1);
  });

  it("REMOVED slot triggers impact", () => {
    const diff: DiffEntry[] = [{ slot: "SAFETY_ZONE", before: "Z", after: null, type: "REMOVED" }];
    const { items } = run({ diff, evidence: [baseEvidence({ scopeSlots: ["SAFETY_ZONE"] })] });
    expect(items).toHaveLength(1);
  });

  it("evidence with no scope overlap is ignored", () => {
    const { items } = run({ evidence: [baseEvidence({ scopeSlots: ["FIRMWARE"] })] });
    expect(items).toEqual([]);
  });

  it("evidence with empty scope is ignored", () => {
    const { items } = run({ evidence: [baseEvidence({ scopeSlots: [] })] });
    expect(items).toEqual([]);
  });

  it("archived evidence is ignored", () => {
    const { items } = run({ evidence: [baseEvidence({ archived: true })] });
    expect(items).toEqual([]);
  });

  it("non-applicable evidence is ignored", () => {
    const { items } = run({ evidence: [baseEvidence({ applicable: false })] });
    expect(items).toEqual([]);
  });

  it("only APPROVED approvals produce impact (revoked/pending ignored)", () => {
    const approvals: ApprovalInput[] = [
      { id: "a", title: "Revoked", readinessCategory: "SAFETY_EVIDENCE", role: "SAFETY_LEAD", scopeSlots: ["HANDS"], status: "REVOKED" },
      { id: "b", title: "Pending", readinessCategory: "SAFETY_EVIDENCE", role: "SAFETY_LEAD", scopeSlots: ["HANDS"], status: "PENDING" },
      { id: "c", title: "Approved", readinessCategory: "SAFETY_EVIDENCE", role: "SAFETY_LEAD", scopeSlots: ["HANDS"], status: "APPROVED" },
    ];
    const { items, counts } = run({ approvals });
    expect(items.map((i) => i.title)).toEqual(["Approved"]);
    expect(counts.approvals).toBe(1);
  });

  it("approval severity: SAFETY_LEAD → HIGH, CUSTOMER_ENGINEER → MEDIUM", () => {
    const approvals: ApprovalInput[] = [
      { id: "s", title: "Safety", readinessCategory: "SAFETY_EVIDENCE", role: "SAFETY_LEAD", scopeSlots: ["HANDS"], status: "APPROVED" },
      { id: "c", title: "Customer", readinessCategory: "CUSTOMER_REQUIREMENTS", role: "CUSTOMER_ENGINEER", scopeSlots: ["HANDS"], status: "APPROVED" },
    ];
    const { items } = run({ approvals });
    expect(items.find((i) => i.title === "Safety")?.severity).toBe("HIGH");
    expect(items.find((i) => i.title === "Customer")?.severity).toBe("MEDIUM");
  });

  it("no human exposure → no shared-area risk escalation", () => {
    const risk = baseEvidence({ code: "R-1", kind: "RISK_ASSESSMENT", criticality: "LOW", scopeSlots: ["HANDS"] });
    const { items } = run({ evidence: [risk], humanExposure: "NONE" });
    expect(items[0]?.severity).toBe("LOW"); // stays at its criticality
  });

  it("SHARED_AREA + HANDS escalates affected risk assessments to HIGH", () => {
    const risk = baseEvidence({ code: "R-1", kind: "RISK_ASSESSMENT", criticality: "LOW", scopeSlots: ["HANDS"] });
    const { items } = run({ evidence: [risk], humanExposure: "SHARED_AREA" });
    expect(items[0]?.severity).toBe("HIGH");
  });

  it("cyber check appears once when a cyber slot changes", () => {
    const diff: DiffEntry[] = [{ slot: "CONTROL_STACK", before: "v1", after: "v2", type: "CHANGED" }];
    const { items } = run({ diff });
    const checks = items.filter((i) => i.targetType === "CHECK");
    expect(checks).toHaveLength(1);
    expect(checks[0]).toMatchObject({ title: "Confirm no cyber impact", severity: "LOW", suggestedAction: "CONFIRM" });
  });

  it("requirement vs evidence targetType is taken from category", () => {
    const req = baseEvidence({ code: "REQ-1", category: "REQUIREMENT", kind: "PROCEDURE" });
    const { items, counts } = run({ evidence: [req] });
    expect(items[0]?.targetType).toBe("REQUIREMENT");
    expect(counts).toMatchObject({ evidence: 0, requirements: 1 });
  });
});
