import Link from "next/link";
import { Activity, Bot, ClipboardCheck, HeartPulse, Wrench, ArrowRight, TriangleAlert } from "lucide-react";
import { PageHeader } from "@/components/elaris/PageHeader";
import { KpiCard } from "@/components/elaris/KpiCard";
import { SectionCard } from "@/components/elaris/SectionCard";
import { StatusPill } from "@/components/elaris/StatusPill";
import { componentHealthRobots, healthCase, serviceEvents } from "@/lib/demo/component-health";

export default function ComponentHealthHome() {
  return (
    <>
      <PageHeader title="Fleet Health" actions={<StatusPill label="HYPOTHESIS · DEMO V0" tone="blue" />} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Robots in demo fleet" value={componentHealthRobots.length} icon={Bot} tone="blue" delta={null} />
        <KpiCard label="Components requiring attention" value={1} icon={HeartPulse} tone="red" delta={null} />
        <KpiCard label="Open service actions" value={1} icon={Wrench} tone="slate" delta={null} />
        <KpiCard label="Return-to-service reviews" value={1} icon={ClipboardCheck} tone="green" delta={null} />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <SectionCard title="Attention Required" icon={TriangleAlert} viewAllHref="/platform/component-health/attention" viewAllCount={1}>
          <Link href="/platform/component-health/components/CMP-KNEE-L-002" className="block rounded-lg border border-amber-200 bg-amber-50 p-4 hover:bg-amber-100/70">
            <div className="flex items-start justify-between gap-3">
              <div><div className="text-sm font-semibold text-amber-950">{healthCase.componentName}</div><div className="mt-1 text-xs text-amber-800">{healthCase.robot} · {healthCase.code}</div><p className="mt-3 text-sm leading-5 text-amber-900">{healthCase.summary}</p><div className="mt-3 text-xs font-medium text-amber-900">Suggested human action: {healthCase.suggestedAction}</div></div>
              <StatusPill label={healthCase.status} tone="amber" />
            </div>
          </Link>
        </SectionCard>
        <SectionCard title="Fleet" icon={Bot} viewAllHref="/platform/component-health/robots" viewAllCount={componentHealthRobots.length}>
          <div className="space-y-3">{componentHealthRobots.map((robot) => (
            <Link key={robot.code} href={robot.code === "HMND-0002" ? "/platform/component-health/robots/HMND-0002" : "/platform/component-health/robots"} className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-muted/40">
              <span className="flex size-9 items-center justify-center rounded-md bg-muted"><Bot className="size-4 text-muted-foreground" /></span>
              <div className="min-w-0 flex-1"><div className="text-sm font-medium">{robot.code} · {robot.model}</div><div className="truncate text-xs text-muted-foreground">{robot.site} · {robot.task}</div></div>
              <StatusPill label={robot.health} tone={robot.health === "ATTENTION" ? "amber" : "green"} />
            </Link>
          ))}</div>
        </SectionCard>
        <SectionCard title="Recent Service" icon={Wrench} viewAllHref="/platform/component-health/service" viewAllCount={serviceEvents.length}>
          <div className="space-y-3">{serviceEvents.map((event) => (
            <Link key={event.code} href={event.code === "SV-0014" ? "/platform/component-health/service/SV-0014" : "/platform/component-health/service"} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3 hover:bg-muted/40">
              <div><div className="text-sm font-medium">{event.code} · {event.component}</div><div className="mt-1 text-xs text-muted-foreground">{event.robot} · Trigger: {event.trigger}</div></div>
              <StatusPill label={event.status} tone={event.status.includes("PLANNED") ? "amber" : "green"} />
            </Link>
          ))}</div>
        </SectionCard>
        <SectionCard title="V0 Reliability Loop" icon={Activity}>
          <div className="grid gap-2 text-sm">{["Health signal appears","Human investigates evidence","Inspect / service / replace","Configuration changes","Revalidation checks","Named Return-to-Service","Outcome retained"].map((step, index) => (
            <div key={step} className="flex items-center gap-3 rounded-md bg-muted/40 px-3 py-2"><span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-slate-950 text-xs font-semibold text-white">{index + 1}</span><span>{step}</span>{index < 6 && <ArrowRight className="ml-auto size-4 text-muted-foreground" />}</div>
          ))}</div>
          <p className="mt-4 text-xs leading-5 text-muted-foreground">V0 is not predictive maintenance. It demonstrates identity + history + rules/deviations + human outcome. Failure probability and remaining useful life require real longitudinal data.</p>
        </SectionCard>
      </div>
    </>
  );
}
