import Link from "next/link";
import { ClipboardCheck } from "lucide-react";
import { PageHeader } from "@/components/elaris/PageHeader";
import { SectionCard } from "@/components/elaris/SectionCard";
import { StatusPill } from "@/components/elaris/StatusPill";
import { returnToService } from "@/lib/demo/component-health";

export default function ReturnToServicePage() {
  return (
    <>
      <PageHeader title="Return to Service" />
      <SectionCard title="Records requiring / demonstrating review" icon={ClipboardCheck} viewAllCount={1}>
        <Link href="/platform/component-health/return-to-service/RTS-0007" className="grid gap-3 rounded-lg border border-border p-4 hover:bg-muted/40 md:grid-cols-[auto_1fr_auto] md:items-center">
          <div className="font-mono text-xs text-muted-foreground">{returnToService.code}</div>
          <div><div className="text-sm font-semibold">{returnToService.robot} · {returnToService.configuration}</div><div className="mt-1 text-xs text-muted-foreground">{returnToService.checks.length} documented checks</div></div>
          <StatusPill label={returnToService.status} tone="blue" />
        </Link>
      </SectionCard>
    </>
  );
}
