import Link from "next/link";
import { Activity } from "lucide-react";
import { PageHeader } from "@/components/elaris/PageHeader";
import { SectionCard } from "@/components/elaris/SectionCard";
import { StatusPill } from "@/components/elaris/StatusPill";
import { healthCase } from "@/lib/demo/component-health";

export default function AttentionPage() {
  return (
    <>
      <PageHeader title="Attention" />
      <SectionCard title="Open health cases" icon={Activity} viewAllCount={1}>
        <Link href="/platform/component-health/components/CMP-KNEE-L-002" className="grid gap-3 rounded-lg border border-border p-4 hover:bg-muted/40 md:grid-cols-[auto_1fr_auto] md:items-center">
          <div className="font-mono text-xs text-muted-foreground">{healthCase.code}</div>
          <div><div className="text-sm font-semibold">{healthCase.robot} · {healthCase.componentName}</div><div className="mt-1 text-sm text-muted-foreground">{healthCase.summary}</div></div>
          <StatusPill label={healthCase.status} tone="amber" />
        </Link>
      </SectionCard>
    </>
  );
}
