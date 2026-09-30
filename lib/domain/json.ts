/**
 * Typed (de)serialization helpers for the JSON-as-String columns (spec §5).
 * Keeping these in one place makes the SQLite→Postgres story explicit and
 * the parsing safe via Zod.
 */
import { z } from "zod";
import { SLOTS, type Slot } from "./enums";

const slotSchema = z.enum(SLOTS);
const slotArraySchema = z.array(slotSchema);

export function serializeSlots(slots: Slot[]): string {
  return JSON.stringify(slots);
}

export function parseSlots(raw: string | null | undefined): Slot[] {
  if (!raw) return [];
  const parsed = slotArraySchema.safeParse(JSON.parse(raw));
  return parsed.success ? parsed.data : [];
}

/** Generic pass-through for arbitrary JSON columns (diff, timelines, audit). */
export function serializeJson(value: unknown): string {
  return JSON.stringify(value ?? null);
}

export function parseJson<T = unknown>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}
