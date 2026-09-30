import Link from "next/link";
import { PageHeader } from "@/components/elaris/PageHeader";
import { Card } from "@/components/ui/card";
import { EnumPill } from "@/components/elaris/EnumPill";
import { copy } from "@/lib/copy/en";
import { robotStatusPill } from "@/lib/copy/labels";
import { getRobotList } from "@/lib/db/robots";
import { formatDate } from "@/lib/format";

const th = "px-4 py-3 text-left text-xs font-medium text-muted-foreground";

export default async function RobotsPage() {
  const robots = await getRobotList();

  return (
    <>
      <PageHeader title={copy.nav.robots} />
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className={th}>Code</th>
                <th className={th}>Model</th>
                <th className={th}>Serial number</th>
                <th className={th}>Current deployment</th>
                <th className={th}>Active snapshot</th>
                <th className={th}>Last change</th>
                <th className={th}>{copy.common.status}</th>
              </tr>
            </thead>
            <tbody>
              {robots.map((r) => (
                <tr key={r.code} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <Link href={`/robots/${encodeURIComponent(r.code)}`} className="font-medium text-primary hover:underline">{r.code}</Link>
                  </td>
                  <td className="px-4 py-3">{r.model}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{r.serialNumber}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {r.deploymentCode ? <Link href={`/deployments/${r.deploymentCode}`} className="hover:underline">{r.deploymentName}</Link> : "—"}
                  </td>
                  <td className="px-4 py-3">{r.activeSnapshotCode}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                    {r.lastChangeCode ? <Link href={`/changes/${r.lastChangeCode}`} className="hover:underline">{formatDate(r.lastChangeAt)}</Link> : "—"}
                  </td>
                  <td className="px-4 py-3"><EnumPill value={r.status} map={robotStatusPill} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
