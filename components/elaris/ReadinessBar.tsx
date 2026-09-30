import { cn } from "@/lib/utils";

/** Readiness color thresholds — reinforcement only, always paired with the %. */
function barTone(percent: number): string {
  if (percent >= 80) return "bg-emerald-500";
  if (percent >= 50) return "bg-amber-500";
  return "bg-red-500";
}

export function ReadinessBar({
  percent,
  label = "Readiness",
  showLabel = true,
  className,
}: {
  percent: number;
  label?: string;
  showLabel?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">{label}</span>
          <span className="font-semibold tabular-nums">{percent}%</span>
        </div>
      )}
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label} ${percent}%`}
      >
        <div className={cn("h-full rounded-full", barTone(percent))} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
