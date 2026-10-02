import Link from "next/link";
import { Activity, Box, GitBranch, MapPin } from "lucide-react";
import { PageHeader } from "@/components/elaris/PageHeader";
import { SectionCard } from "@/components/elaris/SectionCard";
import { StatusPill } from "@/components/elaris/StatusPill";
import { Card } from "@/components/ui/card";
import { componentHealthComponents, focusRobot } from "@/lib/demo/component-health";

export default function HMND0002HealthPage() {
  return (
    <>
      <PageHeader title={focusRobot.code + " · " + focusRobot.model} breadcrumb={<Link href="/platform/component-health/robots" className="hover:underline">Robots</Link>} actions={<StatusPill label={focusRobot.health} tone="amber" />} />
      <div className="grid gap-4 md:grid-cols-4">
        <Info label="Deployment context" value={focusRobot.site + " · " + focusRobot.task} icon={MapPin} />
        <Info label="Configuration" value={focusRobot.configuration} icon={GitBranch} />
        <Info label="Operating hours" value={focusRobot.operatingHours + " h"} icon={Activity} />
        <Info label="Task cycles" value={String(focusRobot.taskCycles)} icon={Box} />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <SectionCard title="Components" icon={Box}>
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead><tr className="border-b border-border">{["Component","Serial","Runtime","Cycles","Health"].map((h) => <th key={h} className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">{h}</th>)}</tr></thead>
            <tbody>{componentHealthComponents.map((component) => (
              <tr key={component.code} className="border-b border-border last:border-0">
                <td className="px-3 py-3"><Link href={component.code === "CMP-KNEE-L-002" ? "/platform/component-health/components/CMP-KNEE-L-002" : "/platform/component-health/robots/HMND-0002"} className="font-medium text-primary hover:underline">{component.name}</Link><div className="text-xs text-muted-foreground">{component.code}</div></td>
                <td className="px-3 py-3 text-xs">{component.serial}</td><td className="px-3 py-3">{component.runtimeHours} h</td><td className="px-3 py-3">{component.cycles}</td>
                <td className="px-3 py-3"><StatusPill label={component.status} tone={component.status === "ATTENTION" ? "amber" : component.status === "MONITOR" ? "blue" : "green"} /></td>
              </tr>
            ))}</tbody>
          </table></div>
        </SectionCard>
        <SectionCard title="Technical context" icon={GitBranch}>
          <dl className="space-y-4 text-sm"><Row label="Robot" value="HMND-0002" /><Row label="Model" value="Unitree G1" /><Row label="Site" value="TGN" /><Row label="Task" value="Valve operation" /><Row label="Configuration" value={focusRobot.configuration} /><Row label="Health scope" value="Synthetic Component Health demo" /></dl>
          <Link href="/platform/deployment-control/deployments/DEP-0017" className="mt-5 inline-flex text-sm font-medium text-primary hover:underline">Open shared deployment context</Link>
        </SectionCard>
      </div>
    </>
  );
}
function Info({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Activity }) { return <Card className="p-4"><Icon className="size-4 text-muted-foreground" /><div className="mt-3 text-xs text-muted-foreground">{label}</div><div className="mt-1 text-sm font-semibold">{value}</div></Card>; }
function Row({ label, value }: { label: string; value: string }) { return <div className="flex items-start justify-between gap-4"><dt className="text-muted-foreground">{label}</dt><dd className="text-right font-medium">{value}</dd></div>; }
