import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { Activity, Bot, ClipboardCheck, Database, FileText, TriangleAlert } from "lucide-react";
import { PageHeader } from "@/components/elaris/PageHeader";
import { KpiCard } from "@/components/elaris/KpiCard";
import { SectionCard } from "@/components/elaris/SectionCard";
import { StatusPill } from "@/components/elaris/StatusPill";
import { ComponentHealthWorkbenchEmpty } from "@/components/platform/ComponentHealthWorkbenchEmpty";
import {
  fingerprintPrefix,
  loadActiveComponentHealthAnalysis,
  summarizeQualityFindings,
} from "@/lib/component-health/workbench-v04";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function ComponentHealthHome() {
  noStore();
  const { catalogue, artifact } = await loadActiveComponentHealthAnalysis();
  if (!artifact) {
    return <ComponentHealthWorkbenchEmpty />;
  }

  const report = artifact.report;
  const qualityGroups = summarizeQualityFindings(report.quality.findings);
  const warnings = report.quality.findings.filter(
    (finding) => finding.severity === "WARNING"
  ).length;
  const unresolved = report.phases[0]?.components.filter(
    (component) => component.slotStatus === "OBSERVED_UNRESOLVED_SLOT"
  ).length ?? 0;

  return (
    <>
      <PageHeader
        title="Component Health · Audit Workbench"
        actions={<StatusPill label="REAL V0.3 ARTIFACT · V0.4" tone="blue" />}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Private analyses" value={catalogue.analyses.length} icon={Database} tone="blue" delta={null} />
        <KpiCard label="Operational phases" value={report.phases.length} icon={ClipboardCheck} tone="green" delta={null} />
        <KpiCard label="Component slots" value={report.robot.componentSlots} icon={Bot} tone="slate" delta={null} />
        <KpiCard label="Quality warnings" value={warnings} icon={TriangleAlert} tone="red" delta={null} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
        <SectionCard title="Active AnalysisRun" icon={FileText}>
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <Fact label="Analysis ID" value={report.run.analysisId} mono />
            <Fact label="Fingerprint" value={fingerprintPrefix(report.run.inputFingerprint) + "…"} mono />
            <Fact label="Reference" value="Same-session IDLE_BASELINE" />
            <Fact label="Historical baseline" value="Secondary context only" />
            <Fact label="Evidence class" value={report.evidenceClass} />
            <Fact label="Classification" value={report.sourceClassification + " · export NOT APPROVED"} />
            <Fact label="Artifact copies" value={String(artifact.duplicateCopies)} />
            <Fact label="Report SHA-256" value={artifact.reportSha256.slice(0, 16) + "…"} mono />
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/platform/component-health/sessions" className="text-sm font-medium text-primary hover:underline">
              Open sessions →
            </Link>
            <Link href="/platform/component-health/components" className="text-sm font-medium text-primary hover:underline">
              Explore components →
            </Link>
            <Link href="/platform/component-health/phases" className="text-sm font-medium text-primary hover:underline">
              Explore phases →
            </Link>
            <Link href="/platform/component-health/quality" className="text-sm font-medium text-primary hover:underline">
              Review quality →
            </Link>
          </div>
        </SectionCard>

        <SectionCard title="Evidence boundary" icon={ClipboardCheck}>
          <div className="space-y-2 text-sm text-muted-foreground">
            <Boundary text="Descriptive operational evidence only." />
            <Boundary text="Same-session idle is the primary operational reference." />
            <Boundary text="No diagnosis, health score, anomaly score, failure probability or RUL." />
            <Boundary text="OEM voltage / temperature / state semantics remain explicitly unconfirmed where applicable." />
            <Boundary text="Private evidence is loaded server-side; export approval is independent." />
          </div>
        </SectionCard>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
        <SectionCard title="Phase coverage" icon={Activity}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  {["Phase", "Frames", "Observed slots", "Max coverage", "Observed end"].map((heading) => (
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
                      <td className="px-3 py-3 font-medium">{phase.label}</td>
                      <td className="px-3 py-3">{phase.frameCount.toLocaleString()}</td>
                      <td className="px-3 py-3">{phase.observedComponentCount} / {phase.componentSlots}</td>
                      <td className="px-3 py-3">{quality ? (quality.maxCoverage * 100).toFixed(1) + "%" : "—"}</td>
                      <td className="px-3 py-3 text-xs text-muted-foreground">{phase.observedTelemetryEnd ?? "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard title="Quality summary" icon={TriangleAlert}>
          <div className="space-y-3">
            {qualityGroups.slice(0, 6).map((group) => (
              <div key={group.severity + group.code} className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs font-semibold">{group.code.replaceAll("_", " ")}</div>
                  <StatusPill label={String(group.count)} tone={group.severity === "WARNING" ? "amber" : "gray"} />
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {group.phaseCount} phases · {group.componentCount} components
                </div>
              </div>
            ))}
          </div>
          <Link href="/platform/component-health/quality" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
            Review all quality groups →
          </Link>
        </SectionCard>
      </div>

      {catalogue.warnings.length > 0 && (
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          {catalogue.warnings.map((warning) => <div key={warning}>{warning}</div>)}
        </div>
      )}

      <div className="mt-6 text-xs text-muted-foreground">
        Unresolved slots in active reference snapshot: {unresolved}. Quality findings are evidence-QA records, not robot failure counts.
      </div>
    </>
  );
}

function Fact({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={"mt-1 font-medium " + (mono ? "font-mono text-xs" : "")}>{value}</div>
    </div>
  );
}

function Boundary({ text }: { text: string }) {
  return (
    <div className="flex gap-3 rounded-md bg-muted/40 px-3 py-2">
      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-slate-400" />
      <span>{text}</span>
    </div>
  );
}
