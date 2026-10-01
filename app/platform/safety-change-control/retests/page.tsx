import { FlaskConical, UserRoundCheck } from "lucide-react";
import { getHorizontalPlatformData } from "@/lib/db/platform";
import { Panel, ProductPageHeader, PrototypeNotice, StatusPill } from "@/components/platform/PrototypeUI";

export default async function SafetyRetestQueuePage() {
  const data = await getHorizontalPlatformData();
  const change = data.deployment.latestChange;
  const actionable = change?.impactItems.filter((item) =>
    ["RE_RUN", "UPDATE", "REVIEW", "RE_APPROVE"].includes(item.suggestedAction)
  ) ?? [];

  return (
    <>
      <ProductPageHeader
        eyebrow="Safety workflow"
        title="Re-test & Review Queue"
        description="A task-oriented view of what must be re-run, updated, reviewed or re-approved before the safety change review can close."
        aside={<StatusPill value="PROTOTYPE" />}
      />

      <Panel title={change ? `${change.code} · open safety work` : "Open safety work"}>
        <div className="space-y-3">
          {actionable.map((item) => (
            <div key={item.title} className="rounded-xl border border-slate-200 p-4">
              <div className="grid gap-4 md:grid-cols-[40px_1fr_auto] md:items-center">
                <span className="flex size-9 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                  {item.suggestedAction === "RE_APPROVE" ? <UserRoundCheck className="size-4" /> : <FlaskConical className="size-4" />}
                </span>
                <div>
                  <div className="text-sm font-semibold">{item.title}</div>
                  <div className="mt-1 text-xs leading-5 text-slate-500">{item.reason}</div>
                  <div className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Action · {item.suggestedAction.replaceAll("_", " ")}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusPill value={item.severity} />
                  <StatusPill value={item.status} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="font-semibold">What closes this queue?</div>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Evidence/test work must be resolved and affected named approvals must be re-reviewed. Final change approval remains a separate authority boundary.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="font-semibold">What Elaris does not do</div>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            It does not infer that a test passed, a control is adequate, or a system is safe. Those are recorded human/technical outcomes.
          </p>
        </div>
      </div>

      <div className="mt-5"><PrototypeNotice>This queue re-presents real Change Impact items through a safety-specific workflow; no new task model is persisted.</PrototypeNotice></div>
    </>
  );
}
