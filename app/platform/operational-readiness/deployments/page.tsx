import Link from "next/link";
import { ArrowRight, Boxes, Filter, Search } from "lucide-react";
import { getHorizontalPlatformData } from "@/lib/db/platform";
import { Panel, ProductPageHeader, StatusPill } from "@/components/platform/PrototypeUI";

export default async function BuyerDeploymentsPage() {
  const data = await getHorizontalPlatformData();

  return (
    <>
      <ProductPageHeader
        eyebrow="Portfolio"
        title="Deployments"
        description="Every robot deployment the buyer is evaluating or operating, with the exact baseline and open acceptance work attached."
        aside={
          <button type="button" className="cursor-default rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white">
            + Add deployment
          </button>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <div className="flex min-w-[280px] flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-400">
          <Search className="size-4" />
          Search deployments, robots, sites…
        </div>
        <button type="button" className="cursor-default inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700">
          <Filter className="size-4" /> Filters
        </button>
      </div>

      <Panel title="Buyer deployment portfolio" description={String(data.portfolio.deployments.length) + " deployments in the demo workspace"}>
        <div className="space-y-3">
          {data.portfolio.deployments.map((item) => {
            const href = item.code === "DEP-0017"
              ? "/platform/operational-readiness/deployments/" + item.code
              : "#";
            return (
              <Link
                key={item.code}
                href={href}
                className="grid gap-4 rounded-xl border border-slate-200 p-4 transition hover:border-slate-300 hover:bg-slate-50/60 lg:grid-cols-[44px_1.2fr_1fr_0.8fr_auto] lg:items-center"
              >
                <span className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  <Boxes className="size-5" />
                </span>
                <div>
                  <div className="text-sm font-semibold text-slate-950">{item.name}</div>
                  <div className="mt-1 text-xs text-slate-500">{item.code} · {item.customer} · {item.robot}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-900">{item.site}</div>
                  <div className="mt-1 text-xs text-slate-500">{item.task}</div>
                </div>
                <div>
                  <div className="font-mono text-xs text-slate-700">{item.baselineCode} · {item.snapshotCode}</div>
                  <div className="mt-1 text-xs text-slate-500">{item.lifecycle} · {item.operationalState}</div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusPill value={item.readinessStatus} />
                  {item.code === "DEP-0017" && <ArrowRight className="size-4 text-slate-400" />}
                </div>
              </Link>
            );
          })}
        </div>
      </Panel>

      <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-white/60 px-4 py-3 text-xs leading-5 text-slate-500">
        Demo behavior: DEP-0017 has the full buyer review workflow. The other deployments demonstrate a believable portfolio/list state without inventing buyer-specific persisted records.
      </div>
    </>
  );
}
