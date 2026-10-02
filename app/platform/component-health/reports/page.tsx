import Link from "next/link";
import { FileText } from "lucide-react";
import { PageHeader } from "@/components/elaris/PageHeader";
import { SectionCard } from "@/components/elaris/SectionCard";

const reports = [
  { name: "Component Health Case", subject: "CH-0028 · HMND-0002", href: "/platform/component-health/components/CMP-KNEE-L-002", description: "Signals, evidence, context and human review trail." },
  { name: "Service & Configuration Change", subject: "SV-0014 · CFG-05 → CFG-06", href: "/platform/component-health/service/SV-0014", description: "Synthetic inspection/replacement scenario and review impact." },
  { name: "Return-to-Service Record", subject: "RTS-0007 · HMND-0002", href: "/platform/component-health/return-to-service/RTS-0007", description: "Documented checks and named human authority boundary." },
] as const;

export default function ReportsPage() {
  return (
    <>
      <PageHeader title="Reports & Outputs" />
      <SectionCard title="Demo outputs" icon={FileText}>
        <div className="grid gap-4 lg:grid-cols-3">{reports.map((report) => (
          <Link key={report.name} href={report.href} className="rounded-xl border border-border p-4 hover:bg-muted/40"><FileText className="size-5 text-muted-foreground" /><div className="mt-4 text-sm font-semibold">{report.name}</div><div className="mt-1 text-xs text-muted-foreground">{report.subject}</div><p className="mt-3 text-sm leading-5 text-muted-foreground">{report.description}</p></Link>
        ))}</div>
      </SectionCard>
    </>
  );
}
