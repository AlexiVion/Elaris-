import Link from "next/link";
import { PageHeader } from "@/components/elaris/PageHeader";
import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/elaris/StatusPill";
import { componentHealthRobots } from "@/lib/demo/component-health";

export default function ComponentHealthRobotsPage() {
  return (
    <>
      <PageHeader title="Robots" />
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted/40">{["Robot","Model","Site / task","Configuration","Runtime","Cycles","Attention","Health"].map((h) => <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">{h}</th>)}</tr></thead>
            <tbody>{componentHealthRobots.map((robot) => (
              <tr key={robot.code} className="border-b border-border last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3"><Link href={robot.code === "HMND-0002" ? "/platform/component-health/robots/HMND-0002" : "/platform/component-health/robots"} className="font-medium text-primary hover:underline">{robot.code}</Link></td>
                <td className="px-4 py-3 font-medium">{robot.model}</td>
                <td className="px-4 py-3"><div>{robot.site}</div><div className="text-xs text-muted-foreground">{robot.task}</div></td>
                <td className="px-4 py-3 text-xs">{robot.configuration}</td><td className="px-4 py-3">{robot.operatingHours} h</td><td className="px-4 py-3">{robot.taskCycles}</td><td className="px-4 py-3">{robot.attentionComponents}</td>
                <td className="px-4 py-3"><StatusPill label={robot.health} tone={robot.health === "ATTENTION" ? "amber" : "green"} /></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
