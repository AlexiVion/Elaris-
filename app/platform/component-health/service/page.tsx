import Link from "next/link";
import { Wrench } from "lucide-react";
import { PageHeader } from "@/components/elaris/PageHeader";
import { SectionCard } from "@/components/elaris/SectionCard";
import { StatusPill } from "@/components/elaris/StatusPill";
import { serviceEvents } from "@/lib/demo/component-health";

export default function ServicePage() {
  return (
    <>
      <PageHeader title="Service" />
      <SectionCard title="Service events" icon={Wrench} viewAllCount={serviceEvents.length}>
        <div className="space-y-3">{serviceEvents.map((event) => (
          <Link key={event.code} href={event.code === "SV-0014" ? "/platform/component-health/service/SV-0014" : "/platform/component-health/service"} className="grid gap-2 rounded-lg border border-border p-4 hover:bg-muted/40 md:grid-cols-[auto_1fr_auto] md:items-center">
            <div className="font-mono text-xs text-muted-foreground">{event.code}</div><div><div className="text-sm font-semibold">{event.robot} · {event.component}</div><div className="mt-1 text-xs text-muted-foreground">Trigger: {event.trigger} · {event.owner}</div></div><StatusPill label={event.status} tone={event.status.includes("PLANNED") ? "amber" : "green"} />
          </Link>
        ))}</div>
      </SectionCard>
    </>
  );
}
