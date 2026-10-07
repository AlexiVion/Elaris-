import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { Activity, FileText, ShieldCheck, TriangleAlert } from "lucide-react";
import { PageHeader } from "@/components/elaris/PageHeader";
import { SectionCard } from "@/components/elaris/SectionCard";
import { StatusPill } from "@/components/elaris/StatusPill";
import { ComponentHealthWorkbenchEmpty } from "@/components/platform/ComponentHealthWorkbenchEmpty";
import {
  componentSlug,
  loadActiveComponentHealthAnalysis,
  summarizeQualityFindings,
} from "@/lib/component-health/workbench-v04";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function ComponentHealthDraftReportPage() {
  noStore();
  const { artifact } = await loadActiveComponentHealthAnalysis();
  if (!artifact) {
    return <ComponentHealthWorkbenchEmpty title="Component Health · Draft Report" />;
  }

  const report = artifact.report;
  const qualityGroups = summarizeQualityFindings(report.quality.findings);
  const operationalPhases = report.phases.filter(
    (phase) => phase.phaseId !== report.reference.phaseId
  );

  return (
    <>
      <PageHeader
        title="Internal Draft Report"
        breadcrumb={
          <Link href="/platform/component-health/reports" className="hover:underline">
            Reports
          </Link>
        }
        actions={<StatusPill label="DRAFT · NOT APPROVED FOR EXPORT" tone="amber" />}
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Summary label="Analysis" value={report.run.analysisId} mono />
        <Summary label="Evidence" value={report.evidenceClass} />
        <Summary label="Context" value={report.contextEvidenceClass} />
        <Summary label="Reference" value="Same-session idle" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
        <SectionCard title="Assessment boundary" icon={ShieldCheck}>
          <div className="space-y-2 text-sm text-muted-foreground">
            {report.limitations.map((limitation) => (
              <div key={limitation} className="flex gap-3 rounded-md bg-muted/40 px-3 py-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-slate-400" />
                <span>{limitation}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Provenance summary" icon={FileText}>
          <div className="space-y-3 text-sm">
            <Pair label="Observed state" value={report.run.inputs.observed.sessionState} />
            <Pair label="Observed working copy" value={report.run.inputs.observed.workingCopyKind.replaceAll("_", " ")} />
            <Pair label="Observed source verification" value={report.run.inputs.observed.sourceIntegrity.method.replaceAll("_", " ")} />
            <Pair label="Baseline working copy" value={report.run.inputs.historicalBaseline.workingCopyKind.replaceAll("_", " ")} />
            <Pair label="Baseline source verification" value={report.run.inputs.historicalBaseline.sourceIntegrity.method.replaceAll("_", " ")} />
            <Pair label="Plaintext equivalence" value={report.run.inputs.observed.plaintextEquivalence.replaceAll("_", " ")} />
            <Pair label="Classification" value={report.sourceClassification} />
            <Pair label="Export" value="NOT APPROVED" />
          </div>
        </SectionCard>
      </div>

      <div className="mt-6">
        <SectionCard title="Phase overview" icon={Activity}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  {["Phase", "Frames", "Observed slots", "Observed start", "Observed end", "Max coverage"].map((heading) => (
                    <th key={heading} className="px-3 py-3 text-left text-xs font-medium text-muted-foreground">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {report.phases.map((phase) => {
                  const quality = report.quality.phaseQuality.find((item) => item.phaseId === phase.phaseId);
                  return (
                    <tr key={phase.phaseId} className="border-b border-border last:border-0">
                      <td className="px-3 py-3">
                        <div className="font-medium">{phase.label}</div>
                        <div className="mt-1 font-mono text-[11px] text-muted-foreground">{phase.phaseId}</div>
                      </td>
                      <td className="px-3 py-3">{phase.frameCount.toLocaleString()}</td>
                      <td className="px-3 py-3">{phase.observedComponentCount}/{phase.componentSlots}</td>
                      <td className="px-3 py-3 text-xs text-muted-foreground">{phase.observedTelemetryStart ?? "—"}</td>
                      <td className="px-3 py-3 text-xs text-muted-foreground">{phase.observedTelemetryEnd ?? "—"}</td>
                      <td className="px-3 py-3">{quality ? (quality.maxCoverage * 100).toFixed(1) + "%" : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>

      <div className="mt-6">
        <SectionCard title="Operational torque fingerprints" icon={Activity}>
          <div className="grid gap-4 lg:grid-cols-2">
            {operationalPhases.map((phase) => {
              const rows = (report.operationalFingerprints[phase.phaseId] ?? []).slice(0, 8);
              return (
                <div key={phase.phaseId} className="rounded-xl border border-border p-4">
                  <div className="text-sm font-semibold">{phase.label}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Top descriptive torque absP95 ratios vs same-session idle.
                  </div>
                  <div className="mt-4 space-y-2">
                    {rows.map((row) => (
                      <Link
                        key={row.oemIndex}
                        href={"/platform/component-health/components/" + componentSlug(row)}
                        className="flex items-center justify-between gap-3 rounded-md px-2 py-1.5 text-sm hover:bg-muted/40"
                      >
                        <span>[{String(row.oemIndex).padStart(2, "0")}] {row.componentName}</span>
                        <span className="font-semibold">×{row.ratio.toFixed(2)}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
        <SectionCard title="Quality review summary" icon={TriangleAlert}>
          <div className="space-y-3">
            {qualityGroups.map((group) => (
              <div key={group.severity + group.code} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
                <div>
                  <div className="text-xs font-semibold">{group.code.replaceAll("_", " ")}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{group.phaseCount} phases · {group.componentCount} components</div>
                </div>
                <StatusPill label={group.severity + " · " + group.count} tone={group.severity === "WARNING" ? "amber" : "slate"} />
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Review status" icon={ShieldCheck}>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>This draft is generated from locally verified V0.3 evidence.</p>
            <p>No owner approval, customer approval or export authorization is recorded.</p>
            <p>External delivery belongs to V0.5 and must remain a separate human-governed gate.</p>
          </div>
        </SectionCard>
      </div>
    </>
  );
}

function Summary({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={"mt-2 text-sm font-semibold " + (mono ? "font-mono text-xs" : "")}>{value}</div>
    </div>
  );
}

function Pair({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="text-muted-foreground">{label}</div>
      <div className="text-right font-medium">{value}</div>
    </div>
  );
}
