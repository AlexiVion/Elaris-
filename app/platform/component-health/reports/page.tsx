import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { Activity, FileText, ShieldCheck, TriangleAlert } from "lucide-react";
import { PageHeader } from "@/components/elaris/PageHeader";
import { SectionCard } from "@/components/elaris/SectionCard";
import { StatusPill } from "@/components/elaris/StatusPill";
import { ComponentHealthWorkbenchEmpty } from "@/components/platform/ComponentHealthWorkbenchEmpty";
import {
  loadActiveComponentHealthAnalysis,
  summarizeQualityFindings,
} from "@/lib/component-health/workbench-v04";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function ReportsPage() {
  noStore();
  const { artifact } = await loadActiveComponentHealthAnalysis();
  if (!artifact) {
    return <ComponentHealthWorkbenchEmpty title="Component Health · Reports" />;
  }

  const report = artifact.report;
  const groups = summarizeQualityFindings(report.quality.findings);
  const warnings = report.quality.findings.filter((finding) => finding.severity === "WARNING").length;

  const cards = [
    {
      name: "Internal Draft Report",
      subject: report.run.analysisId,
      href: "/platform/component-health/reports/draft",
      description:
        "Human-readable evidence summary generated from the active V0.3 artifact. Internal review only; no client export authorization.",
      icon: FileText,
      status: "DRAFT",
      tone: "amber" as const,
    },
    {
      name: "Phase Explorer",
      subject: report.phases.length + " human-confirmed phases",
      href: "/platform/component-health/phases",
      description:
        "Complete 29-slot phase matrix with same-session idle comparisons from the private Evidence Engine artifact.",
      icon: Activity,
      status: "LIVE ARTIFACT",
      tone: "blue" as const,
    },
    {
      name: "Evidence Provenance",
      subject: report.run.inputs.observed.workingCopyKind.replaceAll("_", " "),
      href: "/platform/component-health/sessions/" + encodeURIComponent(report.run.analysisId),
      description:
        "Observed and historical-baseline provenance, source/working-copy integrity methods and evidence boundary.",
      icon: ShieldCheck,
      status: "TRACEABLE",
      tone: "blue" as const,
    },
    {
      name: "Quality Review",
      subject: warnings + " warnings · " + groups.length + " grouped categories",
      href: "/platform/component-health/quality",
      description:
        "QA records are grouped for analyst review instead of being presented as robot failures or health alerts.",
      icon: TriangleAlert,
      status: warnings ? warnings + " WARNINGS" : "NO WARNINGS",
      tone: warnings ? "amber" as const : "green" as const,
    },
  ];

  return (
    <>
      <PageHeader title="Reports & evidence outputs" />
      <SectionCard title="Workbench outputs" icon={FileText}>
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.name}
                href={card.href}
                className="rounded-xl border border-border p-4 hover:bg-muted/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <Icon className="size-5 text-muted-foreground" />
                  <StatusPill label={card.status} tone={card.tone} />
                </div>
                <div className="mt-4 text-sm font-semibold">{card.name}</div>
                <div className="mt-1 text-xs text-muted-foreground">{card.subject}</div>
                <p className="mt-3 text-sm leading-5 text-muted-foreground">{card.description}</p>
              </Link>
            );
          })}
        </div>
      </SectionCard>

      <div className="mt-6 rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
        V0.4 renders private server-side evidence for internal review. It does not publish raw telemetry, registry hashes,
        keys, verified-file lists or an externally approved report.
      </div>
    </>
  );
}
