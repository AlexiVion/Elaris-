import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { getHorizontalPlatformData } from "@/lib/db/platform";
import { Panel, ProductPageHeader, PrototypeNotice, StatusPill } from "@/components/platform/PrototypeUI";

export default async function FindingsPage() {
  const data = await getHorizontalPlatformData();
  const d = data.deployment;
  const open = d.requirements.filter((item) => item.status !== "VALID");

  return (
    <>
      <ProductPageHeader
        eyebrow="Assessment workflow"
        title="Open Findings"
        description="Presentation-only findings derived from real open requirement states. They are not conformity findings issued by a real assessment body."
        aside={<StatusPill value="PROTOTYPE" />}
      />

      <Panel title="ASMT-0017 · findings register" description={`${open.length} items require clarification, evidence or review.`}>
        <div className="space-y-3">
          {open.map((item, index) => (
            <div key={item.code} className="rounded-xl border border-slate-200 p-4">
              <div className="grid gap-4 md:grid-cols-[40px_1fr_auto] md:items-center">
                <span className="flex size-9 items-center justify-center rounded-lg bg-violet-50 text-violet-700"><AlertTriangle className="size-4" /></span>
                <div>
                  <div className="text-sm font-semibold">FND-{String(index + 1).padStart(3, "0")} · {item.title}</div>
                  <div className="mt-1 text-xs text-slate-500">Source item {item.code} · owner {item.owner} · {item.readinessCategory.replaceAll("_", " ")}</div>
                  <div className="mt-2 text-xs leading-5 text-slate-600">{findingText(item.status)}</div>
                </div>
                <StatusPill value={item.status} />
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 size-5 text-emerald-600" />
          <div>
            <div className="font-semibold">Closure model to validate</div>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              A real assurance workflow would need corrective evidence, reviewer identity, closure rationale and a scoped decision. None of those objects are persisted yet.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5"><PrototypeNotice>Finding IDs are generated only for this visual prototype. They must not be treated as actual certification/nonconformity records.</PrototypeNotice></div>
    </>
  );
}

function findingText(status: string) {
  if (status === "MISSING") return "Required evidence is missing from the shared deployment record.";
  if (status === "NOT_STARTED") return "The underlying review has not started; reviewer cannot close this scope.";
  if (status === "IN_REVIEW" || status === "REVIEW_REQUIRED") return "Evidence/requirement remains under review and needs a documented reviewer outcome.";
  return "Reviewer clarification required.";
}
