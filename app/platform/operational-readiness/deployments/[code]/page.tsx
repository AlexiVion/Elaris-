import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { getHorizontalPlatformData } from "@/lib/db/platform";
import { DefinitionList, Panel, ProductPageHeader, PrototypeNotice, StatusPill } from "@/components/platform/PrototypeUI";

export default async function BuyerDeploymentReviewPage({ params }: { params: { code: string } }) {
  const data = await getHorizontalPlatformData();
  const d = data.deployment;

  if (params.code !== d.code) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-6">Prototype only contains {d.code}.</div>;
  }

  return (
    <>
      <ProductPageHeader
        eyebrow="Deployment review"
        title={d.name}
        description="Buyer-side review of the proposed/live system, its exact configuration, site context, requirements and current gaps."
        aside={<StatusPill value="REVIEW REQUIRED" />}
      />

      <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        <Panel title="Deployment context">
          <DefinitionList items={[
            { label: "Deployment", value: d.code },
            { label: "Robot", value: d.robot },
            { label: "Serial", value: d.robotSerial },
            { label: "Supplier / integrator", value: "Humandroid" },
            { label: "Customer", value: d.customer },
            { label: "Site", value: `${d.site} · ${d.environmentType}` },
            { label: "Task", value: d.task },
            { label: "Operating mode", value: d.operatingMode.replaceAll("_", " ") },
            { label: "Human exposure", value: d.humanExposure.replaceAll("_", " ") },
            { label: "Accepted baseline candidate", value: `${d.baselineCode} · ${d.snapshotCode}` },
          ]} />

          <Link
            href={`/deployments/${d.code}`}
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:underline"
          >
            Open shared Elaris source record <ExternalLink className="size-4" />
          </Link>
        </Panel>

        <Panel title="Exact configuration" description="The buyer sees what is actually proposed/deployed, not just a model name.">
          <div className="grid gap-2 sm:grid-cols-2">
            {d.configurationItems.map((item) => (
              <div key={item.slot} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{item.slot.replaceAll("_", " ")}</div>
                <div className="mt-1 text-sm font-medium text-slate-900">{item.value}</div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Panel title="Requirements" description="Buyer-side requirements already present in the shared Elaris record.">
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

        <Panel title="Evidence received" description="Evidence remains sourced/provenanced from the shared substrate.">
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

      <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5">
        <div>
          <div className="text-sm font-semibold">Next buyer action</div>
          <div className="mt-1 text-xs text-slate-500">Review functional gates before recording an acceptance decision.</div>
        </div>
        <Link href="/platform/operational-readiness/acceptance" className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white">
          Open acceptance gates <ArrowRight className="size-4" />
        </Link>
      </div>

      <div className="mt-5">
        <PrototypeNotice>
          The buyer-specific acceptance decision is not stored in the current schema. This screen deliberately reuses existing deployment/evidence/approval truth and shows where a buyer workflow would sit.
        </PrototypeNotice>
      </div>
    </>
  );
}
