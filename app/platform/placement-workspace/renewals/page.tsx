import Link from "next/link";
import { RefreshCcw } from "lucide-react";
import { PageHeader } from "@/components/elaris/PageHeader";
import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/elaris/StatusPill";
import { placementRenewals } from "@/lib/demo/placement";

export default function PlacementRenewalsPage() {
  return (
    <>
      <PageHeader title="Renewals" />
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted/40">
              {["Renewal", "Client", "Submission", "Due", "Changes", "Incidents", "Status"].map((h) => <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">{h}</th>)}
            </tr></thead>
            <tbody>
              {placementRenewals.map((r) => (
                <tr key={r.code} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3"><Link href={r.code === "REN-0042" ? "/platform/placement-workspace/renewals/REN-0042" : "/platform/placement-workspace/renewals"} className="inline-flex items-center gap-2 font-medium text-primary hover:underline"><RefreshCcw className="size-4" />{r.code}</Link></td>
                  <td className="px-4 py-3">{r.client}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.submission}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.due}</td>
                  <td className="px-4 py-3">{r.changes}</td>
                  <td className="px-4 py-3">{r.incidents}</td>
                  <td className="px-4 py-3"><StatusPill label={r.status} tone="amber" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
