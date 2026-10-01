import Link from "next/link";
import { Download, ExternalLink, FileText, Printer, Share2 } from "lucide-react";
import { PageHeader } from "@/components/elaris/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/elaris/StatusPill";
import { getHorizontalPlatformData } from "@/lib/db/platform";

export default async function TechnicalPackPage() {
  const data=await getHorizontalPlatformData();
  const d=data.deployment;

  return (
    <>
      <PageHeader
        breadcrumb={<Link href="/platform/placement-workspace/reports" className="hover:underline">Reports</Link>}
        title="Technical Submission Pack"
        actions={
          <>
            <Button variant="outline"><Printer className="size-4" /> Print / PDF</Button>
            <Button variant="outline"><Download className="size-4" /> Export JSON</Button>
            <Button><Share2 className="size-4" /> Share View</Button>
          </>
        }
      />

      <div className="-mt-3 mb-5 flex items-center gap-3"><StatusPill label="DRAFT" tone="amber" /><span className="text-sm text-muted-foreground">RPT-042-A · SUB-0042 · version 2</span></div>

      <Card className="mx-auto max-w-5xl overflow-hidden">
        <div className="border-b border-border bg-slate-950 px-8 py-7 text-white">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Elaris · Placement Workspace</div>
          <div className="mt-2 text-3xl font-semibold">Technical Submission Pack</div>
          <div className="mt-2 text-sm text-slate-300">Humandroid · SUB-0042 · v2 · illustrative broker output</div>
        </div>

        <div className="space-y-8 p-8">
          <ReportSection title="Submission context">
            <Grid>
              <Datum label="Broker" value="Vector Specialty Brokerage · fictional" />
              <Datum label="Market audience" value="Atlas Specialty · fictional" />
              <Datum label="Deployment" value={d.code + " · " + d.name} />
              <Datum label="System" value={d.robot} />
              <Datum label="Site / customer" value={d.site + " · " + d.customer} />
              <Datum label="Task" value={d.task} />
            </Grid>
          </ReportSection>

          <ReportSection title="Versioned technical state">
            <Grid>
              <Datum label="Baseline" value={d.baselineCode} />
              <Datum label="Snapshot" value={d.snapshotCode} />
              <Datum label="Configuration hash" value={d.snapshotHash.slice(0,20) + "…"} mono />
              <Datum label="Operating mode" value={d.operatingMode.replaceAll("_"," ")} />
              <Datum label="Human exposure" value={d.humanExposure.replaceAll("_"," ")} />
              <Datum label="Evidence available" value={String(d.evidenceCount)} />
            </Grid>
          </ReportSection>

          <ReportSection title="Configuration">
            <div className="overflow-hidden rounded-md border border-border">
              <table className="w-full text-sm"><tbody>{d.configurationItems.map((i)=><tr key={i.slot} className="border-b border-border last:border-0"><td className="px-4 py-2.5 text-muted-foreground">{i.slot.replaceAll("_"," ")}</td><td className="px-4 py-2.5 text-right font-medium">{i.value}</td></tr>)}</tbody></table>
            </div>
          </ReportSection>

          <ReportSection title="Evidence index">
            <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr>{["Code","Item","Source","Status"].map(h=><th key={h} className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">{h}</th>)}</tr></thead><tbody>{d.evidence.slice(0,8).map(e=><tr key={e.code} className="border-t border-border"><td className="px-3 py-2.5 font-mono text-xs">{e.code}</td><td className="px-3 py-2.5 font-medium">{e.title}</td><td className="px-3 py-2.5 text-muted-foreground">{e.source}</td><td className="px-3 py-2.5">{e.status.replaceAll("_"," ")}</td></tr>)}</tbody></table></div>
          </ReportSection>

          <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <span className="font-semibold">Demo boundary:</span> This is not a quote, policy document, risk score, pricing recommendation or binding action. Broker review is required before any external use.
          </div>

          <div className="flex items-center justify-between border-t border-border pt-5 text-xs text-muted-foreground">
            <span>Generated from shared Elaris demo data · 01 Oct 2026</span>
            <Link href={"/deployments/"+d.code} className="inline-flex items-center gap-1 text-primary hover:underline">Open technical source <ExternalLink className="size-3.5" /></Link>
          </div>
        </div>
      </Card>
    </>
  );
}
function ReportSection({title,children}:{title:string;children:React.ReactNode}){return <section><div className="mb-3 flex items-center gap-2"><FileText className="size-4 text-muted-foreground" /><h2 className="text-base font-semibold">{title}</h2></div>{children}</section>}
function Grid({children}:{children:React.ReactNode}){return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>}
function Datum({label,value,mono=false}:{label:string;value:string;mono?:boolean}){return <div><div className="text-xs text-muted-foreground">{label}</div><div className={mono?"mt-1 font-mono text-xs font-semibold":"mt-1 text-sm font-medium"}>{value}</div></div>}
