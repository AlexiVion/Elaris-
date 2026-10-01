import Link from "next/link";
import { ArrowRight, ClipboardCheck, FileSearch2, GitCompareArrows, Share2 } from "lucide-react";
import { getHorizontalPlatformData } from "@/lib/db/platform";
import { Panel, ProductPageHeader, StatusPill } from "@/components/platform/PrototypeUI";

export default async function BuyerReportsPage() {
  const data = await getHorizontalPlatformData();
  const d = data.deployment;

  const reports = [
    {
      title: "Deployment Due Diligence Pack",
      description: "System identity, exact configuration, site/task context, requirements, evidence and open gaps.",
      icon: FileSearch2,
      status: "READY",
      href: "/reports/readiness/DEP-0017",
    },
    {
      title: "Acceptance Record",
      description: "Buyer decision, gate owners, conditions and the exact baseline/configuration reviewed.",
      icon: ClipboardCheck,
      status: "DEMO",
      href: "/platform/operational-readiness/acceptance",
    },
    {
      title: "Change Since Acceptance Brief",
      description: "Material changes, affected buyer gates and the review work required to keep acceptance current.",
      icon: GitCompareArrows,
      status: d.latestChange ? "REVIEW REQUIRED" : "READY",
      href: "/platform/operational-readiness/changes",
    },
  ];

  return (
    <>
      <ProductPageHeader
        eyebrow="Outputs"
        title="Reports & Records"
        description="Buyer-facing outputs generated from the same deployment truth instead of rebuilding a due-diligence package for every review."
        aside={<span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">DEP-0017</span>}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {reports.map((report) => {
          const Icon = report.icon;
          return (
            <Link key={report.title} href={report.href} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
              <div className="flex items-start justify-between gap-3">
                <span className="flex size-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><Icon className="size-5" /></span>
                <StatusPill value={report.status} />
              </div>
              <div className="mt-5 text-lg font-semibold text-slate-950">{report.title}</div>
              <p className="mt-2 min-h-16 text-sm leading-6 text-slate-600">{report.description}</p>
              <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-700">
                Preview <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1fr_0.8fr]">
        <Panel title="Record scope" description="The outputs remain tied to a specific deployment baseline.">
          <div className="grid gap-3 sm:grid-cols-2">
            <Scope label="Deployment" value={d.code + " · " + d.name} />
            <Scope label="Robot" value={d.robot} />
            <Scope label="Baseline" value={d.baselineCode} />
            <Scope label="Configuration" value={d.snapshotCode} />
            <Scope label="Site" value={d.site} />
            <Scope label="Task" value={d.task} />
          </div>
        </Panel>

        <Panel title="External sharing">
          <div className="flex items-start gap-3">
            <Share2 className="mt-0.5 size-5 text-blue-700" />
            <div>
              <div className="font-semibold text-slate-950">Share a scoped record</div>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Reuse Elaris Share View for read-only, expiring technical packages while keeping internal gate/decision workflow private.
              </p>
            </div>
          </div>
          <button type="button" className="mt-5 cursor-default rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700">
            Create demo share link
          </button>
        </Panel>
      </div>
    </>
  );
}

function Scope({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</div>
      <div className="mt-1 text-sm font-medium text-slate-900">{value}</div>
    </div>
  );
}
