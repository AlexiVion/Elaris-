import { describe, it, expect } from "vitest";
import { computeCoverage } from "@/lib/engine/coverage";
import { roundPct } from "@/lib/engine/round";
import { DEP17_EVIDENCE } from "./fixtures";
import type { EvidenceInput } from "@/lib/domain/types";

const ev = (over: Partial<EvidenceInput>): EvidenceInput => ({
  code: "E", title: "e", category: "EVIDENCE", kind: "TEST", readinessCategory: "SAFETY_EVIDENCE",
  scopeSlots: [], criticality: "LOW", status: "VALID", required: true, applicable: true, archived: false, uri: "u",
  ...over,
});

describe("coverage (spec §6.6)", () => {
  it("golden DEP-0017: 4 of 5 EVIDENCE items linked (ESV-001 valid but no uri)", () => {
    const c = computeCoverage(DEP17_EVIDENCE);
    expect(c).toEqual({ linked: 4, applicable: 5, percent: 80 });
  });

  it("counts only EVIDENCE category (requirements excluded)", () => {
    const c = computeCoverage([ev({ category: "REQUIREMENT" }), ev({ code: "E2" })]);
    expect(c.applicable).toBe(1);
  });

  it("a VALID item without uri is not linked", () => {
    const c = computeCoverage([ev({ uri: null })]);
    expect(c).toEqual({ linked: 0, applicable: 1, percent: 0 });
  });

  it("a linked uri but non-VALID status is not linked", () => {
    const c = computeCoverage([ev({ status: "REVIEW_REQUIRED", uri: "u" })]);
    expect(c.linked).toBe(0);
  });

  it("excludes non-applicable items from the denominator", () => {
    const c = computeCoverage([ev({ applicable: false }), ev({ code: "E2" })]);
    expect(c.applicable).toBe(1);
  });

  it("no applicable evidence → 0 of 0, percent 0", () => {
    expect(computeCoverage([])).toEqual({ linked: 0, applicable: 0, percent: 0 });
  });

  it("standard rounding: 12 of 18 → 67%", () => {
    const items = Array.from({ length: 18 }, (_, i) => ev({ code: `E${i}`, uri: i < 12 ? "u" : null }));
    expect(computeCoverage(items).percent).toBe(67);
    expect(roundPct((12 / 18) * 100)).toBe(67);
  });
});
