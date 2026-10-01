import Link from "next/link";
import { PageHeader } from "@/components/elaris/PageHeader";
import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/elaris/StatusPill";
import { placementSubmissions } from "@/lib/demo/placement";

export default function PlacementSubmissionsPage() {
  return (
    <>
      <PageHeader title="Submissions" />
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted/40">
              {["Submission", "Client", "Subject", "Version", "Markets", "Gaps", "Questions", "Status"].map((h) => <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">{h}</th>)}
            </tr></thead>
            <tbody>
              {placementSubmissions.map((s) => (
                <tr key={s.code} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3"><Link href={s.code === "SUB-0042" ? "/platform/placement-workspace/submissions/SUB-0042" : "/platform/placement-workspace/submissions"} className="font-medium text-primary hover:underline">{s.code}</Link><div className="text-xs text-muted-foreground">{s.updated}</div></td>
                  <td className="px-4 py-3 font-medium">{s.client}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.subject}</td>
                  <td className="px-4 py-3">{s.version}</td>
                  <td className="px-4 py-3">{s.markets}</td>
                  <td className="px-4 py-3">{s.gaps}</td>
                  <td className="px-4 py-3">{s.questions}</td>
                  <td className="px-4 py-3"><StatusPill label={s.status} tone={s.status.includes("OPEN") || s.status.includes("DUE") ? "amber" : "blue"} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
