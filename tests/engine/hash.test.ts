import { describe, it, expect } from "vitest";
import { hashSnapshot, sha256Canonical, canonicalize } from "@/lib/engine/hash";
import type { ConfigItemInput } from "@/lib/domain/types";
import { C004 } from "./fixtures";

describe("hashSnapshot (spec §6.1)", () => {
  it("is stable regardless of item order (same items → same hash)", () => {
    const reordered = [...C004].reverse();
    expect(hashSnapshot(reordered)).toBe(hashSnapshot(C004));
  });

  it("changes when any value changes", () => {
    const changed: ConfigItemInput[] = C004.map((i) =>
      i.slot === "FIRMWARE" ? { ...i, value: "1.4.3" } : i
    );
    expect(hashSnapshot(changed)).not.toBe(hashSnapshot(C004));
  });

  it("ignores absent vendor/version vs explicit null (canonical form)", () => {
    const withNulls = C004.map((i) => ({ ...i, vendor: null, version: null }));
    const withoutKeys = C004.map((i) => ({ slot: i.slot, value: i.value }) as ConfigItemInput);
    expect(hashSnapshot(withNulls)).toBe(hashSnapshot(withoutKeys));
  });

  it("produces a 64-char hex sha256", () => {
    expect(hashSnapshot(C004)).toMatch(/^[0-9a-f]{64}$/);
  });

  it("canonicalize sorts object keys deterministically", () => {
    expect(canonicalize({ b: 1, a: 2 })).toBe('{"a":2,"b":1}');
    expect(sha256Canonical({ a: 1, b: 2 })).toBe(sha256Canonical({ b: 2, a: 1 }));
  });
});
