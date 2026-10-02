import Link from "next/link";
import { Activity, Clock3, FileSearch, Wrench } from "lucide-react";
import { PageHeader } from "@/components/elaris/PageHeader";
import { SectionCard } from "@/components/elaris/SectionCard";
import { StatusPill } from "@/components/elaris/StatusPill";
import { ComponentHealthDemoControls } from "@/components/platform/ComponentHealthDemoControls";
import { componentHealthComponents, componentTimeline, healthCase } from "@/lib/demo/component-health";

export default function ComponentDetailPage() {
  const component = componentHealthComponents[0];
  return (
    <>
      <PageHeader title={component.name} breadcrumb={<><Link href="/platform/component-health/robots/HMND-0002" className="hover:underline">HMND-0002</Link> / {component.code}</>} actions={<StatusPill label={component.status} tone="amber" />} />
      <div className="grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
        <div className="space-y-6">
          <SectionCard title="Why Elaris is flagging this" icon={Activity}>
            <p className="mb-4 text-sm leading-6 text-muted-foreground">{healthCase.summary}</p>
            <div className="space-y-3">{healthCase.signals.map((signal) => (
              <div key={signal.metric} className="grid gap-2 rounded-lg border border-border p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-center">
                <div><div className="text-sm font-semibold">{signal.metric}</div><div className="mt-1 text-xs text-muted-foreground">{signal.evidence}</div></div>
                <div className="text-sm">{signal.observation}</div><StatusPill label={signal.status} tone="amber" />
              </div>
            ))}</div>
            <div className="mt-4 rounded-lg bg-slate-950 p-4 text-white">
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Suggested human review</div>
              <div className="mt-2 text-sm font-medium">{healthCase.suggestedAction}</div>
              <p className="mt-2 text-xs leading-5 text-slate-300">Synthetic demo recommendation. Elaris is not the maintenance authority.</p>
            </div>
          </SectionCard>
          <ComponentHealthDemoControls />
          <SectionCard title="Component timeline" icon={Clock3}>
            <div className="space-y-4">{componentTimeline.map((item) => (
              <div key={item.date + item.event} className="grid gap-1 border-l-2 border-slate-200 pl-4"><div className="text-xs font-medium text-muted-foreground">{item.date}</div><div className="text-sm font-semibold">{item.event}</div><div className="text-sm text-muted-foreground">{item.detail}</div></div>
            ))}</div>
          </SectionCard>
        </div>
        <div className="space-y-6">
          <SectionCard title="Identity & context" icon={FileSearch}>
            <dl className="space-y-3 text-sm"><Row label="Robot" value={component.robot} /><Row label="Position" value={component.position} /><Row label="Part" value={component.part} /><Row label="Serial" value={component.serial} /><Row label="Installed" value={component.installed} /><Row label="Runtime" value={component.runtimeHours + " h"} /><Row label="Task cycles" value={String(component.cycles)} /><Row label="Deployment" value="TGN · Valve operation" /><Row label="Configuration" value="CFG-HMND-0002-05" /></dl>
          </SectionCard>
          <SectionCard title="Next workflow" icon={Wrench}>
            <div className="space-y-3 text-sm"><Link href="/platform/component-health/service/SV-0014" className="block rounded-lg border border-border p-3 font-medium hover:bg-muted">Open service case SV-0014 →</Link><Link href="/platform/component-health/return-to-service/RTS-0007" className="block rounded-lg border border-border p-3 font-medium hover:bg-muted">Preview Return-to-Service record →</Link></div>
          </SectionCard>
        </div>
      </div>
    </>
  );
}
function Row({ label, value }: { label: string; value: string }) { return <div className="flex items-start justify-between gap-4"><dt className="text-muted-foreground">{label}</dt><dd className="max-w-[60%] text-right font-medium">{value}</dd></div>; }
