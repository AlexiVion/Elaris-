import Link from "next/link";
import { ArrowRight, GitCompareArrows, RotateCcw } from "lucide-react";
import { getHorizontalPlatformData } from "@/lib/db/platform";
import { Panel, ProductPageHeader, StatusPill } from "@/components/platform/PrototypeUI";

export default async function BuyerChangesPage() {
  const data = await getHorizontalPlatformData();
  const d = data.deployment;
  const change = d.latestChange;

  return (
    <>
      <ProductPageHeader
        eyebrow="Lifecycle monitoring"
        title="Changes Since Acceptance"
        description="Material configuration changes are translated into buyer-side review questions so only affected gates need to reopen."
        aside={<StatusPill value={change ? change.status : "READY"} />}
      />

      {change ? (
        <>
          <div className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
            <Panel title={change.code + " · Material configuration change"} description={change.beforeSnapshotCode + " → " + change.afterSnapshotCode}>
              <div className="space-y-3">
                {change.diff.map((diff) => (
                  <div key={diff.slot} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{diff.slot.replaceAll("_", " ")}</div>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                      <span className="rounded-lg bg-white px-2 py-1 font-medium">{diff.before ?? "—"}</span>
                      <ArrowRight className="size-4 text-slate-400" />
                      <span className="rounded-lg bg-blue-50 px-2 py-1 font-semibold text-blue-900">{diff.after ?? "—"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="Buyer impact summary" description="Derived from the shared Change Impact record, presented through acceptance gates.">
              <div className="space-y-3">
                <GateImpact gate="Safety / EHS" status="REOPEN" reason="Safety assessment and named safety approval are affected." />
                <GateImpact gate="Procurement / Customer" status="REOPEN" reason="Customer technical dossier and engineering approval need review." />
                <GateImpact gate="IT / Cyber" status="CONFIRM" reason="Control-stack change requires a cyber-impact confirmation." />
                <GateImpact gate="Operations" status="MONITOR" reason="Operating limits must be confirmed before acceptance remains current." />
              </div>
            </Panel>
          </div>

          <div className="mt-5">
            <Panel title="Shared impact items" description={String(change.openImpactItems) + " open items in the underlying Elaris change record."}>
              <div className="space-y-1">
                {change.impactItems.map((item) => (
                  <div key={item.title} className="grid gap-3 border-b border-slate-100 py-3 last:border-0 md:grid-cols-[1fr_130px_110px] md:items-center">
                    <div>
                      <div className="text-sm font-semibold">{item.title}</div>
                      <div className="mt-1 text-xs text-slate-500">{item.reason}</div>
                    </div>
                    <div className="text-xs font-semibold text-slate-600">{item.suggestedAction.replaceAll("_", " ")}</div>
                    <StatusPill value={item.status} />
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-start gap-3">
              <RotateCcw className="mt-0.5 size-5 text-blue-700" />
              <div>
                <div className="text-sm font-semibold">Acceptance is now stale for affected gates</div>
                <div className="mt-1 text-xs text-slate-500">Re-review only the affected functions; preserve the prior decision record.</div>
              </div>
            </div>
            <Link href="/platform/operational-readiness/acceptance" className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white">
              Re-open acceptance <ArrowRight className="size-4" />
            </Link>
          </div>
        </>
      ) : (
        <Panel title="No material changes"><div className="text-sm text-slate-500">No buyer-side review is required.</div></Panel>
      )}
    </>
  );
}

function GateImpact({ gate, status, reason }: { gate: string; status: string; reason: string }) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          <GitCompareArrows className="mt-0.5 size-4 text-blue-600" />
          <div>
            <div className="text-sm font-semibold text-slate-900">{gate}</div>
            <div className="mt-1 text-xs leading-5 text-slate-500">{reason}</div>
          </div>
        </div>
        <StatusPill value={status} />
      </div>
    </div>
  );
}
