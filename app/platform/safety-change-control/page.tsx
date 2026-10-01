import Link from "next/link";
import { ArrowRight, CircleAlert, ShieldCheck, Siren, TriangleAlert } from "lucide-react";
import { getHorizontalPlatformData } from "@/lib/db/platform";
import { MetricCard, Panel, ProductPageHeader, PrototypeNotice, StatusPill, WorkRow } from "@/components/platform/PrototypeUI";

export default async function SafetyOverviewPage() {
  const data = await getHorizontalPlatformData();
  const d = data.deployment;
  const change = d.latestChange;
  const high = change?.impactItems.filter((item) => item.severity === "HIGH" && ["PENDING", "IN_REVIEW"].includes(item.status)).length ?? 0;
  const reruns = change?.impactItems.filter((item) => item.suggestedAction === "RE_RUN" && ["PENDING", "IN_REVIEW"].includes(item.status)).length ?? 0;

  const hazards = [
    { name: "Shared-zone human exposure", control: "Operating limits + supervised operation", ref: "SZL-004 / SZR-002", status: "IN REVIEW" },
    { name: "Hand / contact behavior changed", control: "Integration test + safety reassessment", ref: "INT-042 / SAF-017", status: "REVIEW REQUIRED" },
    { name: "Emergency stop / safe state", control: "Emergency stop validation", ref: "ESV-001", status: "VALID" },
    { name: "New hand calibration", control: "Calibration record", ref: "CAL-021", status: "RE-TEST" },
  ];

  return (
    <>
      <ProductPageHeader
        eyebrow="Safety workspace"
        title="Safety Change Control"
        description="Una vista centrada en cambios safety-relevant, evidencia, re-tests y decisiones nominativas. Elaris organiza la revisión; no declara safety."
        aside={<StatusPill value="PROTOTYPE" />}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Changes under review" value={data.portfolio.openChanges} tone="attention" />
        <MetricCard label="High-impact review items" value={high} tone={high ? "danger" : "good"} />
        <MetricCard label="Re-tests requested" value={reruns} tone={reruns ? "attention" : "good"} />
        <MetricCard label="Open incidents" value={data.portfolio.openIncidents} tone={data.portfolio.openIncidents ? "attention" : "good"} />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <Panel
          title="Safety review queue"
          description="Change, evidence and incident signals that deserve a human safety review."
          action={
            <Link href="/platform/safety-change-control/changes/CHG-0005" className="text-xs font-semibold text-amber-700 hover:underline">
              Open change
            </Link>
          }
        >
          {change && (
            <WorkRow
              title={`${change.code} · Hand + control stack change`}
              meta={`${change.beforeSnapshotCode} → ${change.afterSnapshotCode} · ${change.openImpactItems} open impact items`}
              status={change.status}
              right={<ArrowRight className="size-4 text-slate-400" />}
            />
          )}
          <WorkRow title="Safety assessment" meta="SAF-017 · New hand requires review" status="IN REVIEW" />
          <WorkRow title="Integration test" meta="INT-042 · Re-run requested" status="PENDING" />
          <WorkRow title="Safety re-approval" meta="Named approver: Sarah Chen" status="PENDING" />
          {d.latestIncident && (
            <WorkRow
              title={`${d.latestIncident.code} · Incident context`}
              meta={d.latestIncident.description}
              status={d.latestIncident.status}
            />
          )}
        </Panel>

        <Panel title="Deployment safety context">
          <div className="space-y-3">
            <Context label="Deployment" value={`${d.code} · ${d.name}`} />
            <Context label="Operating mode" value={d.operatingMode.replaceAll("_", " ")} />
            <Context label="Human exposure" value={d.humanExposure.replaceAll("_", " ")} />
            <Context label="Active baseline" value={`${d.baselineCode} · ${d.snapshotCode}`} />
            <Context label="Site" value={`${d.site} · ${d.environmentType}`} />
          </div>
          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-950">
            Affected items are <strong>review signals</strong>, not automatic invalidations.
          </div>
        </Panel>
      </div>

      <div className="mt-5">
        <Panel title="Hazards & controls — prototype view" description="These rows are a presentation hypothesis derived from the current deployment/evidence context.">
          <div className="grid gap-3 lg:grid-cols-2">
            {hazards.map((hazard) => (
              <div key={hazard.name} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2">
                    <TriangleAlert className="mt-0.5 size-4 text-amber-600" />
                    <div>
                      <div className="text-sm font-semibold">{hazard.name}</div>
                      <div className="mt-1 text-xs text-slate-500">{hazard.control}</div>
                    </div>
                  </div>
                  <StatusPill value={hazard.status} />
                </div>
                <div className="mt-3 text-xs font-medium text-slate-500">Shared refs: {hazard.ref}</div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <Mini icon={<ShieldCheck className="size-4" />} title="Named authority" text="Safety decisions stay with the named reviewer." />
        <Mini icon={<CircleAlert className="size-4" />} title="Change propagation" text="Configuration changes surface potentially affected safety work." />
        <Mini icon={<Siren className="size-4" />} title="Incident context" text="Operational events can inform the next safety review." />
      </div>

      <div className="mt-5">
        <PrototypeNotice>
          Hazard and Control are not Prisma models today. The cards above intentionally test whether safety reviewers want this abstraction before we add schema.
        </PrototypeNotice>
      </div>
    </>
  );
}

function Context({ label, value }: { label: string; value: string }) {
  return <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3 text-sm last:border-0"><span className="text-slate-500">{label}</span><span className="text-right font-medium">{value}</span></div>;
}

function Mini({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-4"><div className="flex items-center gap-2 text-sm font-semibold">{icon}{title}</div><p className="mt-2 text-xs leading-5 text-slate-500">{text}</p></div>;
}
