import Link from "next/link";
import { CheckCircle2, ClipboardCheck } from "lucide-react";
import { PageHeader } from "@/components/elaris/PageHeader";
import { SectionCard } from "@/components/elaris/SectionCard";
import { StatusPill } from "@/components/elaris/StatusPill";
import { returnToService } from "@/lib/demo/component-health";

export default function ReturnToServiceRecordPage() {
  return (
    <>
      <PageHeader title={returnToService.code + " · Return-to-Service Record"} breadcrumb={<Link href="/platform/component-health/return-to-service" className="hover:underline">Return to Service</Link>} actions={<StatusPill label={returnToService.status} tone="blue" />} />
      <div className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
        <SectionCard title="Documented checks" icon={ClipboardCheck}>
          <div className="space-y-3">{returnToService.checks.map((check) => (
            <div key={check.name} className="flex items-center justify-between gap-3 rounded-lg border border-border p-4"><div className="flex items-center gap-3"><CheckCircle2 className="size-4 text-emerald-600" /><span className="text-sm font-medium">{check.name}</span></div><StatusPill label={check.result} tone="green" /></div>
          ))}</div>
        </SectionCard>
        <SectionCard title="Authority & boundary">
          <dl className="space-y-3 text-sm"><Row label="Robot" value={returnToService.robot} /><Row label="Configuration" value={returnToService.configuration} /><Row label="Reviewer" value={returnToService.authority} /></dl>
          <p className="mt-5 rounded-lg bg-slate-100 p-4 text-xs leading-5 text-slate-700">{returnToService.statement}</p>
        </SectionCard>
      </div>
    </>
  );
}
function Row({ label, value }: { label: string; value: string }) { return <div className="flex items-start justify-between gap-4"><dt className="text-muted-foreground">{label}</dt><dd className="max-w-[62%] text-right font-medium">{value}</dd></div>; }
