import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { PageHeader } from "@/components/elaris/PageHeader";
import { SectionCard } from "@/components/elaris/SectionCard";
import { StatusPill } from "@/components/elaris/StatusPill";
import { placementReports } from "@/lib/demo/placement";

export default function PlacementReportsPage() {
  return (
    <>
      <PageHeader title="Reports" />
      <p className="mb-6 max-w-2xl text-sm text-muted-foreground">
        Broker-facing technical outputs assembled from selected Elaris facts and evidence. Demo only; no quote, policy or placement authority.
      </p>
      <SectionCard title="Placement outputs" icon={FileText}>
        <ul className="divide-y divide-border">
          {placementReports.map((r) => (
            <li key={r.code}>
              <Link href={r.code === "RPT-042-A" ? "/platform/placement-workspace/reports/technical-pack/SUB-0042" : "/platform/placement-workspace/reports"} className="flex items-center gap-3 py-3 hover:opacity-80">
                <FileText className="size-4 text-muted-foreground" />
                <div className="min-w-0 flex-1"><div className="font-medium">{r.name}</div><div className="text-xs text-muted-foreground">{r.code} · {r.subject} · {r.audience}</div></div>
                <StatusPill label={r.status} tone={r.status === "CURRENT" ? "green" : "amber"} />
                <ArrowRight className="size-4 text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>
      </SectionCard>
    </>
  );
}
