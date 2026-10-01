import Link from "next/link";
import { ArrowRight, Clock3, FileClock, Fingerprint, ShieldAlert } from "lucide-react";
import { getHorizontalPlatformData } from "@/lib/db/platform";
import { DefinitionList, Panel, ProductPageHeader, PrototypeNotice, StatusPill } from "@/components/platform/PrototypeUI";

export default async function IncidentDetailPage({ params }: { params: { code: string } }) {
  const data = await getHorizontalPlatformData();
  const incident = data.incidents.find((item) => item.code === params.code);
  if (!incident) return <div className="rounded-2xl border border-slate-200 bg-white p-6">Incident not found.</div>;

  const d = data.deployment;

  return (
    <>
      <ProductPageHeader
        eyebrow="Incident overview"
        title={incident.code}
        description={incident.description}
        aside={<div className="flex gap-2"><StatusPill value={incident.severity} /><StatusPill value={incident.status} /></div>}
      />

      <div className="grid gap-5 xl:grid-cols-[0.75fr_1.25fr]">
        <Panel title="Event identity">
          <DefinitionList items={[
            { label: "Occurred", value: formatDate(incident.occurredAt) },
            { label: "Deployment", value: incident.deploymentCode },
            { label: "Robot", value: `${incident.robotCode} · ${incident.robotModel}` },
            { label: "Baseline at time", value: incident.baselineCode },
            { label: "Snapshot at time", value: incident.snapshotCode },
            { label: "Status", value: <StatusPill value={incident.status} /> },
          ]} />

          <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-950"><Fingerprint className="size-4" />Configuration at time is reconstructable</div>
            <div className="mt-1 text-xs leading-5 text-emerald-900/80">{incident.baselineCode} links the event to {incident.snapshotCode}.</div>
          </div>
        </Panel>

        <Panel title="Event timeline" description="Persisted manual timeline from the incident record.">
          <div className="relative space-y-4 pl-7">
            <div className="absolute bottom-2 left-[9px] top-2 w-px bg-slate-200" />
            {incident.timeline.map((entry) => (
              <div key={`${entry.at}-${entry.note}`} className="relative">
                <span className="absolute -left-7 top-1.5 size-2.5 rounded-full bg-rose-500 ring-4 ring-white" />
                <div className="text-xs font-semibold text-slate-400">{entry.at}</div>
                <div className="mt-1 text-sm font-medium text-slate-900">{entry.note}</div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Panel title="Configuration at time">
          <div className="space-y-2">
            {d.configurationItems.map((item) => (
              <div key={item.slot} className="flex items-start justify-between gap-4 border-b border-slate-100 py-2 last:border-0">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{item.slot.replaceAll("_", " ")}</span>
                <span className="text-right text-sm font-medium text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Known facts / unknowns">
          <div className="space-y-3">
            <Fact icon={<FileClock className="size-4" />} title="Known fact" text="A person entered the restricted area at 10:14:01." />
            <Fact icon={<ShieldAlert className="size-4" />} title="Known fact" text="The robot paused and entered a safe state two seconds later." />
            <Fact icon={<Clock3 className="size-4" />} title="Unknown" text="No log bundle, photo/video or witness statement is linked in the current MVP." />
          </div>
          <Link href="/platform/incident-reconstruction/evidence" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-rose-700 hover:underline">
            Open evidence room <ArrowRight className="size-4" />
          </Link>
        </Panel>
      </div>

      <div className="mt-5"><PrototypeNotice>Elaris preserves facts/configuration/provenance. It does not decide legal causation, liability or insurance coverage.</PrototypeNotice></div>
    </>
  );
}

function Fact({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3"><span className="mt-0.5 text-slate-500">{icon}</span><div><div className="text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</div><div className="mt-1 text-sm leading-5 text-slate-700">{text}</div></div></div>;
}
function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(value);
}
