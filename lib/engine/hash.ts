/**
 * Snapshot hashing (spec §6.1). Pure. No DB access.
 *
 * SHA-256 over the canonical JSON of the config items: object keys ordered,
 * items ordered by slot. Same items → same hash; changing any value → new hash.
 * Baselines reuse `sha256Canonical` over their frozen content.
 */
import { createHash } from "node:crypto";
import type { ConfigItemInput } from "@/lib/domain/types";
import { SLOTS } from "@/lib/domain/enums";

const SLOT_ORDER = new Map(SLOTS.map((s, i) => [s, i]));

/** Deterministically stringify a value with recursively sorted object keys. */
export function canonicalize(value: unknown): string {
  return JSON.stringify(sortDeep(value));
}

function sortDeep(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortDeep);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>).sort()) {
      out[key] = sortDeep((value as Record<string, unknown>)[key]);
    }
    return out;
  }
  return value;
}

/** SHA-256 (hex) of the canonical form of any JSON-serializable value. */
export function sha256Canonical(value: unknown): string {
  return createHash("sha256").update(canonicalize(value)).digest("hex");
}

/**
 * Canonical config-item form: items sorted by slot, each normalized to a
 * fixed key set so absent vendor/version don't change the hash spuriously.
 */
export function canonicalConfigItems(items: ConfigItemInput[]): Array<{
  slot: string;
  value: string;
  vendor: string | null;
  version: string | null;
}> {
  return [...items]
    .sort((a, b) => (SLOT_ORDER.get(a.slot)! - SLOT_ORDER.get(b.slot)!))
    .map((i) => ({
      slot: i.slot,
      value: i.value,
      vendor: i.vendor ?? null,
      version: i.version ?? null,
    }));
}

/** Snapshot hash: SHA-256 of the canonical config items (spec §6.1). */
export function hashSnapshot(items: ConfigItemInput[]): string {
  return sha256Canonical(canonicalConfigItems(items));
}
