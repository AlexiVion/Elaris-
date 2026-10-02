import Link from "next/link";
import { GitBranch, Wrench } from "lucide-react";
import { PageHeader } from "@/components/elaris/PageHeader";
import { SectionCard } from "@/components/elaris/SectionCard";
import { StatusPill } from "@/components/elaris/StatusPill";
import { healthCase, serviceEvents, syntheticReplacement } from "@/lib/demo/component-health";

export default function ServiceDetailPage() {
  const event = serviceEvents[0];
  return (
    <>
      <PageHeader title={event.code + " · Component inspection"} breadcrumb={<Link href="/platform/component-health/service" className="hover:underline">Service</Link>} actions={<StatusPill label={event.status} tone="amber" />} />
      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Service case" icon={Wrench}>
          <dl className="space-y-3 text-sm"><Row label="Robot" value={event.robot} /><Row label="Component" value={event.component} /><Row label="Trigger" value={healthCase.code} /><Row label="Owner" value={event.owner} /><Row label="Due" value={event.due} /><Row label="Current outcome" value={event.outcome} /></dl>
          <p className="mt-5 rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-900">Synthetic demo workflow. The real Humandroid inspection procedure, technician roles and service tools remain to be validated.</p>
        </SectionCard>
        <SectionCard title="Synthetic replacement scenario" icon={GitBranch}>
          <div className="space-y-4 text-sm"><Row label="Remove" value={syntheticReplacement.oldSerial} /><Row label="Install" value={syntheticReplacement.newSerial} /><Row label="Before config" value={syntheticReplacement.beforeConfiguration} /><Row label="After config" value={syntheticReplacement.afterConfiguration} /></div>
          <div className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Impact to review</div>
          <ul className="mt-3 space-y-2 text-sm">{syntheticReplacement.impact.map((item) => <li key={item} className="rounded-md bg-muted/50 px-3 py-2">{item}</li>)}</ul>
          <Link href="/platform/component-health/return-to-service/RTS-0007" className="mt-5 inline-flex rounded-md bg-slate-950 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800">Continue to Return-to-Service</Link>
        </SectionCard>
      </div>
    </>
  );
}
function Row({ label, value }: { label: string; value: string }) { return <div className="flex items-start justify-between gap-4"><dt className="text-muted-foreground">{label}</dt><dd className="text-right font-medium">{value}</dd></div>; }
