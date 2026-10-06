import Link from "next/link";
import { Activity, FileText, ShieldCheck, TriangleAlert } from "lucide-react";
import { PageHeader } from "@/components/elaris/PageHeader";
import { SectionCard } from "@/components/elaris/SectionCard";
import { StatusPill } from "@/components/elaris/StatusPill";
import { fieldRobot } from "@/lib/demo/component-health-field-data";

const reports = [
  {
    name: "Field Evidence Report",
    subject: "Unitree G1 · 8 human-confirmed phases",
    href: "/platform/component-health/reports/field-evidence",
    description: "Same-session idle comparison, controlled probes and operational fingerprints derived from the real field session.",
    icon: Activity,
    status: "OBSERVED",
    tone: "green" as const,
  },
  {
    name: "Evidence Provenance",
    subject: fieldRobot.sessionState,
    href: "/platform/component-health/reports/field-evidence#provenance",
    description: "Evidence class, capture mode, source disposition and public-demo sanitization boundary.",
    icon: ShieldCheck,
    status: "TRACEABLE",
    tone: "blue" as const,
  },
  {
    name: "Data Quality",
    subject: "28 usable · 1 unresolved slot",
    href: "/platform/component-health/reports/field-evidence#data-quality",
    description: "Explicit unresolved observations are retained instead of being converted into health claims.",
    icon: TriangleAlert,
    status: "1 UNRESOLVED",
    tone: "amber" as const,
  },
] as const;

export default function ReportsPage() {
  return (
    <>
      <PageHeader title="Reports & evidence outputs" />
      <SectionCard title="Real-data-derived outputs" icon={FileText}>
        <div className="grid gap-4 lg:grid-cols-3">
          {reports.map((report) => {
            const Icon = report.icon;
            return (
              <Link key={report.name} href={report.href} className="rounded-xl border border-border p-4 hover:bg-muted/40">
                <div className="flex items-start justify-between gap-3">
                  <Icon className="size-5 text-muted-foreground" />
                  <StatusPill label={report.status} tone={report.tone} />
                </div>
                <div className="mt-4 text-sm font-semibold">{report.name}</div>
                <div className="mt-1 text-xs text-muted-foreground">{report.subject}</div>
                <p className="mt-3 text-sm leading-5 text-muted-foreground">{report.description}</p>
              </Link>
            );
          })}
        </div>
      </SectionCard>

      <div className="mt-6 rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
        Raw telemetry, encryption material, source hashes and sensitive provenance are intentionally not embedded in this public demo layer.
      </div>
    </>
  );
}
