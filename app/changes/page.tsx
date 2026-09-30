import Link from "next/link";
import { PageHeader } from "@/components/elaris/PageHeader";
import { Card } from "@/components/ui/card";
import { EnumPill } from "@/components/elaris/EnumPill";
import { copy } from "@/lib/copy/en";
import { changeStatusPill, severityPill, slotLabel } from "@/lib/copy/labels";
import { getChangeList } from "@/lib/db/changes";
import { formatDate } from "@/lib/format";
import type { DiffEntry } from "@/lib/domain/types";

function summary(diff: DiffEntry[]): string {
  if (diff.length === 0) return "Configuration change";
  if (diff.length === 1) return `${slotLabel[diff[0]!.slot]} → ${diff[0]!.after ?? "—"}`;
  return `${diff.map((d) => slotLabel[d.slot]).join(", ")} updated`;
}

const th = "px-4 py-3 text-left text-xs font-medium text-muted-foreground";

export default async function ChangesPage() {
  const changes = await getChangeList();

  return (
    <>
      <PageHeader title={copy.nav.changes} />
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className={th}>Change</th>
                <th className={th}>{copy.common.asset}</th>
                <th className={th}>Deployment</th>
                <th className={th}>{copy.common.author}</th>
                <th className={th}>{copy.common.date}</th>
                <th className={th}>{copy.common.status}</th>
                <th className={th}>{copy.common.impact}</th>
              </tr>
            </thead>
            <tbody>
              {changes.map((c) => (
                <tr key={c.code} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <Link href={`/changes/${c.code}`} className="font-medium text-primary hover:underline">{c.code}</Link>
                    <div className="text-xs text-muted-foreground">{summary(c.diff)}</div>
                  </td>
                  <td className="px-4 py-3">{c.robotCode}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.deploymentName}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.authorName}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{formatDate(c.createdAt)}</td>
                  <td className="px-4 py-3"><EnumPill value={c.status} map={changeStatusPill} /></td>
                  <td className="px-4 py-3">{c.maxSeverity ? <EnumPill value={c.maxSeverity} map={severityPill} /> : <span className="text-muted-foreground">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
