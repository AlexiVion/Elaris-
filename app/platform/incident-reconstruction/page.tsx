import Link from "next/link";
import { ArrowRight, Clock3, Siren } from "lucide-react";
import { getHorizontalPlatformData } from "@/lib/db/platform";
import { MetricCard, Panel, ProductPageHeader, PrototypeNotice, StatusPill } from "@/components/platform/PrototypeUI";

export default async function IncidentQueuePage() {
  const data = await getHorizontalPlatformData();
  const investigating = data.incidents.filter((incident) => incident.status !== "CLOSED").length;
  const linkedBaseline = data.incidents.filter((incident) => incident.baselineCode !== "Unknown").length;

  return (
    <>
      <ProductPageHeader
        eyebrow="Investigation workspace"
        title="Incident Reconstruction"
        description="Reconstruct the exact deployment state at event time, preserve evidence context and separate known facts from hypotheses."
        aside={<StatusPill value="PROTOTYPE" />}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Incidents" value={data.incidents.length} />
        <MetricCard label="Investigating" value={investigating} tone={investigating ? "attention" : "good"} />
        <MetricCard label="Baseline-linked" value={linkedBaseline} tone="good" />
        <MetricCard label="Open material changes" value={data.portfolio.openChanges} tone={data.portfolio.openChanges ? "attention" : "good"} />
      </div>

      <div className="mt-6">
        <Panel title="Incident queue" description="Demo incidents already stored in the Elaris shared core.">
          <div className="space-y-3">
            {data.incidents.map((incident) => (
              <Link
                key={incident.code}
                href={incident.code === "INC-2026-001" ? "/platform/incident-reconstruction/incidents/INC-2026-001" : "#"}
                className="grid gap-4 rounded-xl border border-slate-200 p-4 transition hover:border-slate-300 md:grid-cols-[40px_1fr_auto] md:items-center"
              >
                <span className="flex size-9 items-center justify-center rounded-lg bg-rose-50 text-rose-700"><Siren className="size-4" /></span>
                <div>
                  <div className="text-sm font-semibold">{incident.code} · {incident.description}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <Clock3 className="size-3.5" />
                    {formatDate(incident.occurredAt)} · {incident.deploymentCode} · {incident.robotCode}
                  </div>
                  <div className="mt-2 text-xs text-slate-500">Configuration at time: {incident.baselineCode} · {incident.snapshotCode}</div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusPill value={incident.severity} />
                  <StatusPill value={incident.status} />
                  {incident.code === "INC-2026-001" && <ArrowRight className="size-4 text-slate-400" />}
                </div>
              </Link>
            ))}
          </div>
        </Panel>
      </div>

      <div className="mt-5"><PrototypeNotice>The incident records are real demo-core data. Claims, damage, causation and legal outcomes are intentionally not invented.</PrototypeNotice></div>
    </>
  );
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(value);
}
