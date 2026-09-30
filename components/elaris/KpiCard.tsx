import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

/**
 * KPI card (spec §7.2). The delta line renders ONLY when a real, reconstructed
 * delta is provided — never invented (spec §6.7). Pass `delta={null}` to omit.
 */
export function KpiCard({
  label,
  value,
  icon: Icon,
  tone = "slate",
  delta,
  deltaLabel = "vs last 30 days",
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
  tone?: "slate" | "green" | "red" | "blue";
  delta?: number | null;
  deltaLabel?: string;
}) {
  const iconTone = {
    slate: "bg-slate-100 text-slate-600",
    green: "bg-emerald-50 text-emerald-600",
    red: "bg-red-50 text-red-600",
    blue: "bg-blue-50 text-blue-600",
  }[tone];

  return (
    <Card className="flex items-center gap-4 p-5">
      <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-lg", iconTone)}>
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-semibold">{value}</span>
          {delta != null && (
            <span className="text-xs text-muted-foreground">
              <span className={delta >= 0 ? "text-emerald-600" : "text-red-600"}>
                {delta >= 0 ? "↑" : "↓"} {Math.abs(delta)}
              </span>{" "}
              {deltaLabel}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
