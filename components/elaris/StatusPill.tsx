import { cn } from "@/lib/utils";
import type { Tone } from "@/lib/copy/labels";

/**
 * Status pill (spec §3.1). ALWAYS renders text; color is a reinforcement, not
 * the sole signal. AA-contrast tint + text combinations.
 */
const toneClasses: Record<Tone, string> = {
  green: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  amber: "bg-amber-50 text-amber-700 ring-amber-600/20",
  red: "bg-red-50 text-red-700 ring-red-600/20",
  blue: "bg-blue-50 text-blue-700 ring-blue-600/20",
  gray: "bg-slate-100 text-slate-600 ring-slate-500/20",
};

export function StatusPill({
  label,
  tone,
  className,
}: {
  label: string;
  tone: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        toneClasses[tone],
        className
      )}
    >
      {label}
    </span>
  );
}
