import { CheckCircle2, CircleAlert, Clock3, LockKeyhole, ShieldCheck } from "lucide-react";
import { getHorizontalPlatformData } from "@/lib/db/platform";
import { DecisionComposer } from "@/components/platform/OperationalDemoControls";
import { Panel, ProductPageHeader, StatusPill } from "@/components/platform/PrototypeUI";

export default async function AcceptanceGatesPage() {
  const data = await getHorizontalPlatformData();
  const d = data.deployment;

  const customerMissing = d.requirements.filter((item) =>
    item.readinessCategory === "CUSTOMER_REQUIREMENTS" && item.status === "MISSING"
  );
  const safetyOpen = d.requirements.filter((item) =>
    item.readinessCategory === "SAFETY_EVIDENCE" && item.status !== "VALID"
  );
  const cyberOpen = d.requirements.filter((item) =>
    item.readinessCategory === "CONFIGURATION" && item.status !== "VALID"
  );
  const pendingCustomerApproval = d.approvals.find((approval) => approval.status === "PENDING");

  const gates = [
    {
      name: "Procurement / Customer",
      owner: "Northgas technical team",
      status: customerMissing.length ? "BLOCKED" : "READY",
      evidence: customerMissing.length ? customerMissing.map((x) => x.code).join(", ") : "No blocking gaps",
      detail: customerMissing.length ? "Required customer artifacts are missing." : "Required customer artifacts present.",
    },
    {
      name: "Safety / EHS",
      owner: "Safety reviewer",
      status: safetyOpen.length ? "REVIEW REQUIRED" : "READY",
      evidence: safetyOpen.length ? safetyOpen.map((x) => x.code).join(", ") : "No open safety review",
      detail: safetyOpen.length ? "Safety-related review remains open." : "Safety review appears complete in shared data.",
    },
    {
      name: "IT / Cyber",
      owner: "Customer IT / OT",
      status: cyberOpen.length ? "NOT STARTED" : "READY",
      evidence: cyberOpen.length ? cyberOpen.map((x) => x.code).join(", ") : "No open network review",
      detail: cyberOpen.length ? "Network access review has not started." : "Network requirements appear complete.",
    },
    {
      name: "Operations",
      owner: "Site / operations",
      status: pendingCustomerApproval ? "WAITING" : "READY",
      evidence: pendingCustomerApproval?.title ?? "No pending named approval",
      detail: pendingCustomerApproval ? "A named customer decision is still pending." : "No open customer decision found.",
    },
  ];

  const readyGates = gates.filter((gate) => gate.status === "READY").length;

  return (
    <>
      <ProductPageHeader
        eyebrow="Decision workflow"
        title="Deployment Acceptance"
        description="Coordinate cross-functional gates, preserve the reviewed system baseline and record the buyer decision with explicit conditions."
        aside={<StatusPill value="REVIEW REQUIRED" />}
      />

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Deployment under review</div>
            <div className="mt-1 text-lg font-semibold text-slate-950">{d.code} · {d.name}</div>
            <div className="mt-1 text-sm text-slate-500">{d.customer} · {d.site} · {d.robot}</div>
          </div>
          <div className="flex items-center gap-5">
            <div>
              <div className="text-xs text-slate-500">Reference baseline</div>
              <div className="mt-1 font-mono text-sm font-semibold">{d.baselineCode} · {d.snapshotCode}</div>
            </div>
            <div className="h-10 w-px bg-slate-200" />
            <div>
              <div className="text-xs text-slate-500">Gates ready</div>
              <div className="mt-1 text-lg font-semibold">{readyGates} / {gates.length}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {gates.map((gate, index) => (
          <div key={gate.name} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">{index + 1}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-semibold text-slate-950">{gate.name}</div>
                    <div className="mt-1 text-xs text-slate-500">Owner: {gate.owner}</div>
                  </div>
                  <StatusPill value={gate.status} />
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-600">{gate.detail}</p>
                <div className="mt-4 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600">
                  Shared refs: <span className="font-semibold">{gate.evidence}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel title="Record buyer decision" description="Interactive demo control. A real product would persist the decision, scope, authority and conditions.">
          <DecisionComposer />
        </Panel>

        <Panel title="Decision context">
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <CircleAlert className="mt-0.5 size-5 text-amber-700" />
            <div>
              <div className="font-semibold text-amber-950">Current posture: Review required</div>
              <p className="mt-1 text-sm leading-6 text-amber-900/80">
                Required customer artifacts are missing, IT review has not started, and a material configuration change remains open.
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <Line icon={<LockKeyhole className="size-4" />} text="Decision authority belongs to the buyer/customer." />
            <Line icon={<ShieldCheck className="size-4" />} text="The decision is scoped to the reviewed baseline/configuration." />
            <Line icon={<Clock3 className="size-4" />} text="A later material change can reopen affected gates." />
            <Line icon={<CheckCircle2 className="size-4" />} text="Elaris preserves the exact technical record used for the decision." />
          </div>
        </Panel>
      </div>

      <div className="mt-6">
        <Panel title="Decision history" description="Presentation-only history demonstrating how acceptance becomes versioned over time.">
          <div className="grid gap-3 md:grid-cols-[120px_1fr_180px_auto] md:items-center">
            <div className="font-mono text-xs text-slate-500">06 Aug 2026</div>
            <div>
              <div className="text-sm font-semibold">Pilot baseline reviewed</div>
              <div className="mt-1 text-xs text-slate-500">B-0017-01 · C004 · Safety and Customer Engineering approvals present</div>
            </div>
            <div className="text-xs text-slate-500">Northgas / Humandroid</div>
            <StatusPill value="ACCEPTED WITH CONDITIONS" />
          </div>
        </Panel>
      </div>
    </>
  );
}

function Line({ icon, text }: { icon: React.ReactNode; text: string }) {
  return <div className="flex items-start gap-2 text-xs leading-5 text-slate-600"><span className="mt-0.5 text-slate-400">{icon}</span><span>{text}</span></div>;
}
