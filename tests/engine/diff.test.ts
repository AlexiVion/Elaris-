import { describe, it, expect } from "vitest";
import { diffSnapshots, changedSlots } from "@/lib/engine/diff";
import type { ConfigItemInput } from "@/lib/domain/types";

const item = (slot: ConfigItemInput["slot"], value: string): ConfigItemInput => ({
  slot,
  value,
  vendor: null,
  version: null,
});

describe("diffSnapshots (spec §6.2)", () => {
  it("returns [] when nothing changed", () => {
    const s = [item("HANDS", "A"), item("FIRMWARE", "1.0")];
    expect(diffSnapshots(s, s)).toEqual([]);
  });

  it("omits unchanged slots and reports only CHANGED", () => {
    const before = [item("HANDS", "A"), item("FIRMWARE", "1.0")];
    const after = [item("HANDS", "B"), item("FIRMWARE", "1.0")];
    expect(diffSnapshots(before, after)).toEqual([
      { slot: "HANDS", before: "A", after: "B", type: "CHANGED" },
    ]);
  });

  it("detects ADDED slots", () => {
    const before = [item("HANDS", "A")];
    const after = [item("HANDS", "A"), item("SAFETY_ZONE", "Z1")];
    expect(diffSnapshots(before, after)).toEqual([
      { slot: "SAFETY_ZONE", before: null, after: "Z1", type: "ADDED" },
    ]);
  });

  it("detects REMOVED slots", () => {
    const before = [item("HANDS", "A"), item("SAFETY_ZONE", "Z1")];
    const after = [item("HANDS", "A")];
    expect(diffSnapshots(before, after)).toEqual([
      { slot: "SAFETY_ZONE", before: "Z1", after: null, type: "REMOVED" },
    ]);
  });

  it("orders entries by canonical slot order", () => {
    const before = [item("OPERATING_LIMITS", "x"), item("HANDS", "A")];
    const after = [item("OPERATING_LIMITS", "y"), item("HANDS", "B")];
    expect(diffSnapshots(before, after).map((d) => d.slot)).toEqual(["HANDS", "OPERATING_LIMITS"]);
  });

  it("changedSlots collects touched slots", () => {
    const diff = diffSnapshots([item("HANDS", "A")], [item("HANDS", "B"), item("SKILL", "S")]);
    expect(changedSlots(diff)).toEqual(new Set(["HANDS", "SKILL"]));
  });
});
