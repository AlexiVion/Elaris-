import Link from "next/link";
import { ArrowRight, CircleAlert, GitCompareArrows, Siren } from "lucide-react";
import { getHorizontalPlatformData } from "@/lib/db/platform";
import { Panel, ProductPageHeader, PrototypeNotice, StatusPill } from "@/components/platform/PrototypeUI";

export default async function PlacementRenewalPage() {
  const data = await getHorizontalPlatformData();
  const d = data.deployment;
  const change = d.latestChange;
  const incident = d.latestIncident;

  return (
    <>
      <ProductPageHeader
        eyebrow="SUB-0042 · renewal / version reconciliation"
        title="What changed since the last submission?"
        description="Carry technical changes and incidents forward into renewal without forcing the broker or client to reconstruct the complete submission."
        aside={<StatusPill value="REVIEW REQUIRED" />}
      />

      <div className="grid gap-5 xl:grid-cols-[0.72fr_1.28fr]">
        <Panel title="Submission versions">
          <div className="space-y-4">
            <Version label="Previous market version" value="SUB-0042 · v1" meta="12 Jun 2026 · fictional submission snapshot" />
            <div className="ml-3 h-8 border-l-2 border-dashed border-slate-200" />
            <Version label="Renewal working version" value="SUB-0042 · v2" meta="01 Oct 2026 · reconcile changes before sharing" attention />
          </div>
        </Panel>

        <Panel title="Shared technical record now" description="These facts come from the same Elaris deployment used by the rest of the platform.">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Fact label="Deployment" value={d.code} />
            <Fact label="Baseline" value={d.baselineCode} />
            <Fact label="Configuration" value={d.snapshotCode} />
            <Fact label="Open impact" value={String(change?.openImpactItems ?? 0)} />
          </div>
        </Panel>
      </div>

      {change && (
        <div className="mt-5 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
          <Panel title={change.code + " · material configuration change"} description={change.beforeSnapshotCode + " → " + change.afterSnapshotCode}>
            <div className="space-y-3">
              {change.diff.map((item) => (
                <div key={item.slot} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{item.slot.replaceAll("_", " ")}</div>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                    <span className="rounded-lg bg-white px-2 py-1 font-medium">{item.before ?? "—"}</span>
                    <ArrowRight className="size-4 text-slate-400" />
                    <span className="rounded-lg bg-violet-50 px-2 py-1 font-semibold text-violet-900">{item.after ?? "—"}</span>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Broker renewal questions" description="Presentation layer: questions to refresh, not automatic insurance conclusions.">
            <div className="space-y-3">
              <ReviewItem title="Describe the new hand/end-effector" detail="Update exact component/version in the technical submission." />
              <ReviewItem title="Refresh control-stack evidence" detail="Confirm whether the change affects previously supplied technical evidence." />
              <ReviewItem title="Confirm site operating controls" detail="Ask whether operating mode or human-exposure controls changed." />
            </div>
          </Panel>
        </div>
      )}

      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_1fr]">
        <Panel title="Incident since prior submission" description="An event can be surfaced for disclosure/review without Elaris deciding coverage relevance.">
          {incident ? (
            <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4">
              <Siren className="mt-0.5 size-5 text-rose-700" />
              <div>
                <div className="text-sm font-semibold text-rose-950">{incident.code} · {incident.severity}</div>
                <p className="mt-1 text-sm leading-6 text-rose-900/75">{incident.description}</p>
                <div className="mt-2 text-xs text-rose-800">Status: {incident.status}</div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-slate-500">No incident is linked to the selected deployment.</div>
          )}
        </Panel>

        <Panel title="Renewal change summary" description="What the broker can carry into v2 before contacting markets.">
          <div className="space-y-3">
            <SummaryLine icon={<GitCompareArrows className="size-4" />} label="Material configuration change" value={change?.code ?? "None"} />
            <SummaryLine icon={<CircleAlert className="size-4" />} label="Open impact items" value={String(change?.openImpactItems ?? 0)} />
            <SummaryLine icon={<Siren className="size-4" />} label="Incident record" value={incident?.code ?? "None"} />
          </div>
          <Link href="/platform/placement-workspace/share" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white">
            Preview refreshed market pack <ArrowRight className="size-4" />
          </Link>
        </Panel>
      </div>

      <div className="mt-5">
        <PrototypeNotice>
          This page does not infer whether a change or incident is material to coverage, pricing or terms. It tests whether brokers want a versioned technical change summary at renewal.
        </PrototypeNotice>
      </div>
    </>
  );
}

function Version({ label, value, meta, attention = false }: { label: string; value: string; meta: string; attention?: boolean }) {
  return (
    <div className={attention ? "rounded-xl border border-violet-200 bg-violet-50 p-4" : "rounded-xl border border-slate-200 bg-slate-50 p-4"}>
      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
      <div className="mt-1 text-xs text-slate-500">{meta}</div>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="text-[11px] uppercase tracking-wide text-slate-400">{label}</div>
      <div className="mt-1 font-mono text-sm font-semibold">{value}</div>
    </div>
  );
}

function ReviewItem({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <div className="text-sm font-semibold">{title}</div>
      <div className="mt-1 text-xs leading-5 text-slate-500">{detail}</div>
    </div>
  );
}

function SummaryLine({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 border-b border-slate-100 pb-3 last:border-0">
      <span className="text-violet-600">{icon}</span>
      <span className="flex-1 text-sm text-slate-500">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}
