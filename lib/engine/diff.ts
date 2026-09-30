/**
 * Snapshot diff (spec §6.2). Pure. No DB access.
 *
 * diff(before, after) → DiffEntry[] of { slot, before, after, type }.
 * Slots whose value is unchanged do not appear. Output is ordered by the
 * canonical slot order so results are deterministic.
 */
import type { ConfigItemInput, DiffEntry } from "@/lib/domain/types";
import { SLOTS, type Slot } from "@/lib/domain/enums";

const SLOT_INDEX = new Map(SLOTS.map((s, i) => [s, i]));

function toMap(items: ConfigItemInput[]): Map<Slot, string> {
  const m = new Map<Slot, string>();
  for (const i of items) m.set(i.slot, i.value);
  return m;
}

export function diffSnapshots(before: ConfigItemInput[], after: ConfigItemInput[]): DiffEntry[] {
  const b = toMap(before);
  const a = toMap(after);
  const slots = new Set<Slot>([...b.keys(), ...a.keys()]);
  const out: DiffEntry[] = [];

  for (const slot of slots) {
    const bv = b.has(slot) ? b.get(slot)! : null;
    const av = a.has(slot) ? a.get(slot)! : null;

    if (bv !== null && av !== null) {
      if (bv !== av) out.push({ slot, before: bv, after: av, type: "CHANGED" });
      // equal → omitted
    } else if (bv === null && av !== null) {
      out.push({ slot, before: null, after: av, type: "ADDED" });
    } else if (bv !== null && av === null) {
      out.push({ slot, before: bv, after: null, type: "REMOVED" });
    }
  }

  return out.sort((x, y) => (SLOT_INDEX.get(x.slot)! - SLOT_INDEX.get(y.slot)!));
}

/** Convenience: the set of slots touched by a diff (any ADDED/REMOVED/CHANGED). */
export function changedSlots(diff: DiffEntry[]): Set<Slot> {
  return new Set(diff.map((d) => d.slot));
}
