import Link from "next/link";
import { AlertTriangle, FileQuestion, MessageSquareText, RefreshCcw, Send, Users, GitBranch, FileText } from "lucide-react";
import { PageHeader } from "@/components/elaris/PageHeader";
import { KpiCard } from "@/components/elaris/KpiCard";
import { SectionCard } from "@/components/elaris/SectionCard";
import { StatusPill } from "@/components/elaris/StatusPill";
import { getHorizontalPlatformData } from "@/lib/db/platform";
import { placementQuestions, placementRenewals, placementRequests, placementSubmissions } from "@/lib/demo/placement";

export default async function PlacementWorkspaceHome() {
  const data = await getHorizontalPlatformData();
  const d = data.deployment;

  return (
    <>
      <PageHeader title="Home" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Active clients" value={4} icon={Users} tone="blue" delta={null} />
        <KpiCard label="Open submissions" value={placementSubmissions.length} icon={Send} tone="green" delta={null} />
        <KpiCard label="Open market questions" value={placementQuestions.length} icon={MessageSquareText} tone="slate" delta={null} />
        <KpiCard label="Renewals requiring work" value={placementRenewals.length} icon={RefreshCcw} tone="red" delta={null} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title="Attention Required" icon={AlertTriangle} viewAllHref="/platform/placement-workspace/requests" viewAllCount={6}>
          <ul className="divide-y divide-border">
            <Attention href="/platform/placement-workspace/requests" icon={FileQuestion} title="2 client information items missing" sub="SUB-0042 · Humandroid" />
            <Attention href="/platform/placement-workspace/questions" icon={MessageSquareText} title="Carrier technical question needs broker review" sub="MQ-221 · Atlas Specialty" />
            <Attention href="/platform/placement-workspace/renewals/REN-0042" icon={GitBranch} title={d.latestChange?.code + " changed since prior submission"} sub="SUB-0042 · renewal reconciliation" />
            <Attention href="/platform/placement-workspace/renewals/REN-0042" icon={AlertTriangle} title={d.latestIncident?.code + " incident requires disclosure review"} sub={d.name} />
          </ul>
        </SectionCard>

        <SectionCard title="Active Submissions" icon={Send} viewAllHref="/platform/placement-workspace/submissions" viewAllCount={placementSubmissions.length}>
          <ul className="space-y-3">
            {placementSubmissions.map((s) => (
              <li key={s.code}>
                <Link href={s.code === "SUB-0042" ? "/platform/placement-workspace/submissions/SUB-0042" : "/platform/placement-workspace/submissions"} className="flex items-center gap-3 rounded-md p-1 hover:bg-muted">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{s.client} · {s.subject}</div>
                    <div className="truncate text-xs text-muted-foreground">{s.code} · {s.version} · {s.markets} markets</div>
                  </div>
                  <PlacementStatus value={s.status} />
                </Link>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="Missing Client Information" icon={FileQuestion} viewAllHref="/platform/placement-workspace/requests" viewAllCount={placementRequests.length}>
          <Table headers={["Item", "Client", "Due", "Status"]}>
            {placementRequests.map((r) => (
              <tr key={r.code} className="border-t border-border">
                <td className="px-3 py-2.5">
                  <div className="font-medium">{r.item}</div>
                  <div className="text-xs text-muted-foreground">{r.code} · {r.submission}</div>
                </td>
                <td className="px-3 py-2.5">{r.client}</td>
                <td className="px-3 py-2.5 text-muted-foreground">{r.due}</td>
                <td className="px-3 py-2.5"><PlacementStatus value={r.status} /></td>
              </tr>
            ))}
          </Table>
        </SectionCard>

        <SectionCard title="Recent Market Questions" icon={MessageSquareText} viewAllHref="/platform/placement-workspace/questions" viewAllCount={placementQuestions.length}>
          <Table headers={["Market", "Question", "Status"]}>
            {placementQuestions.slice(0, 3).map((q) => (
              <tr key={q.code} className="border-t border-border">
                <td className="px-3 py-2.5 font-medium">{q.market}</td>
                <td className="max-w-sm px-3 py-2.5 text-muted-foreground">{q.question}</td>
                <td className="px-3 py-2.5"><PlacementStatus value={q.status} /></td>
              </tr>
            ))}
          </Table>
        </SectionCard>

        <SectionCard title="Changes Since Submission" icon={GitBranch} viewAllHref="/platform/placement-workspace/renewals/REN-0042" viewAllCount={1}>
          {d.latestChange ? (
            <Link href="/platform/placement-workspace/renewals/REN-0042" className="block rounded-md p-2 hover:bg-muted">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-medium">{d.latestChange.code} · configuration changed</div>
                  <div className="mt-1 text-xs text-muted-foreground">{d.latestChange.beforeSnapshotCode} → {d.latestChange.afterSnapshotCode}</div>
                </div>
                <StatusPill label={d.latestChange.openImpactItems + " open impact"} tone="amber" />
              </div>
            </Link>
          ) : <div className="py-8 text-center text-sm text-muted-foreground">No material changes.</div>}
        </SectionCard>

        <SectionCard title="Broker Outputs" icon={FileText} viewAllHref="/platform/placement-workspace/reports" viewAllCount={3}>
          <ul className="space-y-2 text-sm">
            <Output href="/platform/placement-workspace/reports/technical-pack/SUB-0042" title="Technical Submission Pack" sub="SUB-0042 · market-specific output" />
            <Output href="/platform/placement-workspace/reports" title="Missing Information List" sub="Client follow-up output" />
            <Output href="/platform/placement-workspace/reports" title="Renewal Change Summary" sub="Changes since prior submission" />
          </ul>
        </SectionCard>
      </div>
    </>
  );
}

function PlacementStatus({ value }: { value: string }) {
  const upper = value.toUpperCase();
  const tone = upper.includes("OPEN") || upper.includes("DUE") || upper.includes("REVIEW") || upper.includes("WAITING") ? "amber" : upper.includes("CURRENT") || upper.includes("ANSWERABLE") ? "green" : "blue";
  return <StatusPill label={value} tone={tone} />;
}

function Attention({ href, icon: Icon, title, sub }: { href: string; icon: typeof AlertTriangle; title: string; sub: string }) {
  return (
    <li>
      <Link href={href} className="flex items-center gap-3 py-3 hover:opacity-80">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground"><Icon className="size-4" /></span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium">{title}</div>
          <div className="truncate text-xs text-muted-foreground">{sub}</div>
        </div>
      </Link>
    </li>
  );
}

function Table({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr>{headers.map((h) => <th key={h} className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">{h}</th>)}</tr></thead><tbody>{children}</tbody></table></div>;
}

function Output({ href, title, sub }: { href: string; title: string; sub: string }) {
  return <li><Link href={href} className="flex items-center gap-3 rounded-md p-2 hover:bg-muted"><FileText className="size-4 text-muted-foreground" /><div><div className="font-medium">{title}</div><div className="text-xs text-muted-foreground">{sub}</div></div></Link></li>;
}
