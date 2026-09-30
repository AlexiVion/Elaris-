/**
 * THE GOLDEN TEST (spec §9.3, acceptance §10).
 * The impact engine over the golden scenario must return EXACTLY the expected
 * items, actions and severities — in order — and the counters 3 / 3 / 2 / 1.
 */
import { describe, it, expect } from "vitest";
import { diffSnapshots } from "@/lib/engine/diff";
import { computeImpact } from "@/lib/engine/impact";
import { C004, C005, DEP17_EVIDENCE, DEP17_APPROVALS } from "./fixtures";

describe("golden scenario — CHG-0005 (HANDS + CONTROL_STACK)", () => {
  const diff = diffSnapshots(C004, C005);
  const { items, counts } = computeImpact({
    diff,
    evidence: DEP17_EVIDENCE,
    approvals: DEP17_APPROVALS,
    humanExposure: "SHARED_AREA",
  });

  it("diffs exactly the two changed slots", () => {
    expect(diff).toEqual([
      { slot: "HANDS", before: "BrainCo Revo2", after: "Inspire RH56DFX", type: "CHANGED" },
      { slot: "CONTROL_STACK", before: "Humandroid Control v2.3", after: "Humandroid Control v2.4", type: "CHANGED" },
    ]);
  });

  it("produces exactly the nine expected impact items, in order", () => {
    const actual = items.map((i) => ({
      id: i.targetCode ?? i.title,
      type: i.targetType,
      action: i.suggestedAction,
      severity: i.severity,
    }));

    expect(actual).toEqual([
      { id: "INT-042", type: "EVIDENCE", action: "RE_RUN", severity: "HIGH" },
      { id: "SAF-017", type: "REQUIREMENT", action: "REVIEW", severity: "HIGH" },
      { id: "Safety approval", type: "APPROVAL", action: "RE_APPROVE", severity: "HIGH" },
      { id: "CTD-009", type: "EVIDENCE", action: "UPDATE", severity: "MEDIUM" },
      { id: "INS-003", type: "REQUIREMENT", action: "REVIEW", severity: "MEDIUM" },
      { id: "Customer engineering approval", type: "APPROVAL", action: "RE_APPROVE", severity: "MEDIUM" },
      { id: "CAL-021", type: "EVIDENCE", action: "RE_RUN", severity: "LOW" },
      { id: "SZL-004", type: "REQUIREMENT", action: "CONFIRM", severity: "LOW" },
      { id: "Confirm no cyber impact", type: "CHECK", action: "CONFIRM", severity: "LOW" },
    ]);
  });

  it("does not affect the untouched items", () => {
    const ids = new Set(items.map((i) => i.targetCode));
    for (const code of ["ESV-001", "SZR-002", "NET-002", "OPT-005", "SAT-006", "MNT-001"]) {
      expect(ids.has(code)).toBe(false);
    }
    // Customer technical approval (PENDING, no scope overlap) is not affected.
    expect(items.some((i) => i.title === "Customer technical approval")).toBe(false);
  });

  it("counts 3 evidence · 3 requirements · 2 approvals · 1 deployment", () => {
    expect(counts).toEqual({ evidence: 3, requirements: 3, approvals: 2, deployments: 1 });
  });

  it("uses the (kind, slot) reason templates from §6.3", () => {
    const byId = Object.fromEntries(items.map((i) => [i.targetCode ?? i.title, i.reason]));
    expect(byId["INT-042"]).toBe("Hand interface changed");
    expect(byId["SAF-017"]).toBe("New hand requires safety assessment update");
    expect(byId["CTD-009"]).toBe("Hardware change affects technical specification");
    expect(byId["INS-003"]).toBe("Hardware change may affect insurance terms");
    expect(byId["CAL-021"]).toBe("New hand requires calibration record");
    expect(byId["SZL-004"]).toBe("Grasp characteristics may affect operating limits");
  });
});
