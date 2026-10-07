import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { notFound } from "next/navigation";
import { Activity, Database, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/elaris/PageHeader";
import { SectionCard } from "@/components/elaris/SectionCard";
import { StatusPill } from "@/components/elaris/StatusPill";
import {
  fingerprintPrefix,
  loadComponentHealthWorkbench,
} from "@/lib/component-health/workbench-v04";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function ComponentHealthSessionDetail({
  params,
}: {
  params: { analysisId: string };
}) {
  noStore();
  const catalogue = await loadComponentHealthWorkbench();
  const analysisId = decodeURIComponent(params.analysisId);
  const artifact = catalogue.analyses.find((item) => item.analysisId === analysisId);
  if (!artifact) notFound();

  const report = artifact.report;
  const observed = report.run.inputs.observed;
  const baseline = report.run.inputs.historicalBaseline;

  return (
    <>
      <PageHeader
        title="Analysis Run"
        breadcrumb={
          <>
            <Link href="/platform/component-health/sessions" className="hover:underline">Sessions</Link>
            {" / "}
            {report.run.analysisId}
          </>
        }
        actions={<StatusPill label="VERIFIED LOCAL ARTIFACT" tone="green" />}
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
        <SectionCard title="Analysis identity" icon={Database}>
          <div className="grid gap-3 sm:grid-cols-2">
            <Fact label="Analysis ID" value={report.run.analysisId} mono />
            <Fact label="Input fingerprint" value={fingerprintPrefix(report.run.inputFingerprint) + "…"} mono />
            <Fact label="Schema" value={report.schemaVersion} />
            <Fact label="Evidence class" value={report.evidenceClass} />
            <Fact label="Primary reference" value={report.reference.rule} />
            <Fact label="Reference phase" value={report.reference.phaseId} />
            <Fact label="Historical baseline role" value={report.reference.historicalBaselineRole} />
            <Fact label="Private copies" value={String(artifact.duplicateCopies)} />
          </div>
        </SectionCard>

        <SectionCard title="Provenance boundary" icon={ShieldCheck}>
          <div className="space-y-3 text-sm">
            <Provenance
              title="Observed session"
              session={observed.sessionId}
              state={observed.sessionState}
              workingCopy={observed.workingCopyKind}
              sourceMethod={observed.sourceIntegrity.method}
              workingMethod={observed.workingCopyIntegrity.method}
              plaintext={observed.plaintextEquivalence}
            />
            <Provenance
              title="Historical baseline"
              session={baseline.sessionId}
              state={baseline.sessionState}
              workingCopy={baseline.workingCopyKind}
              sourceMethod={baseline.sourceIntegrity.method}
              workingMethod={baseline.workingCopyIntegrity.method}
              plaintext={baseline.plaintextEquivalence}
            />
          </div>
          <p className="mt-4 text-xs leading-5 text-muted-foreground">
            Registry SHA-256 values and verified-file lists remain server-side and are intentionally not rendered.
          </p>
        </SectionCard>
      </div>

      <div className="mt-6">
        <SectionCard title="Phase observations" icon={Activity}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  {["Phase", "Declared window", "Observed window", "Frames", "Slots", "Coverage"].map((heading) => (
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
                      <td className="px-3 py-3 text-xs text-muted-foreground">{phase.declaredStart}<br />{phase.declaredEnd}</td>
                      <td className="px-3 py-3 text-xs text-muted-foreground">{phase.observedTelemetryStart ?? "—"}<br />{phase.observedTelemetryEnd ?? "—"}</td>
                      <td className="px-3 py-3">{phase.frameCount.toLocaleString()}</td>
                      <td className="px-3 py-3">{phase.observedComponentCount}/{phase.componentSlots}</td>
                      <td className="px-3 py-3">{quality ? (quality.maxCoverage * 100).toFixed(1) + "%" : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>
    </>
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

function Provenance({
  title,
  session,
  state,
  workingCopy,
  sourceMethod,
  workingMethod,
  plaintext,
}: {
  title: string;
  session: string;
  state: string;
  workingCopy: string;
  sourceMethod: string;
  workingMethod: string;
  plaintext: string;
}) {
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="font-semibold">{title}</div>
      <div className="mt-2 grid gap-1 text-xs text-muted-foreground">
        <span className="font-mono">{session}</span>
        <span>{state} · {workingCopy.replaceAll("_", " ")}</span>
        <span>Source: {sourceMethod.replaceAll("_", " ")}</span>
        <span>Working: {workingMethod.replaceAll("_", " ")}</span>
        <span>Plaintext equivalence: {plaintext.replaceAll("_", " ")}</span>
      </div>
    </div>
  );
}
