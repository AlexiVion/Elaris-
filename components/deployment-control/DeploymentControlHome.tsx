import Link from "next/link";
import {
  Layers,
  Bot,
  AlertTriangle,
  ClipboardList,
  CircleAlert,
  GitBranch,
  FileText,
  CalendarClock,
  ChevronRight,
} from "lucide-react";
import { PageHeader } from "@/components/elaris/PageHeader";
import { KpiCard } from "@/components/elaris/KpiCard";
import { SectionCard } from "@/components/elaris/SectionCard";
import { ReadinessBar } from "@/components/elaris/ReadinessBar";
import { EnumPill } from "@/components/elaris/EnumPill";
import { copy } from "@/lib/copy/en";
import {
  lifecyclePill,
  operationalStatePill,
  severityPill,
  evidenceStatusPill,
  incidentStatusPill,
  kindLabel,
  slotLabel,
} from "@/lib/copy/labels";
import { getHomeData } from "@/lib/db/home";
import { formatDateTime, formatDate, timeAgo } from "@/lib/format";
import type { DiffEntry } from "@/lib/domain/types";

function changeSummary(diff: DiffEntry[]): string {
  if (diff.length === 0) return "Configuration change";
  if (diff.length === 1) {
    const d = diff[0]!;
    return `${slotLabel[d.slot]} → ${d.after ?? "—"}`;
  }
  return `${diff.map((d) => slotLabel[d.slot]).join(", ")} updated`;
}

const th = "px-3 py-2 text-left text-xs font-medium text-muted-foreground";
const td = "px-3 py-2.5 align-top";

export default async function HomePage() {
  const data = await getHomeData();

  return (
    <>
      <PageHeader title={copy.home.title} />

      {/* KPIs (spec §6.7) — deltas omitted until reconstructable from audit (§6.7). */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label={copy.home.kpis.activeDeployments} value={data.kpis.activeDeployments} icon={Layers} tone="green" delta={null} />
        <KpiCard label={copy.home.kpis.robots} value={data.kpis.robots} icon={Bot} tone="blue" delta={null} />
        <KpiCard label={copy.home.kpis.openGaps} value={data.kpis.openGaps} icon={AlertTriangle} tone="red" delta={null} />
        <KpiCard label={copy.home.kpis.reviewRequired} value={data.kpis.reviewRequired} icon={ClipboardList} tone="slate" delta={null} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Attention Required */}
        <SectionCard title={copy.home.attentionRequired} icon={CircleAlert} viewAllHref="/changes" viewAllCount={data.attentionTotal}>
          {data.attention.length === 0 ? (
            <EmptyRow>Nothing needs attention.</EmptyRow>
          ) : (
            <ul className="divide-y divide-border">
              {data.attention.slice(0, 4).map((a, i) => (
                <li key={i}>
                  <Link href={a.href} className="flex items-center gap-3 py-3 hover:opacity-80">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                      {a.kind === "change" ? <GitBranch className="size-4" /> : <ClipboardList className="size-4" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{a.title}</div>
                      <div className="truncate text-xs text-muted-foreground">{a.subtitle}</div>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">{a.at ? timeAgo(a.at) : ""}</span>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        {/* Active Deployments */}
        <SectionCard title={copy.home.activeDeployments} icon={Layers} viewAllHref="/deployments" viewAllCount={data.activeDeploymentsTotal}>
          <ul className="space-y-3">
            {data.activeDeployments.map((d) => (
              <li key={d.code}>
                <Link href={`/deployments/${d.code}`} className="flex items-center gap-3 rounded-md p-1 hover:bg-muted">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{d.name}</div>
                    <div className="truncate text-xs text-muted-foreground">
                      {d.customerName} · {d.siteCity}, {d.siteCountry}
                    </div>
                  </div>
                  <EnumPill value={d.operationalState} map={operationalStatePill} />
                  <div className="w-28 shrink-0">
                    <ReadinessBar percent={d.readinessPercent} showLabel={false} />
                    <div className="mt-1 text-right text-xs font-semibold tabular-nums">{d.readinessPercent}%</div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </SectionCard>

        {/* Recent Changes */}
        <SectionCard title={copy.home.recentChanges} icon={GitBranch} viewAllHref="/changes" viewAllCount={data.recentChangesTotal}>
          <TableWrap headers={[copy.common.asset, copy.common.change, copy.common.date, copy.common.impact]}>
            {data.recentChanges.map((c) => (
              <tr key={c.code} className="border-t border-border">
                <td className={td}>
                  <Link href={`/changes/${c.code}`} className="font-medium hover:underline">{c.robotCode}</Link>
                </td>
                <td className={td}>{changeSummary(c.diff)}</td>
                <td className={`${td} whitespace-nowrap text-muted-foreground`}>{formatDate(c.createdAt)}</td>
                <td className={td}>{c.maxSeverity ? <EnumPill value={c.maxSeverity} map={severityPill} /> : <span className="text-muted-foreground">—</span>}</td>
              </tr>
            ))}
          </TableWrap>
        </SectionCard>

        {/* Missing Evidence */}
        <SectionCard title={copy.home.missingEvidence} icon={FileText} viewAllHref="/evidence" viewAllCount={data.missingEvidenceTotal}>
          <TableWrap headers={[copy.common.item, copy.common.relatedTo, copy.common.type]}>
            {data.missingEvidence.map((e) => (
              <tr key={e.code} className="border-t border-border">
                <td className={`${td} font-medium`}>{e.title}</td>
                <td className={`${td} text-muted-foreground`}>{e.deploymentName}</td>
                <td className={td}>{kindLabel[e.kind] ?? e.kind}</td>
              </tr>
            ))}
          </TableWrap>
        </SectionCard>

        {/* Upcoming Reviews */}
        <SectionCard title={copy.home.upcomingReviews} icon={CalendarClock} viewAllHref="/requirements" viewAllCount={data.upcomingReviewsTotal}>
          <TableWrap headers={[copy.common.item, copy.common.relatedTo, copy.common.dueDate, copy.common.status]}>
            {data.upcomingReviews.map((e) => (
              <tr key={e.code} className="border-t border-border">
                <td className={`${td} font-medium`}>{e.title}</td>
                <td className={`${td} text-muted-foreground`}>{e.deploymentName}</td>
                <td className={`${td} whitespace-nowrap text-muted-foreground`}>{formatDate(e.dueDate)}</td>
                <td className={td}><EnumPill value={e.status} map={evidenceStatusPill} /></td>
              </tr>
            ))}
          </TableWrap>
        </SectionCard>

        {/* Incidents */}
        <SectionCard title={copy.home.incidents} icon={AlertTriangle} viewAllHref="/incidents" viewAllCount={data.incidentsTotal}>
          <TableWrap headers={[copy.common.date, copy.common.asset, copy.common.description, copy.common.severity, copy.common.status]}>
            {data.incidents.map((i) => (
              <tr key={i.code} className="border-t border-border">
                <td className={`${td} whitespace-nowrap text-muted-foreground`}>{formatDateTime(i.occurredAt)}</td>
                <td className={`${td} font-medium`}>{i.robotCode}</td>
                <td className={td}>{i.description}</td>
                <td className={td}><EnumPill value={i.severity} map={severityPill} /></td>
                <td className={td}><EnumPill value={i.status} map={incidentStatusPill} /></td>
              </tr>
            ))}
          </TableWrap>
        </SectionCard>
      </div>
    </>
  );
}

function TableWrap({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h} className={th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function EmptyRow({ children }: { children: React.ReactNode }) {
  return <div className="py-8 text-center text-sm text-muted-foreground">{children}</div>;
}
