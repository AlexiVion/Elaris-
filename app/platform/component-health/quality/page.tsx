import { unstable_noStore as noStore } from "next/cache";
import { ClipboardList, TriangleAlert } from "lucide-react";
import { PageHeader } from "@/components/elaris/PageHeader";
import { SectionCard } from "@/components/elaris/SectionCard";
import { StatusPill } from "@/components/elaris/StatusPill";
import { ComponentHealthWorkbenchEmpty } from "@/components/platform/ComponentHealthWorkbenchEmpty";
import {
  loadActiveComponentHealthAnalysis,
  summarizeQualityFindings,
} from "@/lib/component-health/workbench-v04";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function ComponentHealthQualityPage() {
  noStore();
  const { artifact } = await loadActiveComponentHealthAnalysis();
  if (!artifact) {
    return <ComponentHealthWorkbenchEmpty title="Component Health · Quality Review" />;
  }

  const report = artifact.report;
  const groups = summarizeQualityFindings(report.quality.findings);
  const warningCount = report.quality.findings.filter(
    (finding) => finding.severity === "WARNING"
  ).length;

  return (
    <>
      <PageHeader
        title="Quality Review"
        actions={
          <div className="flex items-center gap-2">
            <StatusPill label={warningCount + " WARNINGS"} tone={warningCount ? "amber" : "green"} />
            <StatusPill label={report.quality.findings.length + " QA RECORDS"} tone="gray" />
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
        <SectionCard title="Grouped findings" icon={ClipboardList}>
          <div className="space-y-4">
            {groups.map((group) => (
              <div key={group.severity + group.code} className="rounded-xl border border-border p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold">{group.code.replaceAll("_", " ")}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {group.phaseCount} phases · {group.componentCount} components
                      {group.signals.length ? " · " + group.signals.join(", ") : ""}
                    </div>
                  </div>
                  <StatusPill
                    label={group.severity + " · " + group.count}
                    tone={group.severity === "WARNING" ? "amber" : "gray"}
                  />
                </div>

                {group.examples.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {group.examples.map((example, index) => (
                      <div key={index} className="rounded-lg bg-muted/40 px-3 py-2 text-xs leading-5">
                        <div className="font-medium">
                          {[example.phaseId, example.componentId, example.signal].filter(Boolean).join(" · ") || "General"}
                        </div>
                        <div className="mt-1 text-muted-foreground">{example.message}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard title="Interpretation rule" icon={TriangleAlert}>
            <div className="space-y-3 text-sm leading-6 text-muted-foreground">
              <p>
                QA records describe evidence quality, timing, coverage, unresolved mappings or unconfirmed OEM semantics.
              </p>
              <p>
                They are not component failures, safety findings, anomaly scores or maintenance recommendations.
              </p>
              <p>
                V0.4 groups repeated records so an analyst can review patterns instead of treating every row as a separate robot problem.
              </p>
            </div>
          </SectionCard>

          <SectionCard title="Phase quality">
            <div className="space-y-3">
              {report.quality.phaseQuality.map((phase) => (
                <div key={phase.phaseId} className="rounded-lg border border-border p-3 text-xs">
                  <div className="font-semibold">{phase.phaseId.replaceAll("_", " ")}</div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-muted-foreground">
                    <span>Coverage</span><span className="text-right">{(phase.maxCoverage * 100).toFixed(1)}%</span>
                    <span>Missing slots</span><span className="text-right">{phase.missingComponentSlots}</span>
                    <span>Low coverage signals</span><span className="text-right">{phase.lowCoverageSignalCount}</span>
                    <span>Duplicate samples</span><span className="text-right">{phase.duplicateSignalSampleCount}</span>
                    <span>Max frame gap</span><span className="text-right">{phase.maxInterFrameGapMs == null ? "—" : phase.maxInterFrameGapMs.toFixed(0) + " ms"}</span>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </>
  );
}
