import Link from "next/link";
import { ArrowRight, FileCheck2 } from "lucide-react";
import { getHorizontalPlatformData } from "@/lib/db/platform";
import { MetricCard, Panel, ProductPageHeader, PrototypeNotice, StatusPill, WorkRow } from "@/components/platform/PrototypeUI";

export default async function AssessmentQueuePage() {
  const data = await getHorizontalPlatformData();
  const d = data.deployment;
  const openRequirements = d.requirements.filter((item) => item.status !== "VALID");
  const findings = openRequirements.filter((item) => ["MISSING", "NOT_STARTED", "IN_REVIEW", "REVIEW_REQUIRED"].includes(item.status));

  return (
    <>
      <ProductPageHeader
        eyebrow="Independent review workspace"
        title="Assessment Queue"
        description="A prototype for reviewing scope, submitted evidence, open findings and changes that may affect an assessment."
        aside={<StatusPill value="PROTOTYPE" />}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Assessments in review" value={1} tone="attention" />
        <MetricCard label="Requirements in scope" value={d.requirementCount} />
        <MetricCard label="Open findings" value={findings.length} tone={findings.length ? "attention" : "good"} />
        <MetricCard label="Changes since scope" value={data.portfolio.openChanges} tone={data.portfolio.openChanges ? "attention" : "good"} />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel title="Assessment work queue" description="ASMT-0017 is presentation-only; its scope is built from real DEP-0017 data.">
          <WorkRow
            title="ASMT-0017 · Valve Inspection Pilot"
            meta={`${d.code} · ${d.snapshotCode} · ${d.robot}`}
            status="AWAITING EVIDENCE"
            right={
              <Link href="/platform/evidence-review/assessments/ASMT-0017" className="inline-flex items-center gap-1 text-xs font-semibold text-violet-700">
                Review <ArrowRight className="size-3.5" />
              </Link>
            }
          />
          {findings.slice(0, 3).map((item) => (
            <WorkRow key={item.code} title={`${item.code} · ${item.title}`} meta={`${item.kind} · owner ${item.owner}`} status={item.status} />
          ))}
        </Panel>

        <Panel title="Assessment scope">
          <div className="flex items-start gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-violet-50 text-violet-700"><FileCheck2 className="size-5" /></span>
            <div>
              <div className="font-semibold">Deployment evidence review</div>
              <div className="mt-1 text-xs text-slate-500">Prototype scope · not a certification scheme</div>
            </div>
          </div>
          <div className="mt-5 space-y-3 text-sm">
            <Line label="System" value={d.robot} />
            <Line label="Deployment" value={d.code} />
            <Line label="Snapshot" value={d.snapshotCode} />
            <Line label="Task" value={d.task} />
            <Line label="Site" value={d.site} />
          </div>
          <Link href="/platform/evidence-review/assessments/ASMT-0017" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white">
            Open assessment <ArrowRight className="size-4" />
          </Link>
        </Panel>
      </div>

      <div className="mt-5"><PrototypeNotice>ASMT-0017 and reviewer findings are discovery objects only. Elaris is not asserting that any real standard or certification scheme applies.</PrototypeNotice></div>
    </>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between gap-4 border-b border-slate-100 pb-2 last:border-0"><span className="text-slate-500">{label}</span><span className="text-right font-medium">{value}</span></div>;
}
