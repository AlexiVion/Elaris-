import Link from "next/link";
import { ArrowRight, CalendarDays, Filter, Inbox } from "lucide-react";
import { getHorizontalPlatformData } from "@/lib/db/platform";
import { RequestEvidenceButton } from "@/components/platform/OperationalDemoControls";
import { Panel, ProductPageHeader, StatusPill } from "@/components/platform/PrototypeUI";

export default async function BuyerReviewQueuePage() {
  const data = await getHorizontalPlatformData();
  const queue = data.portfolio.reviewQueue;
  const high = queue.filter((item) => item.priority === "HIGH").length;
  const medium = queue.filter((item) => item.priority === "MEDIUM").length;

  return (
    <>
      <ProductPageHeader
        eyebrow="Work management"
        title="Review Queue"
        description="A single queue for missing evidence, requirements, approvals and material changes that need buyer-side action."
        aside={
          <button type="button" className="cursor-default inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700">
            <Filter className="size-4" /> Filter queue
          </button>
        }
      />

      <div className="mb-5 flex flex-wrap gap-2">
        <QueueChip label="All open" value={queue.length} active />
        <QueueChip label="High priority" value={high} />
        <QueueChip label="Medium" value={medium} />
        <QueueChip label="Missing evidence" value={queue.filter((item) => item.status === "MISSING").length} />
        <QueueChip label="Approvals" value={queue.filter((item) => item.type === "Approval").length} />
        <QueueChip label="Changes" value={queue.filter((item) => item.type === "Change").length} />
      </div>

      <Panel title="Open buyer work" description="Sorted by priority. Ownership remains visible even when the buyer is coordinating across teams.">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-left text-sm">
            <thead className="border-b border-slate-200 text-[11px] uppercase tracking-wide text-slate-400">
              <tr>
                <th className="pb-3 pr-4">Work item</th>
                <th className="pb-3 pr-4">Deployment</th>
                <th className="pb-3 pr-4">Owner</th>
                <th className="pb-3 pr-4">Due</th>
                <th className="pb-3 pr-4">Priority</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {queue.map((item) => (
                <tr key={item.id} className="border-b border-slate-100 last:border-0">
                  <td className="py-3 pr-4">
                    <div className="flex items-start gap-2">
                      <Inbox className="mt-0.5 size-4 text-slate-400" />
                      <div>
                        <div className="font-semibold text-slate-900">{item.title}</div>
                        <div className="mt-1 text-xs text-slate-500">
                          {item.type}{item.code !== "—" ? " · " + item.code : ""} · {item.detail}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="font-medium">{item.deploymentCode}</div>
                    <div className="mt-1 text-xs text-slate-500">{item.customer}</div>
                  </td>
                  <td className="py-3 pr-4 text-slate-600">{item.owner}</td>
                  <td className="py-3 pr-4">
                    {item.dueDate ? (
                      <span className="inline-flex items-center gap-1 text-xs text-slate-600"><CalendarDays className="size-3.5" />{formatDate(item.dueDate)}</span>
                    ) : <span className="text-xs text-slate-400">—</span>}
                  </td>
                  <td className="py-3 pr-4"><StatusPill value={item.priority} /></td>
                  <td className="py-3 pr-4"><StatusPill value={item.status} /></td>
                  <td className="py-3">
                    {item.type === "Requirement" || item.type === "Evidence"
                      ? <RequestEvidenceButton />
                      : item.deploymentCode === "DEP-0017"
                        ? <Link href={item.type === "Change" ? "/platform/operational-readiness/changes" : "/platform/operational-readiness/acceptance"} className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:underline">Review <ArrowRight className="size-3.5" /></Link>
                        : <span className="text-xs text-slate-400">Open record</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}

function QueueChip({ label, value, active = false }: { label: string; value: number; active?: boolean }) {
  return (
    <button type="button" className={active
      ? "cursor-default rounded-full bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white"
      : "cursor-default rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600"}>
      {label} · {value}
    </button>
  );
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(value);
}
