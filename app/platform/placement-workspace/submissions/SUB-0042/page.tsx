import Link from "next/link";
import { AlertTriangle, Bot, Building2, FileCheck2, FileQuestion, FileText, GitBranch, Layers, MessageSquareText, Send } from "lucide-react";
import { PageHeader } from "@/components/elaris/PageHeader";
import { SectionCard } from "@/components/elaris/SectionCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/elaris/StatusPill";
import { getHorizontalPlatformData } from "@/lib/db/platform";
import { placementQuestions, placementRequests } from "@/lib/demo/placement";

export default async function SubmissionDetailPage() {
  const data = await getHorizontalPlatformData();
  const d = data.deployment;

  return (
    <>
      <PageHeader
        breadcrumb={<Link href="/platform/placement-workspace/submissions" className="hover:underline">Submissions</Link>}
        title="Humandroid Robotics Programme"
        actions={
          <>
            <Button variant="outline" asChild><Link href="/platform/placement-workspace/questions"><MessageSquareText className="size-4" /> Market Questions</Link></Button>
            <Button asChild><Link href="/platform/placement-workspace/reports/technical-pack/SUB-0042"><FileText className="size-4" /> Generate Pack</Link></Button>
          </>
        }
      />

      <div className="-mt-3 mb-5 flex items-center gap-3">
        <StatusPill label="QUESTIONS OPEN" tone="amber" />
        <span className="text-sm text-muted-foreground">SUB-0042 · version 2</span>
      </div>

      <Card className="mb-5 border-primary/20 bg-primary/[0.03] px-4 py-3">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm">
          <Meta label="Broker" value="Vector Specialty Brokerage · fictional" />
          <Meta label="Technical record" value={d.baselineCode + " · " + d.snapshotCode} mono />
          <Meta label="Markets reviewing" value="2 fictional markets" />
          <Meta label="Last updated" value="01 Oct 2026" />
        </div>
      </Card>

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Kpi icon={Building2} label="Client" value="Humandroid" />
        <Kpi icon={Layers} label="Deployment" value={d.code} />
        <Kpi icon={Bot} label="Robot" value={d.robotCode} />
        <Kpi icon={FileCheck2} label="Evidence" value={String(d.evidenceCount)} />
        <Kpi icon={FileQuestion} label="Open gaps" value={String(placementRequests.filter((r) => r.submission === "SUB-0042").length)} attention />
        <Kpi icon={MessageSquareText} label="Market questions" value={String(placementQuestions.filter((q) => q.submission === "SUB-0042").length)} attention />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <SectionCard title="Submission Scope" icon={Send} className="lg:col-span-2">
          <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
            <Field label="Insured / client" value="Humandroid · illustrative scenario" />
            <Field label="Coverage context" value="Robotics / technology liability · illustrative only" />
            <Field label="Deployment" value={d.name + " · " + d.code} />
            <Field label="Site / customer" value={d.site + " · " + d.customer} />
            <Field label="Task" value={d.task} />
            <Field label="Operating context" value={d.operatingMode.replaceAll("_", " ") + " · " + d.humanExposure.replaceAll("_", " ")} />
          </div>
        </SectionCard>

        <SectionCard title="Submission Health" icon={AlertTriangle}>
          <div className="grid grid-cols-2 gap-3">
            <Counter value={d.evidenceCount} label="Evidence available" tone="green" />
            <Counter value={d.missingCount} label="Shared gaps" tone="red" />
            <Counter value={placementQuestions.filter((q) => q.submission === "SUB-0042").length} label="Questions" tone="amber" />
            <Counter value={d.latestChange?.openImpactItems ?? 0} label="Open change impact" tone="blue" />
          </div>
        </SectionCard>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title="Exact Deployed Configuration" icon={Layers}>
          <div className="overflow-hidden rounded-md border border-border">
            <table className="w-full text-sm">
              <tbody>
                {d.configurationItems.map((item) => (
                  <tr key={item.slot} className="border-b border-border last:border-0">
                    <td className="px-4 py-2.5 text-muted-foreground">{item.slot.replaceAll("_", " ")}</td>
                    <td className="px-4 py-2.5 text-right font-medium">{item.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Link href={"/deployments/" + d.code} className="mt-4 inline-flex text-sm font-medium text-primary hover:underline">Open shared technical source →</Link>
        </SectionCard>

        <SectionCard title="Information Gaps" icon={FileQuestion} viewAllHref="/platform/placement-workspace/requests" viewAllCount={placementRequests.length}>
          <ul className="divide-y divide-border">
            {placementRequests.filter((r) => r.submission === "SUB-0042").map((r) => (
              <li key={r.code} className="py-3">
                <div className="flex items-start justify-between gap-3">
                  <div><div className="text-sm font-medium">{r.item}</div><div className="mt-1 text-xs text-muted-foreground">{r.code} · owner {r.owner} · due {r.due}</div></div>
                  <StatusPill label={r.status} tone="amber" />
                </div>
              </li>
            ))}
          </ul>
          <Button className="mt-4" variant="outline"><FileQuestion className="size-4" /> Draft client information request</Button>
        </SectionCard>
      </div>

      <SectionCard title="Technical Evidence Pack" icon={FileCheck2}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr>{["Evidence", "Source", "Owner", "Status"].map((h) => <th key={h} className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">{h}</th>)}</tr></thead>
            <tbody>
              {d.evidence.slice(0, 8).map((e) => (
                <tr key={e.code} className="border-t border-border">
                  <td className="px-3 py-3"><div className="font-medium">{e.title}</div><div className="text-xs text-muted-foreground">{e.code}</div></td>
                  <td className="px-3 py-3 text-muted-foreground">{e.source}</td>
                  <td className="px-3 py-3">{e.owner}</td>
                  <td className="px-3 py-3"><StatusPill label={e.status.replaceAll("_", " ")} tone={e.status === "VALID" ? "green" : e.status === "MISSING" ? "red" : "amber"} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {d.latestChange && (
        <div className="mt-6">
          <SectionCard title="Change Since Submission" icon={GitBranch} action={<Link href="/platform/placement-workspace/renewals/REN-0042" className="text-sm font-medium text-primary hover:underline">Review renewal impact →</Link>}>
            <div className="flex flex-wrap items-center gap-5">
              <div><div className="text-xs text-muted-foreground">Change</div><div className="font-semibold">{d.latestChange.code}</div></div>
              <div><div className="text-xs text-muted-foreground">Configuration</div><div className="font-mono text-sm">{d.latestChange.beforeSnapshotCode} → {d.latestChange.afterSnapshotCode}</div></div>
              <div><div className="text-xs text-muted-foreground">Open impact</div><div className="font-semibold">{d.latestChange.openImpactItems}</div></div>
              <StatusPill label={d.latestChange.status.replaceAll("_", " ")} tone="amber" />
            </div>
          </SectionCard>
        </div>
      )}
    </>
  );
}

function Meta({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return <div><div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</div><div className={mono ? "font-mono text-xs font-semibold" : "font-semibold"}>{value}</div></div>;
}
function Kpi({ icon: Icon, label, value, attention = false }: { icon: typeof Bot; label: string; value: string; attention?: boolean }) {
  return <Card className={attention ? "flex items-center gap-3 border-amber-200 bg-amber-50 p-4" : "flex items-center gap-3 p-4"}><Icon className={attention ? "size-5 text-amber-700" : "size-5 text-muted-foreground"} /><div><div className="text-xs text-muted-foreground">{label}</div><div className="font-semibold">{value}</div></div></Card>;
}
function Field({ label, value }: { label: string; value: string }) {
  return <div><div className="text-xs text-muted-foreground">{label}</div><div className="mt-1 text-sm font-medium">{value}</div></div>;
}
function Counter({ value, label, tone }: { value: number; label: string; tone: "green" | "red" | "amber" | "blue" }) {
  const cls={green:"bg-emerald-50 text-emerald-700",red:"bg-red-50 text-red-700",amber:"bg-amber-50 text-amber-700",blue:"bg-blue-50 text-blue-700"}[tone];
  return <div className={"rounded-lg p-3 " + cls}><div className="text-xl font-semibold">{value}</div><div className="text-xs">{label}</div></div>;
}
