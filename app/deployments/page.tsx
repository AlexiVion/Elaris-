import Link from "next/link";
import { PageHeader } from "@/components/elaris/PageHeader";
import { Card } from "@/components/ui/card";
import { ReadinessBar } from "@/components/elaris/ReadinessBar";
import { EnumPill } from "@/components/elaris/EnumPill";
import { copy } from "@/lib/copy/en";
import { lifecyclePill, operationalStatePill } from "@/lib/copy/labels";
import { getDeploymentSummaries } from "@/lib/db/deployments";

export default async function DeploymentsPage() {
  const deps = await getDeploymentSummaries();

  return (
    <>
      <PageHeader title={copy.nav.deployments} />
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Deployment</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Site</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Lifecycle</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">{copy.common.status}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">{copy.home.readiness}</th>
              </tr>
            </thead>
            <tbody>
              {deps.map((d) => (
                <tr key={d.code} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <Link href={`/deployments/${d.code}`} className="font-medium text-primary hover:underline">
                      {d.name}
                    </Link>
                    <div className="text-xs text-muted-foreground">{d.code}</div>
                  </td>
                  <td className="px-4 py-3">{d.customerName}</td>
                  <td className="px-4 py-3 text-muted-foreground">{d.siteCity}, {d.siteCountry}</td>
                  <td className="px-4 py-3"><EnumPill value={d.lifecycle} map={lifecyclePill} /></td>
                  <td className="px-4 py-3"><EnumPill value={d.operationalState} map={operationalStatePill} /></td>
                  <td className="px-4 py-3">
                    <div className="w-40"><ReadinessBar percent={d.readinessPercent} /></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
