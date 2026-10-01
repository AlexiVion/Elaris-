import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { getHorizontalPlatformData } from "@/lib/db/platform";
import { DefinitionList, Panel, ProductPageHeader, PrototypeNotice, StatusPill } from "@/components/platform/PrototypeUI";

export default async function AssessmentDetailPage({ params }: { params: { code: string } }) {
  const data = await getHorizontalPlatformData();
  const d = data.deployment;
  if (params.code !== "ASMT-0017") return <div className="rounded-2xl border border-slate-200 bg-white p-6">Prototype only contains ASMT-0017.</div>;

  return (
    <>
      <ProductPageHeader
        eyebrow="Assessment"
        title="ASMT-0017 · Deployment Evidence Review"
        description="A realistic review surface built from the existing deployment/evidence core, with no real conformity decision implied."
        aside={<StatusPill value="AWAITING EVIDENCE" />}
      />

      <div className="grid gap-5 xl:grid-cols-[0.75fr_1.25fr]">
        <Panel title="Scope">
          <DefinitionList items={[
            { label: "Deployment", value: d.code },
            { label: "System", value: d.robot },
            { label: "Configuration", value: d.snapshotCode },
            { label: "Baseline", value: d.baselineCode },
            { label: "Task", value: d.task },
            { label: "Environment", value: d.environmentType },
            { label: "Human exposure", value: d.humanExposure.replaceAll("_", " ") },
            { label: "Assessment type", value: "Prototype deployment evidence review" },
          ]} />
          <Link href={`/deployments/${d.code}`} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-violet-700 hover:underline">
            Open shared deployment <ExternalLink className="size-4" />
          </Link>
        </Panel>

        <Panel title="Evidence review matrix" description="Requirements and evidence come from the current shared record. Reviewer disposition is inferred only for the mockup.">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="pb-3 pr-4">Requirement / evidence</th>
                  <th className="pb-3 pr-4">Owner</th>
                  <th className="pb-3 pr-4">Shared status</th>
                  <th className="pb-3">Reviewer view</th>
                </tr>
              </thead>
              <tbody>
                {d.requirements.map((item) => (
                  <tr key={item.code} className="border-b border-slate-100 last:border-0">
                    <td className="py-3 pr-4"><div className="font-semibold">{item.code} · {item.title}</div><div className="mt-1 text-xs text-slate-500">{item.kind}</div></td>
                    <td className="py-3 pr-4 text-slate-600">{item.owner}</td>
                    <td className="py-3 pr-4"><StatusPill value={item.status} /></td>
                    <td className="py-3"><StatusPill value={reviewerDisposition(item.status)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Panel title="Submitted evidence">
          {d.evidence.map((item) => (
            <div key={item.code} className="flex items-center justify-between gap-3 border-b border-slate-100 py-3 last:border-0">
              <div><div className="text-sm font-semibold">{item.code} · {item.title}</div><div className="mt-1 text-xs text-slate-500">{item.source} · {item.owner}</div></div>
              <StatusPill value={item.status} />
            </div>
          ))}
        </Panel>

        <Panel title="Change since assessment scope" description="A version/configuration change can create a reassessment question without automatically invalidating the prior review.">
          {d.latestChange ? (
            <>
              <div className="text-sm font-semibold">{d.latestChange.code} · {d.latestChange.beforeSnapshotCode} → {d.latestChange.afterSnapshotCode}</div>
              <div className="mt-2 text-xs leading-5 text-slate-500">{d.latestChange.openImpactItems} impact items remain open in the shared core.</div>
              <Link href="/platform/evidence-review/findings" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-violet-700 hover:underline">
                Review findings <ArrowRight className="size-4" />
              </Link>
            </>
          ) : <div className="text-sm text-slate-500">No open changes.</div>}
        </Panel>
      </div>

      <div className="mt-5"><PrototypeNotice>Reviewer dispositions are UI-only. The source status and provenance remain the Elaris shared data.</PrototypeNotice></div>
    </>
  );
}

function reviewerDisposition(status: string) {
  if (status === "VALID") return "ACCEPTED";
  if (status === "MISSING") return "MISSING";
  if (status === "NOT_STARTED") return "NOT REVIEWED";
  return "NEEDS CLARIFICATION";
}
