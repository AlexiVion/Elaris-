import { FileQuestion, Send } from "lucide-react";
import { PageHeader } from "@/components/elaris/PageHeader";
import { SectionCard } from "@/components/elaris/SectionCard";
import { StatusPill } from "@/components/elaris/StatusPill";
import { Button } from "@/components/ui/button";
import { placementRequests } from "@/lib/demo/placement";

export default function PlacementRequestsPage() {
  return (
    <>
      <PageHeader title="Information Requests" actions={<Button><Send className="size-4" /> New demo request</Button>} />
      <SectionCard title="Open client information requests" icon={FileQuestion}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr>{["Request", "Client / submission", "Item", "Owner", "Due", "Priority", "Status"].map((h) => <th key={h} className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">{h}</th>)}</tr></thead>
            <tbody>
              {placementRequests.map((r) => (
                <tr key={r.code} className="border-t border-border">
                  <td className="px-3 py-3 font-medium">{r.code}</td>
                  <td className="px-3 py-3">{r.client}<div className="text-xs text-muted-foreground">{r.submission}</div></td>
                  <td className="px-3 py-3">{r.item}</td>
                  <td className="px-3 py-3 text-muted-foreground">{r.owner}</td>
                  <td className="px-3 py-3 text-muted-foreground">{r.due}</td>
                  <td className="px-3 py-3"><StatusPill label={r.priority} tone={r.priority === "HIGH" ? "red" : "amber"} /></td>
                  <td className="px-3 py-3"><StatusPill label={r.status} tone="amber" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </>
  );
}
