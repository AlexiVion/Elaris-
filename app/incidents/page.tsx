import { Card } from "@/components/ui/card";
import { EnumPill } from "@/components/elaris/EnumPill";
import { IncidentFormDialog } from "@/components/elaris/IncidentFormDialog";
import { copy } from "@/lib/copy/en";
import { severityPill, incidentStatusPill } from "@/lib/copy/labels";
import { getIncidentList, getIncidentOptions } from "@/lib/db/incidents";
import { formatDateTime } from "@/lib/format";

const th = "px-4 py-3 text-left text-xs font-medium text-muted-foreground";

export default async function IncidentsPage() {
  const [incidents, options] = await Promise.all([getIncidentList(), getIncidentOptions()]);

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">{copy.nav.incidents}</h1>
        <IncidentFormDialog deployments={options} />
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className={th}>Code</th>
                <th className={th}>{copy.common.date}</th>
                <th className={th}>Deployment</th>
                <th className={th}>{copy.common.asset}</th>
                <th className={th}>{copy.common.description}</th>
                <th className={th}>Linked baseline</th>
                <th className={th}>{copy.common.severity}</th>
                <th className={th}>{copy.common.status}</th>
              </tr>
            </thead>
            <tbody>
              {incidents.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">No incidents.</td></tr>
              ) : incidents.map((i) => (
                <tr key={i.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{i.code}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{formatDateTime(i.occurredAt)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{i.deploymentName}</td>
                  <td className="px-4 py-3">{i.robotCode}</td>
                  <td className="px-4 py-3">{i.description}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{i.baselineIdAtTime ? "linked" : "—"}</td>
                  <td className="px-4 py-3"><EnumPill value={i.severity} map={severityPill} /></td>
                  <td className="px-4 py-3"><EnumPill value={i.status} map={incidentStatusPill} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
