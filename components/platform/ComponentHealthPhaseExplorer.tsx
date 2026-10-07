"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Activity } from "lucide-react";
import {
  operationalFingerprints,
  operationalPhaseMetadata,
  type OperationalPhaseId,
} from "@/lib/demo/component-health-field-data";
import { cn } from "@/lib/utils";

const phaseOrder: OperationalPhaseId[] = [
  "LOCOMOTION_FORWARD_BACK",
  "TURNING",
  "MIXED_OPERATION",
];

export function ComponentHealthPhaseExplorer() {
  const [phaseId, setPhaseId] = useState<OperationalPhaseId>("TURNING");
  const rows = operationalFingerprints[phaseId];
  const meta = operationalPhaseMetadata[phaseId];
  const maxRatio = Math.max(...rows.map((row) => row.ratio));

  const matrixRows = useMemo(() => {
    const indexes = new Set<number>();
    for (const phase of phaseOrder) {
      for (const row of operationalFingerprints[phase]) indexes.add(row.oemIndex);
    }

    return [...indexes]
      .sort((a, b) => a - b)
      .map((oemIndex) => {
        const first = phaseOrder
          .flatMap((phase) => operationalFingerprints[phase])
          .find((row) => row.oemIndex === oemIndex);

        return {
          oemIndex,
          component: first?.component ?? `OEM ${oemIndex}`,
          phases: Object.fromEntries(
            phaseOrder.map((phase) => [
              phase,
              operationalFingerprints[phase].find((row) => row.oemIndex === oemIndex) ?? null,
            ])
          ) as Record<OperationalPhaseId, (typeof operationalFingerprints)[OperationalPhaseId][number] | null>,
        };
      });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {phaseOrder.map((phase) => {
          const selected = phase === phaseId;
          return (
            <button
              key={phase}
              type="button"
              onClick={() => setPhaseId(phase)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                selected
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-border bg-card text-foreground hover:bg-muted"
              )}
            >
              {operationalPhaseMetadata[phase].label}
            </button>
          );
        })}
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Activity className="size-4 text-muted-foreground" />
              {meta.label}
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{meta.description}</p>
          </div>
          <div className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
            Same-session idle reference
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {rows.map((row) => {
            const width = Math.max(6, (row.ratio / maxRatio) * 100);
            return (
              <Link
                key={row.oemIndex}
                href={`/platform/component-health/components/joint-${String(row.oemIndex).padStart(2, "0")}-${slugFor(row.component)}`}
                className="block rounded-lg border border-border p-4 hover:bg-muted/30"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-sm font-semibold">
                    [{String(row.oemIndex).padStart(2, "0")}] {row.component}
                  </div>
                  <div className="text-sm font-semibold">×{row.ratio.toFixed(2)}</div>
                </div>

                <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-slate-900" style={{ width: `${width}%` }} />
                </div>

                <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
                  <span>Idle torque absP95: {row.idleTorque.toFixed(3)} N·m</span>
                  <span>Observed: {row.observedTorque.toFixed(3)} N·m</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="text-sm font-semibold">Cross-phase fingerprint matrix</div>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          Only sanitized aggregates already present in the real evidence demo are shown. A blank cell means that component is
          not part of the selected public aggregate set for that phase.
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Component</th>
                {phaseOrder.map((phase) => (
                  <th key={phase} className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                    {operationalPhaseMetadata[phase].label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrixRows.map((row) => (
                <tr key={row.oemIndex} className="border-b border-border last:border-0">
                  <td className="px-3 py-3 font-medium">
                    [{String(row.oemIndex).padStart(2, "0")}] {row.component}
                  </td>
                  {phaseOrder.map((phase) => {
                    const value = row.phases[phase];
                    return (
                      <td key={phase} className="px-3 py-3">
                        {value ? (
                          <span className={cn("inline-flex min-w-16 justify-center rounded-md px-2.5 py-1 text-xs font-semibold", ratioTone(value.ratio))}>
                            ×{value.ratio.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ratioTone(ratio: number) {
  if (ratio >= 15) return "bg-slate-900 text-white";
  if (ratio >= 8) return "bg-slate-700 text-white";
  if (ratio >= 4) return "bg-slate-200 text-slate-900";
  return "bg-slate-100 text-slate-700";
}

function slugFor(component: string) {
  return component.toLowerCase().replaceAll(" ", "-");
}
