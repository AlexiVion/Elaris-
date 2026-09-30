import { describe, it, expect } from "vitest";
import {
  KIND_ACTION,
  reasonFor,
  triggersCyberCheck,
  triggersSharedAreaRiskEscalation,
} from "@/lib/engine/rules";
import type { DiffEntry } from "@/lib/domain/types";

describe("rules — kind → action (spec §6.3 table)", () => {
  it("maps every kind to its action", () => {
    expect(KIND_ACTION).toMatchObject({
      TEST: "RE_RUN",
      CALIBRATION: "RE_RUN",
      RISK_ASSESSMENT: "REVIEW",
      TECHNICAL_DOSSIER: "UPDATE",
      INSURANCE_APPENDIX: "REVIEW",
      OPERATING_LIMIT: "CONFIRM",
      CERTIFICATE: "REVIEW",
      PROCEDURE: "UPDATE",
      MAINTENANCE_PLAN: "REVIEW",
      OTHER: "REVIEW",
    });
  });
});

describe("rules — reasonFor (spec §6.3 templates)", () => {
  const handsDiff: DiffEntry[] = [
    { slot: "HANDS", before: "BrainCo Revo2", after: "Inspire RH56DFX", type: "CHANGED" },
  ];

  it("uses (kind, slot) templates", () => {
    expect(reasonFor("TEST", ["HANDS"], handsDiff)).toBe("Hand interface changed");
    expect(reasonFor("RISK_ASSESSMENT", ["HANDS"], handsDiff)).toBe(
      "New hand requires safety assessment update"
    );
  });

  it("falls back to '<Slot> changed: <before> → <after>' with no template", () => {
    const diff: DiffEntry[] = [{ slot: "AI_MODEL", before: "VLA-11", after: "VLA-12", type: "CHANGED" }];
    expect(reasonFor("OTHER", ["AI_MODEL"], diff)).toBe("AI model changed: VLA-11 → VLA-12");
  });

  it("picks the first changed slot in scope by canonical order", () => {
    const diff: DiffEntry[] = [
      { slot: "HANDS", before: "A", after: "B", type: "CHANGED" },
      { slot: "CONTROL_STACK", before: "v1", after: "v2", type: "CHANGED" },
    ];
    // HANDS precedes CONTROL_STACK → HANDS template chosen.
    expect(reasonFor("TECHNICAL_DOSSIER", ["CONTROL_STACK", "HANDS"], diff)).toBe(
      "Hardware change affects technical specification"
    );
  });
});

describe("rules — global predicates (spec §6.3)", () => {
  it("cyber check triggers on FIRMWARE/CONTROL_STACK/NETWORK_PROFILE", () => {
    expect(triggersCyberCheck(new Set(["CONTROL_STACK"]))).toBe(true);
    expect(triggersCyberCheck(new Set(["FIRMWARE"]))).toBe(true);
    expect(triggersCyberCheck(new Set(["HANDS"]))).toBe(false);
  });

  it("shared-area escalation needs SHARED_AREA + a risk slot", () => {
    expect(triggersSharedAreaRiskEscalation(new Set(["HANDS"]), "SHARED_AREA")).toBe(true);
    expect(triggersSharedAreaRiskEscalation(new Set(["HANDS"]), "SEPARATED")).toBe(false);
    expect(triggersSharedAreaRiskEscalation(new Set(["FIRMWARE"]), "SHARED_AREA")).toBe(false);
  });
});
