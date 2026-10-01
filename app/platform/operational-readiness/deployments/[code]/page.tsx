import Link from "next/link";
import { ArrowRight, ExternalLink, GitCompareArrows, ShieldCheck } from "lucide-react";
import { getHorizontalPlatformData } from "@/lib/db/platform";
import { DefinitionList, Panel, ProductPageHeader, StatusPill } from "@/components/platform/PrototypeUI";

export default async function BuyerDeploymentReviewPage({ params }: { params: { code: string } }) {
  const data = await getHorizontalPlatformData();
  const d = data.deployment;

  if (params.code !== d.code) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        This demo only has a full buyer workflow for {d.code}.
      </div>
    );
  }

  const gateSummary = [
    { label: "Customer / Procurement", status: d.requirements.some((item) => item.readinessCategory === "CUSTOMER_REQUIREMENTS" && item.status === "MISSING") ? "BLOCKED" : "READY" },
    { label: "Safety / EHS", status: d.requirements.some((item) => item.readinessCategory === "SAFETY_EVIDENCE" && item.status !== "VALID") ? "REVIEW REQUIRED" : "READY" },
    { label: "IT / Cyber", status: d.requirements.some((item) => item.readinessCategory === "CONFIGURATION" && item.status !== "VALID") ? "NOT STARTED" : "READY" },
    { label: "Operations", status: d.pendingApprovalCount > 0 ? "WAITING" : "READY" },
  ];

  return (
    <>
      <ProductPageHeader
        eyebrow="Deployment review"
        title={d.name}
        description="Buyer-side review of the exact system proposed for the site: configuration, requirements, evidence, gates and changes that can affect acceptance."
        aside={<StatusPill value="REVIEW REQUIRED" />}
      />

      <div className="grid gap-5 xl:grid-cols-[0.78fr_1.22fr]">
        <Panel title="Deployment context">
          <DefinitionList items={[
            { label: "Deployment", value: d.code },
            { label: "Robot", value: d.robot },
            { label: "Serial", value: d.robotSerial },
            { label: "Supplier / integrator", value: "Humandroid" },
            { label: "Customer", value: d.customer },
            { label: "Site", value: d.site + " · " + d.environmentType },
            { label: "Task", value: d.task },
            { label: "Operating mode", value: d.operatingMode.replaceAll("_", " ") },
            { label: "Human exposure", value: d.humanExposure.replaceAll("_", " ") },
            { label: "Reference baseline", value: d.baselineCode + " · " + d.snapshotCode },
          ]} />

          <Link href={"/deployments/" + d.code} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:underline">
            Open shared Elaris record <ExternalLink className="size-4" />
          </Link>
        </Panel>

        <Panel title="Exact configuration" description="The acceptance decision is tied to this versioned system state, not just the robot model.">
          <div className="grid gap-2 sm:grid-cols-2">
            {d.configurationItems.map((item) => (
              <div key={item.slot} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{item.slot.replaceAll("_", " ")}</div>
                <div className="mt-1 text-sm font-medium text-slate-900">{item.value}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs">
            <span className="text-slate-500">Snapshot hash</span>
            <span className="font-mono text-slate-700">{d.snapshotHash.slice(0, 16)}…</span>
          </div>
        </Panel>
      </div>

      <div className="mt-5">
        <Panel title="Acceptance gates" description="Cross-functional review state for this deployment.">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {gateSummary.map((gate) => (
              <div key={gate.label} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm font-semibold text-slate-900">{gate.label}</div>
                <div className="mt-3"><StatusPill value={gate.status} /></div>
              </div>
            ))}
          </div>
          <Link href="/platform/operational-readiness/acceptance" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:underline">
            Open acceptance workflow <ArrowRight className="size-4" />
          </Link>
        </Panel>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Panel title="Requirements" description="Buyer-facing requirements from the shared deployment record.">
          <div className="space-y-1">
            {d.requirements.map((item) => (
              <div key={item.code} className="grid grid-cols-[1fr_auto] gap-3 border-b border-slate-100 py-3 last:border-0">
                <div>
                  <div className="text-sm font-semibold">{item.code} · {item.title}</div>
                  <div className="mt-1 text-xs text-slate-500">{item.readinessCategory.replaceAll("_", " ")} · owner {item.owner}</div>
                </div>
                <StatusPill value={item.status} />
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Evidence received" description="Evidence stays sourced and owned in the shared substrate.">
          <div className="space-y-1">
            {d.evidence.map((item) => (
              <div key={item.code} className="grid grid-cols-[1fr_auto] gap-3 border-b border-slate-100 py-3 last:border-0">
                <div>
                  <div className="text-sm font-semibold">{item.code} · {item.title}</div>
                  <div className="mt-1 text-xs text-slate-500">{item.source} · owner {item.owner}</div>
                </div>
                <StatusPill value={item.status} />
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {d.latestChange && (
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <GitCompareArrows className="mt-0.5 size-5 text-amber-700" />
              <div>
                <div className="font-semibold text-amber-950">Material change since reference baseline</div>
                <div className="mt-1 text-sm text-amber-900/80">
                  {d.latestChange.code} · {d.latestChange.beforeSnapshotCode} → {d.latestChange.afterSnapshotCode} · {d.latestChange.openImpactItems} impact items open
                </div>
              </div>
            </div>
            <Link href="/platform/operational-readiness/changes" className="inline-flex items-center gap-2 text-sm font-semibold text-amber-900 hover:underline">
              Review buyer impact <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 size-5 text-blue-700" />
          <div>
            <div className="text-sm font-semibold">Next buyer action</div>
            <div className="mt-1 text-xs text-slate-500">Resolve blocking gates, then record a scoped acceptance decision against the exact baseline.</div>
          </div>
        </div>
        <Link href="/platform/operational-readiness/acceptance" className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white">
          Review acceptance <ArrowRight className="size-4" />
        </Link>
      </div>
    </>
  );
}
