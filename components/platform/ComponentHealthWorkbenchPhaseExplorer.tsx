"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Activity } from "lucide-react";

export type WorkbenchPhaseExplorerPhase = {
  id: string;
  label: string;
  frameCount: number;
  observedStart: string | null;
  observedEnd: string | null;
  rows: Array<{
    slug: string;
    oemIndex: number;
    componentName: string;
    slotStatus: string;
    torqueIdleAbsP95: number | null;
    torqueObservedAbsP95: number | null;
    torqueRatio: number | null;
    torqueCoverage: number | null;
  }>;
};

export function ComponentHealthWorkbenchPhaseExplorer({
  phases,
  referencePhaseId,
}: {
  phases: WorkbenchPhaseExplorerPhase[];
  referencePhaseId: string;
}) {
  const firstOperational =
    phases.find((phase) => phase.id !== referencePhaseId)?.id ??
    phases[0]?.id ??
    "";
  const [selectedId, setSelectedId] = useState(firstOperational);

  const selected =
    phases.find((phase) => phase.id === selectedId) ?? phases[0] ?? null;

  const matrixComponents = useMemo(() => {
    const byIndex = new Map<
      number,
      { slug: string; name: string; oemIndex: number; maxRatio: number }
    >();

    for (const phase of phases) {
      for (const row of phase.rows) {
        const ratio = row.torqueRatio ?? 0;
        const current = byIndex.get(row.oemIndex);
        if (!current || ratio > current.maxRatio) {
          byIndex.set(row.oemIndex, {
            slug: row.slug,
            name: row.componentName,
            oemIndex: row.oemIndex,
            maxRatio: ratio,
          });
        }
      }
    }

    return [...byIndex.values()].sort(
      (a, b) => b.maxRatio - a.maxRatio || a.oemIndex - b.oemIndex
    );
  }, [phases]);

  if (!selected) {
    return <div className="text-sm text-muted-foreground">No phases available.</div>;
  }

  const rankedRows = [...selected.rows].sort((a, b) => {
    const ar = a.torqueRatio ?? -1;
    const br = b.torqueRatio ?? -1;
    return br - ar || a.oemIndex - b.oemIndex;
  });
  const maxRatio = Math.max(
    1,
    ...rankedRows.map((row) => row.torqueRatio ?? 0)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {phases.map((phase) => (
          <button
            type="button"
            key={phase.id}
            onClick={() => setSelectedId(phase.id)}
            className={
              "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors " +
              (phase.id === selected.id
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-border bg-background hover:bg-muted")
            }
          >
            {phase.label}
            {phase.id === referencePhaseId ? " · reference" : ""}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-border">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Activity className="size-4" />
              {selected.label}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {selected.frameCount.toLocaleString()} observed frame timestamps ·
              {" "}
              {selected.observedStart ?? "no observed start"} →{" "}
              {selected.observedEnd ?? "no observed end"}
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            Torque absP95 vs same-session idle
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {[
                  "OEM",
                  "Component",
                  "Status",
                  "Idle absP95",
                  "Observed absP95",
                  "Ratio",
                  "Coverage",
                  "Relative bar",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="px-4 py-3 text-left text-xs font-medium text-muted-foreground"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rankedRows.map((row) => {
                const ratio = row.torqueRatio;
                const width =
                  ratio == null
                    ? 0
                    : Math.max(3, Math.min(100, (ratio / maxRatio) * 100));

                return (
                  <tr
                    key={row.oemIndex}
                    className="border-b border-border last:border-0 hover:bg-muted/30"
                  >
                    <td className="px-4 py-3 font-mono text-xs">
                      {String(row.oemIndex).padStart(2, "0")}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      <Link
                        href={"/platform/component-health/components/" + row.slug}
                        className="hover:text-primary hover:underline"
                      >
                        {row.componentName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {row.slotStatus.replaceAll("_", " ")}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {formatValue(row.torqueIdleAbsP95)}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {formatValue(row.torqueObservedAbsP95)}
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      {ratio == null ? "—" : "×" + ratio.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {row.torqueCoverage == null
                        ? "—"
                        : (row.torqueCoverage * 100).toFixed(1) + "%"}
                    </td>
                    <td className="min-w-44 px-4 py-3">
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-slate-900"
                          style={{ width: width + "%" }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl border border-border">
        <div className="border-b border-border px-5 py-4">
          <div className="text-sm font-semibold">Cross-phase torque matrix</div>
          <div className="mt-1 text-xs text-muted-foreground">
            Complete 29-slot catalogue. Values are descriptive ratios against the same-session idle reference.
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Component
                </th>
                {phases.map((phase) => (
                  <th
                    key={phase.id}
                    className="px-3 py-3 text-right font-medium text-muted-foreground"
                  >
                    {phase.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrixComponents.map((component) => (
                <tr
                  key={component.oemIndex}
                  className="border-b border-border last:border-0"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={"/platform/component-health/components/" + component.slug}
                      className="font-medium hover:text-primary hover:underline"
                    >
                      [{String(component.oemIndex).padStart(2, "0")}]{" "}
                      {component.name}
                    </Link>
                  </td>
                  {phases.map((phase) => {
                    const row = phase.rows.find(
                      (candidate) =>
                        candidate.oemIndex === component.oemIndex
                    );
                    return (
                      <td
                        key={phase.id}
                        className="px-3 py-3 text-right font-mono"
                      >
                        {row?.torqueRatio == null
                          ? "—"
                          : "×" + row.torqueRatio.toFixed(2)}
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

function formatValue(value: number | null) {
  return value == null ? "—" : value.toFixed(3) + " N·m";
}
