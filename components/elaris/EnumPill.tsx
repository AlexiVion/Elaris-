import { StatusPill } from "./StatusPill";
import type { Tone } from "@/lib/copy/labels";

type PillMap = Record<string, { label: string; tone: Tone }>;

/**
 * Renders a StatusPill from an enum value using a label/tone map from
 * lib/copy/labels. Falls back to the raw value in gray if unknown, so the UI
 * never renders a bare color without text (spec §3.1).
 */
export function EnumPill({
  value,
  map,
  labelOverride,
  className,
}: {
  value: string;
  map: PillMap;
  labelOverride?: string;
  className?: string;
}) {
  const entry = map[value] ?? { label: value, tone: "gray" as Tone };
  return <StatusPill label={labelOverride ?? entry.label} tone={entry.tone} className={className} />;
}
