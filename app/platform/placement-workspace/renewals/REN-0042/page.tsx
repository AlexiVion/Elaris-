import Link from "next/link";
import { AlertTriangle, FileText, GitBranch, RefreshCcw, Siren } from "lucide-react";
import { PageHeader } from "@/components/elaris/PageHeader";
import { SectionCard } from "@/components/elaris/SectionCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/elaris/StatusPill";
import { getHorizontalPlatformData } from "@/lib/db/platform";

export default async function RenewalDetailPage() {
  const data=await getHorizontalPlatformData();
  const d=data.deployment;
  const change=d.latestChange;
  const incident=d.latestIncident;

  return (
    <>
      <PageHeader
        breadcrumb={<Link href="/platform/placement-workspace/renewals" className="hover:underline">Renewals</Link>}
        title="Humandroid · Renewal Review"
        actions={<Button asChild><Link href="/platform/placement-workspace/reports/technical-pack/SUB-0042"><FileText className="size-4" /> Generate Change Summary</Link></Button>}
      />
      <div className="-mt-3 mb-5 flex items-center gap-3"><StatusPill label="PREPARING" tone="amber" /><span className="text-sm text-muted-foreground">REN-0042 · due 18 Nov 2026</span></div>

      <Card className="mb-6 p-5">
        <div className="flex flex-wrap items-center gap-6">
          <RefreshCcw className="size-8 text-muted-foreground" />
          <div><div className="text-xs text-muted-foreground">Previous submission</div><div className="font-semibold">SUB-0042 · v1 · 12 Jun 2026</div></div>
          <div><div className="text-xs text-muted-foreground">Working renewal</div><div className="font-semibold">SUB-0042 · v2 · 01 Oct 2026</div></div>
          <div><div className="text-xs text-muted-foreground">Technical state now</div><div className="font-mono text-sm font-semibold">{d.baselineCode} · {d.snapshotCode}</div></div>
        </div>
      </Card>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <SectionCard title="Changes Since Prior Submission" icon={GitBranch} className="lg:col-span-2">
          {change ? <div className="space-y-3">{change.diff.map((item) => <div key={item.slot} className="grid gap-3 rounded-md border border-border p-4 sm:grid-cols-[180px_1fr]"><div className="text-sm font-medium">{item.slot.replaceAll("_"," ")}</div><div className="flex items-center gap-2 text-sm"><span className="rounded bg-red-50 px-2 py-1 text-red-700">{item.before ?? "—"}</span><span className="text-muted-foreground">→</span><span className="rounded bg-emerald-50 px-2 py-1 font-medium text-emerald-700">{item.after ?? "—"}</span></div></div>)}</div> : <div>No material change.</div>}
        </SectionCard>

        <SectionCard title="Renewal Signals" icon={AlertTriangle}>
          <div className="grid grid-cols-2 gap-3">
            <Counter value={change ? 1 : 0} label="Material changes" tone="amber" />
            <Counter value={change?.openImpactItems ?? 0} label="Open impact items" tone="red" />
            <Counter value={incident ? 1 : 0} label="Incidents" tone="red" />
            <Counter value={d.missingCount} label="Shared gaps" tone="amber" />
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title="Incident Since Submission" icon={Siren}>
          {incident ? <div className="rounded-md border border-red-200 bg-red-50 p-4"><div className="flex items-center justify-between gap-3"><div className="font-semibold text-red-900">{incident.code}</div><StatusPill label={incident.status} tone="red" /></div><p className="mt-2 text-sm leading-6 text-red-800">{incident.description}</p></div> : <div className="text-sm text-muted-foreground">No incident.</div>}
        </SectionCard>

        <SectionCard title="Broker Review Checklist" icon={FileText}>
          <ul className="space-y-3 text-sm">
            <Check text="Describe exact configuration changes since v1." />
            <Check text="Confirm whether supplied evidence still represents the current deployment." />
            <Check text="Review incident disclosure with the client." />
            <Check text="Refresh unanswered market questions only where needed." />
          </ul>
        </SectionCard>
      </div>

      <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50/60 px-4 py-3 text-sm text-blue-950">
        <span className="font-semibold">Insurance boundary:</span> Elaris surfaces versioned technical changes and incidents. It does not decide whether they affect coverage, pricing or terms.
      </div>
    </>
  );
}
function Counter({value,label,tone}:{value:number;label:string;tone:"amber"|"red"}){return <div className={tone==="red"?"rounded-lg bg-red-50 p-3 text-red-700":"rounded-lg bg-amber-50 p-3 text-amber-700"}><div className="text-xl font-semibold">{value}</div><div className="text-xs">{label}</div></div>}
function Check({text}:{text:string}){return <li className="flex items-start gap-2"><span className="mt-1 size-3 rounded-sm border border-border" /><span>{text}</span></li>}
