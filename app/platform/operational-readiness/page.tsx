import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  Clock3,
  GitCompareArrows,
  Inbox,
  ShieldCheck,
} from "lucide-react";
import { getHorizontalPlatformData } from "@/lib/db/platform";
import { MetricCard, Panel, ProductPageHeader, StatusPill } from "@/components/platform/PrototypeUI";

export default async function OperationalReadinessOverviewPage() {
  const data = await getHorizontalPlatformData();
  const d = data.deployment;
  const queue = data.portfolio.reviewQueue;
  const ready = data.portfolio.deployments.filter((item) => item.readinessStatus === "READY").length;
  const reviewRequired = data.portfolio.deployments.filter((item) => item.readinessStatus === "REVIEW REQUIRED").length;

  return (
    <>
      <ProductPageHeader
        eyebrow="Northgas Energy · buyer workspace"
        title="Operational Readiness"
        description="Coordinate deployment acceptance across engineering, Safety/EHS, IT/OT and operations while preserving the exact system configuration behind every decision."
        aside={<span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">DEMO WORKSPACE</span>}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Deployments in portfolio" value={data.portfolio.deployments.length} note={String(data.portfolio.activeDeployments) + " currently live"} />
        <MetricCard label="Ready" value={ready} tone={ready ? "good" : "neutral"} note="No blocking buyer-side items" />
        <MetricCard label="Review required" value={reviewRequired} tone={reviewRequired ? "attention" : "good"} note="Acceptance is not current or complete" />
        <MetricCard label="Open work items" value={queue.length} tone={queue.length ? "attention" : "good"} note="Evidence, approvals and changes" />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <Panel
          title="Needs attention"
          description="Cross-functional work that can block acceptance or make a prior decision stale."
          action={
            <Link href="/platform/operational-readiness/review-queue" className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:underline">
              Open review queue <ArrowRight className="size-3.5" />
            </Link>
          }
        >
          <div className="space-y-1">
            {queue.slice(0, 6).map((item) => (
              <Link
                key={item.id}
                href={item.deploymentCode === "DEP-0017" ? "/platform/operational-readiness/deployments/DEP-0017" : "/platform/operational-readiness/deployments"}
                className="grid gap-3 border-b border-slate-100 py-3 last:border-0 md:grid-cols-[1fr_auto] md:items-center"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900">{item.title}</span>
                    {item.code !== "—" && <span className="font-mono text-[11px] text-slate-400">{item.code}</span>}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {item.deploymentCode} · {item.customer} · {item.type} · owner {item.owner}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusPill value={item.priority} />
                  <StatusPill value={item.status} />
                </div>
              </Link>
            ))}
          </div>
        </Panel>

        <Panel title="Acceptance snapshot" description="Current buyer-side posture for the Northgas deployment.">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-3">
              <CircleAlert className="mt-0.5 size-5 text-amber-700" />
              <div>
                <div className="font-semibold text-amber-950">Review required</div>
                <p className="mt-1 text-sm leading-6 text-amber-900/80">
                  Training and site acceptance evidence are missing, IT review has not started, and CHG-0005 remains under review.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-3 text-sm">
            <SnapshotLine icon={<ShieldCheck className="size-4" />} label="Accepted baseline candidate" value={d.baselineCode + " · " + d.snapshotCode} />
            <SnapshotLine icon={<Clock3 className="size-4" />} label="Pending named approvals" value={String(d.pendingApprovalCount)} />
            <SnapshotLine icon={<GitCompareArrows className="size-4" />} label="Material changes open" value={String(data.portfolio.openChanges)} />
            <SnapshotLine icon={<Inbox className="size-4" />} label="Required items missing" value={String(d.missingCount)} />
          </div>

          <Link href="/platform/operational-readiness/acceptance" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white">
            Review acceptance <ArrowRight className="size-4" />
          </Link>
        </Panel>
      </div>

      <div className="mt-6">
        <Panel
          title="Deployment portfolio"
          description="The buyer sees every candidate/live deployment through the same acceptance model."
          action={<Link href="/platform/operational-readiness/deployments" className="text-xs font-semibold text-blue-700 hover:underline">View all</Link>}
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left text-sm">
              <thead className="border-b border-slate-200 text-[11px] uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="pb-3 pr-4">Deployment</th>
                  <th className="pb-3 pr-4">Site / task</th>
                  <th className="pb-3 pr-4">Baseline</th>
                  <th className="pb-3 pr-4">Open work</th>
                  <th className="pb-3">Readiness</th>
                </tr>
              </thead>
              <tbody>
                {data.portfolio.deployments.map((item) => (
                  <tr key={item.code} className="border-b border-slate-100 last:border-0">
                    <td className="py-3 pr-4">
                      <div className="font-semibold text-slate-900">{item.code} · {item.name}</div>
                      <div className="mt-1 text-xs text-slate-500">{item.customer} · {item.robot}</div>
                    </td>
                    <td className="py-3 pr-4">
                      <div>{item.site}</div>
                      <div className="mt-1 text-xs text-slate-500">{item.task}</div>
                    </td>
                    <td className="py-3 pr-4 font-mono text-xs">{item.baselineCode} · {item.snapshotCode}</td>
                    <td className="py-3 pr-4 text-xs text-slate-600">
                      {item.missingRequired} missing · {item.pendingApprovals} approvals · {item.openChanges} changes
                    </td>
                    <td className="py-3"><StatusPill value={item.readinessStatus} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <Capability icon={<CheckCircle2 className="size-4" />} title="One acceptance record" text="Keep the exact baseline/configuration behind the buyer decision." />
        <Capability icon={<ShieldCheck className="size-4" />} title="Cross-functional gates" text="Safety, IT/OT, operations and customer evidence converge without losing ownership." />
        <Capability icon={<GitCompareArrows className="size-4" />} title="Changes since acceptance" text="Material changes can reopen only the gates that deserve human review." />
      </div>
    </>
  );
}

function SnapshotLine({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 border-b border-slate-100 pb-3 last:border-0">
      <span className="text-slate-400">{icon}</span>
      <span className="flex-1 text-slate-500">{label}</span>
      <span className="font-semibold text-slate-900">{value}</span>
    </div>
  );
}

function Capability({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">{icon}{title}</div>
      <p className="mt-2 text-xs leading-5 text-slate-500">{text}</p>
    </div>
  );
}
