import { CheckCircle2, CircleAlert, LockKeyhole } from "lucide-react";
import { getHorizontalPlatformData } from "@/lib/db/platform";
import { Panel, ProductPageHeader, PrototypeNotice, StatusPill } from "@/components/platform/PrototypeUI";

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
      detail: safetyOpen.length ? "Safety-related requirement remains in review." : "Safety review appears complete in shared data.",
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

  return (
    <>
      <ProductPageHeader
        eyebrow="Acceptance workflow"
        title="Acceptance Gates"
        description="Una hipótesis de cómo un enterprise buyer podría coordinar múltiples gates internos sin perder la referencia a la misma configuración/evidencia."
        aside={<StatusPill value="PROTOTYPE" />}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {gates.map((gate) => (
          <div key={gate.name} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-semibold text-slate-950">{gate.name}</div>
                <div className="mt-1 text-xs text-slate-500">Owner: {gate.owner}</div>
              </div>
              <StatusPill value={gate.status} />
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">{gate.detail}</p>
            <div className="mt-4 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600">
              Shared evidence / decision refs: <span className="font-semibold">{gate.evidence}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1fr_0.75fr]">
        <Panel title="Proposed buyer decision record" description="A future actor-specific object; intentionally not persisted in Wave A.">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["Accept", "All gates complete"],
              ["Accept with conditions", "Proceed with explicit conditions"],
              ["Review required", "Keep deployment under review"],
              ["Reject", "Do not authorize entry/go-live"],
            ].map(([title, note]) => (
              <button key={title} type="button" className="cursor-default rounded-xl border border-slate-200 bg-slate-50 p-4 text-left">
                <div className="text-sm font-semibold text-slate-900">{title}</div>
                <div className="mt-1 text-xs text-slate-500">{note}</div>
              </button>
            ))}
          </div>
        </Panel>

        <Panel title="Current recommendation" description="Visual hypothesis only — not an automated Elaris decision.">
          <div className="flex items-start gap-3">
            <CircleAlert className="mt-0.5 size-5 text-amber-600" />
            <div>
              <div className="font-semibold">Review required</div>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Required customer artifacts are missing, IT review has not started, and a material configuration change remains open.
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <Line icon={<LockKeyhole className="size-4" />} text="Decision authority belongs to the customer." />
            <Line icon={<CheckCircle2 className="size-4" />} text="Elaris preserves the exact shared record used for the review." />
          </div>
        </Panel>
      </div>

      <div className="mt-5">
        <PrototypeNotice>
          No buyer acceptance object exists in Prisma today. This screen is the visual discovery spec: real shared inputs, hypothetical buyer workflow.
        </PrototypeNotice>
      </div>
    </>
  );
}

function Line({ icon, text }: { icon: React.ReactNode; text: string }) {
  return <div className="flex items-start gap-2 text-xs leading-5 text-slate-600">{icon}<span>{text}</span></div>;
}
