import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { notFound } from "next/navigation";
import { Activity, FileSearch, ShieldCheck, TriangleAlert } from "lucide-react";
import { PageHeader } from "@/components/elaris/PageHeader";
import { SectionCard } from "@/components/elaris/SectionCard";
import { StatusPill } from "@/components/elaris/StatusPill";
import { ComponentHealthWorkbenchEmpty } from "@/components/platform/ComponentHealthWorkbenchEmpty";
import {
  findComponentBySlug,
  loadActiveComponentHealthAnalysis,
  summarizeQualityFindings,
} from "@/lib/component-health/workbench-v04";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function FieldComponentDetailPage({
  params,
}: {
  params: { componentId: string };
}) {
  noStore();
  const { artifact } = await loadActiveComponentHealthAnalysis();
  if (!artifact) {
    return <ComponentHealthWorkbenchEmpty title="Component Health · Component" />;
  }

  const report = artifact.report;
  const referenceComponent = findComponentBySlug(report, params.componentId);
  if (!referenceComponent) notFound();

  const phaseRows = report.phases.map((phase) => {
    const component = phase.components.find(
      (candidate) => candidate.oemIndex === referenceComponent.oemIndex
    );
    const torque = component?.comparisonsToIdle["joint.torque_estimate"] ?? null;
    const position = component?.signals["joint.position"].summary ?? null;
    const velocity = component?.signals["joint.velocity"].summary ?? null;
    const torqueSummary = component?.signals["joint.torque_estimate"].summary ?? null;

    return {
      phase,
      component,
      torque,
      position,
      velocity,
      torqueSummary,
    };
  });

  const unresolved = phaseRows.some(
    (row) => row.component?.slotStatus === "OBSERVED_UNRESOLVED_SLOT"
  );

  const componentFindings = report.quality.findings.filter(
    (finding) => finding.componentId === referenceComponent.componentId
  );
  const qualityGroups = summarizeQualityFindings(componentFindings);

  return (
    <>
      <PageHeader
        title={"[" + String(referenceComponent.oemIndex).padStart(2, "0") + "] " + referenceComponent.componentName}
        breadcrumb={
          <>
            <Link href="/platform/component-health/components" className="hover:underline">
              Components
            </Link>
            {" / "}
            {params.componentId}
          </>
        }
        actions={
          <StatusPill
            label={unresolved ? "UNRESOLVED EVIDENCE" : "OBSERVED TELEMETRY"}
            tone={unresolved ? "amber" : "green"}
          />
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
        <div className="space-y-6">
          <SectionCard title="Operational evidence across phases" icon={Activity}>
            <p className="mb-5 text-sm leading-6 text-muted-foreground">
              Every row comes from the active V0.3 evidence artifact. Ratios compare torque absP95 with the same-session
              IDLE_BASELINE reference and are descriptive only.
            </p>

            <div className="space-y-4">
              {phaseRows.map(({ phase, component, torque, position, velocity, torqueSummary }) => (
                <div key={phase.phaseId} className="rounded-xl border border-border p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold">{phase.label}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {component?.availability ?? "MISSING"} · {component?.slotStatus.replaceAll("_", " ") ?? "NOT OBSERVED"}
                      </div>
                    </div>
                    <StatusPill
                      label={
                        phase.phaseId === report.reference.phaseId
                          ? "REFERENCE"
                          : torque?.absP95Ratio == null
                            ? "NO RATIO"
                            : "×" + torque.absP95Ratio.toFixed(2)
                      }
                      tone={phase.phaseId === report.reference.phaseId ? "blue" : "slate"}
                    />
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-4">
                    <Metric
                      label="Position range"
                      value={position ? (position.max - position.min).toFixed(4) + " " + (position.unit ?? "") : "—"}
                    />
                    <Metric
                      label="Velocity absP95"
                      value={velocity ? velocity.absP95.toFixed(4) + " " + (velocity.unit ?? "") : "—"}
                    />
                    <Metric
                      label="Torque absP95"
                      value={torqueSummary ? torqueSummary.absP95.toFixed(4) + " " + (torqueSummary.unit ?? "") : "—"}
                    />
                    <Metric
                      label="Torque coverage"
                      value={torqueSummary ? (torqueSummary.coverage * 100).toFixed(1) + "%" : "—"}
                    />
                  </div>

                  {torque && (
                    <div className="mt-4 rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
                      Same-session idle torque absP95 {torque.baselineAbsP95.toFixed(4)} → observed {torque.observedAbsP95.toFixed(4)}
                      {" · "}
                      ratio ×{torque.absP95Ratio == null ? "—" : torque.absP95Ratio.toFixed(2)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Signal semantics" icon={ShieldCheck}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    {["Signal", "Semantic status", "Reference quality", "Reference coverage"].map((heading) => (
                      <th key={heading} className="px-3 py-3 text-left text-xs font-medium text-muted-foreground">
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(referenceComponent.signals).map(([signal, evidence]) => (
                    <tr key={signal} className="border-b border-border last:border-0">
                      <td className="px-3 py-3 font-mono text-xs">{signal}</td>
                      <td className="px-3 py-3 text-xs">{evidence.semanticsStatus.replaceAll("_", " ")}</td>
                      <td className="px-3 py-3 text-xs">{evidence.summary?.quality ?? "—"}</td>
                      <td className="px-3 py-3 text-xs">{evidence.summary ? (evidence.summary.coverage * 100).toFixed(1) + "%" : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard title="Component identity" icon={FileSearch}>
            <div className="space-y-3 text-sm">
              <Fact label="OEM index" value={String(referenceComponent.oemIndex).padStart(2, "0")} />
              <Fact label="Normalized component ID" value={referenceComponent.componentId} mono />
              <Fact label="Analysis" value={report.run.analysisId} mono />
              <Fact label="Reference phase" value={report.reference.phaseId} />
            </div>
          </SectionCard>

          <SectionCard title="Quality records" icon={TriangleAlert}>
            {qualityGroups.length === 0 ? (
              <p className="text-sm text-muted-foreground">No component-specific QA records.</p>
            ) : (
              <div className="space-y-3">
                {qualityGroups.map((group) => (
                  <div key={group.severity + group.code} className="rounded-lg border border-border p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-xs font-semibold">{group.code.replaceAll("_", " ")}</div>
                      <StatusPill
                        label={String(group.count)}
                        tone={group.severity === "WARNING" ? "amber" : "slate"}
                      />
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">{group.phaseCount} phases</div>
                  </div>
                ))}
              </div>
            )}
            <p className="mt-4 text-xs leading-5 text-muted-foreground">
              QA records describe evidence quality or semantics; they are not component failure diagnoses.
            </p>
          </SectionCard>
        </div>
      </div>
    </>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
  );
}

function Fact({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={"mt-1 break-all font-medium " + (mono ? "font-mono text-xs" : "")}>{value}</div>
    </div>
  );
}
