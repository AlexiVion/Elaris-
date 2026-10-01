import Link from "next/link";
import { ArrowRight, Building2, CircleAlert, FileWarning, ShieldCheck } from "lucide-react";
import { getHorizontalPlatformData } from "@/lib/db/platform";
import { MetricCard, Panel, ProductPageHeader, PrototypeNotice, StatusPill, WorkRow } from "@/components/platform/PrototypeUI";

export default async function OperationalReadinessOverviewPage() {
  const data = await getHorizontalPlatformData();
  const d = data.deployment;

  const customerRequirements = d.requirements.filter((item) => item.readinessCategory === "CUSTOMER_REQUIREMENTS");
  const openCustomerRequirements = customerRequirements.filter((item) => item.status !== "VALID").length;
  const cyberOpen = d.requirements.filter((item) => item.readinessCategory === "CONFIGURATION" && item.status !== "VALID").length;
  const gateAttention = Number(openCustomerRequirements > 0) + Number(d.reviewCount > 0) + Number(cyberOpen > 0) + Number(d.pendingApprovalCount > 0);

  return (
    <>
      <ProductPageHeader
        eyebrow="Buyer workspace"
        title="Operational Readiness"
        description="Una interfaz para revisar si un deployment puede entrar o continuar operando en un site, qué falta y qué cambió desde la aceptación."
        aside={<StatusPill value="PROTOTYPE" />}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Live deployments" value={data.portfolio.activeDeployments} note="Shared Elaris records" />
        <MetricCard label="Acceptance gates needing attention" value={gateAttention} tone={gateAttention ? "attention" : "good"} />
        <MetricCard label="Missing required items" value={data.portfolio.missingEvidence} tone={data.portfolio.missingEvidence ? "danger" : "good"} />
        <MetricCard label="Material changes open" value={data.portfolio.openChanges} tone={data.portfolio.openChanges ? "attention" : "good"} />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <Panel
          title="Buyer work queue"
          description="Lo que necesitaría atención antes de mantener la aceptación vigente."
          action={
            <Link href="/platform/operational-readiness/acceptance" className="text-xs font-semibold text-blue-700 hover:underline">
              Open gates
            </Link>
          }
        >
          <WorkRow
            title="DEP-0017 · Valve Inspection Pilot"
            meta="Northgas Energy · North gas facility · Unitree G1"
            status="REVIEW REQUIRED"
            right={
              <Link href="/platform/operational-readiness/deployments/DEP-0017" className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700">
                Review <ArrowRight className="size-3.5" />
              </Link>
            }
          />
          <WorkRow title="Operator training record" meta="OPT-005 · Customer requirement" status="MISSING" />
          <WorkRow title="Site acceptance test" meta="SAT-006 · Customer requirement" status="MISSING" />
          <WorkRow title="Network access review" meta="NET-002 · IT / Cyber gate" status="NOT STARTED" />
          {d.latestChange && (
            <WorkRow
              title={`${d.latestChange.code} · Material system change`}
              meta={`${d.latestChange.beforeSnapshotCode} → ${d.latestChange.afterSnapshotCode} · ${d.latestChange.openImpactItems} impact items open`}
              status={d.latestChange.status}
            />
          )}
        </Panel>

        <Panel title="Current deployment" description="El mismo shared record visto desde el buyer.">
          <div className="flex items-start gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <Building2 className="size-5" />
            </span>
            <div>
              <div className="font-semibold">{d.name}</div>
              <div className="mt-1 text-xs text-slate-500">{d.code} · {d.robot}</div>
            </div>
          </div>

          <div className="mt-5 space-y-3 text-sm">
            <Info label="Site" value={`${d.site} · ${d.city}, ${d.country}`} />
            <Info label="Task" value={d.task} />
            <Info label="Baseline" value={`${d.baselineCode} · ${d.snapshotCode}`} />
            <Info label="Human exposure" value={d.humanExposure.replaceAll("_", " ")} />
          </div>

          <Link
            href="/platform/operational-readiness/deployments/DEP-0017"
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white"
          >
            Open deployment review <ArrowRight className="size-4" />
          </Link>
        </Panel>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <SignalCard icon={<FileWarning className="size-4" />} title="Evidence gaps" text="Training and site acceptance are still missing for the demo deployment." />
        <SignalCard icon={<ShieldCheck className="size-4" />} title="Human decisions" text="Buyer acceptance remains a named decision; Elaris does not auto-approve the deployment." />
        <SignalCard icon={<CircleAlert className="size-4" />} title="Change monitoring" text="CHG-0005 can reopen gates that depended on the prior configuration." />
      </div>

      <div className="mt-5">
        <PrototypeNotice>
          Acceptance Gates are presentation-only in Wave A. Their state is inferred from the current demo requirements and approvals; no buyer workflow is persisted yet.
        </PrototypeNotice>
      </div>
    </>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-2 last:border-0">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-900">{value}</span>
    </div>
  );
}

function SignalCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">{icon}{title}</div>
      <p className="mt-2 text-xs leading-5 text-slate-500">{text}</p>
    </div>
  );
}
