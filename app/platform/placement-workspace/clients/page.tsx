import { PageHeader } from "@/components/elaris/PageHeader";
import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/elaris/StatusPill";
import { placementClients } from "@/lib/demo/placement";

export default function PlacementClientsPage() {
  return (
    <>
      <PageHeader title="Clients" />
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted/40">
              {["Client", "Segment", "Deployments", "Open submissions", "Renewal", "Status"].map((h) => <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">{h}</th>)}
            </tr></thead>
            <tbody>
              {placementClients.map((c) => (
                <tr key={c.code} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3"><div className="font-medium text-primary">{c.name}</div><div className="text-xs text-muted-foreground">{c.code}</div></td>
                  <td className="px-4 py-3 text-muted-foreground">{c.segment}</td>
                  <td className="px-4 py-3">{c.deployments}</td>
                  <td className="px-4 py-3">{c.openSubmissions}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.renewal}</td>
                  <td className="px-4 py-3"><StatusPill label={c.status} tone={c.status === "RENEWAL DUE" ? "amber" : "green"} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
