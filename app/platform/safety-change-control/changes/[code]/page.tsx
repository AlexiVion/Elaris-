import { ArrowRight, CheckCircle2, CircleAlert } from "lucide-react";
import Link from "next/link";
import { getHorizontalPlatformData } from "@/lib/db/platform";
import { Panel, ProductPageHeader, PrototypeNotice, StatusPill } from "@/components/platform/PrototypeUI";

export default async function SafetyChangeReviewPage({ params }: { params: { code: string } }) {
  const data = await getHorizontalPlatformData();
  const change = data.deployment.latestChange;

  if (!change || params.code !== change.code) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-6">Prototype only contains CHG-0005.</div>;
  }

  const groups = ["HIGH", "MEDIUM", "LOW"].map((severity) => ({
    severity,
    items: change.impactItems.filter((item) => item.severity === severity),
  }));

  return (
    <>
      <ProductPageHeader
        eyebrow="Safety change review"
        title={change.code}
        description="Review the real C004 → C005 change through a safety lens: what changed, what deserves review, what must be re-tested, and which named decisions remain open."
        aside={<StatusPill value={change.status} />}
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Before / After">
          <div className="grid gap-3 sm:grid-cols-2">
            <Snapshot label="Before" code={change.beforeSnapshotCode} />
            <Snapshot label="After" code={change.afterSnapshotCode} />
          </div>
          <div className="mt-5 space-y-2">
            {change.diff.map((diff) => (
              <div key={diff.slot} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">{diff.slot.replaceAll("_", " ")}</div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                  <span className="rounded-lg bg-white px-2 py-1 font-medium">{diff.before ?? "—"}</span>
                  <ArrowRight className="size-4 text-slate-400" />
                  <span className="rounded-lg bg-amber-100 px-2 py-1 font-semibold text-amber-900">{diff.after ?? "—"}</span>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Safety boundary" description="The engine identifies review obligations; it does not declare evidence invalid or the system unsafe.">
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <CircleAlert className="mt-0.5 size-5 text-amber-700" />
            <div>
              <div className="font-semibold text-amber-950">Potentially impacted — human review required</div>
              <p className="mt-1 text-sm leading-6 text-amber-900/80">
                The new hand and control stack intersect prior evidence, requirements and named approvals.
              </p>
            </div>
          </div>
          <div className="mt-5 space-y-3 text-sm">
            <Fact label="Author" value={change.author} />
            <Fact label="Open impact items" value={String(change.openImpactItems)} />
            <Fact label="Deployment" value={data.deployment.code} />
            <Fact label="Current baseline" value={data.deployment.baselineCode} />
          </div>
          <Link href="/platform/safety-change-control/retests" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-amber-800 hover:underline">
            Open re-test queue <ArrowRight className="size-4" />
          </Link>
        </Panel>
      </div>

      <div className="mt-5 space-y-5">
        {groups.map((group) => (
          <Panel key={group.severity} title={`${group.severity} impact`} description={`${group.items.length} review items`}>
            <div className="space-y-1">
              {group.items.map((item) => (
                <div key={item.title} className="grid gap-3 border-b border-slate-100 py-3 last:border-0 md:grid-cols-[1fr_150px_120px] md:items-center">
                  <div>
                    <div className="text-sm font-semibold">{item.title}</div>
                    <div className="mt-1 text-xs leading-5 text-slate-500">{item.reason}</div>
                  </div>
                  <div className="text-xs font-semibold text-slate-600">{item.suggestedAction.replaceAll("_", " ")}</div>
                  <StatusPill value={item.status} />
                </div>
              ))}
            </div>
          </Panel>
        ))}
      </div>

      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 size-5 text-emerald-600" />
          <div>
            <div className="font-semibold">Decision architecture</div>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Re-tests and evidence review may be completed by responsible owners, but named re-approvals remain independent human decisions before final change approval.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5"><PrototypeNotice>Safety-specific Hazard/Control relations are visual hypotheses. The Change + ImpactItem data above is real demo-core data.</PrototypeNotice></div>
    </>
  );
}

function Snapshot({ label, code }: { label: string; code: string }) {
  return <div className="rounded-xl border border-slate-200 p-4"><div className="text-xs text-slate-500">{label}</div><div className="mt-1 text-lg font-semibold">{code}</div></div>;
}
function Fact({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between gap-4 border-b border-slate-100 pb-2 last:border-0"><span className="text-slate-500">{label}</span><span className="font-medium">{value}</span></div>;
}
