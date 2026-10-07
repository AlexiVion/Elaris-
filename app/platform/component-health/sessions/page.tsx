import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { Database, FileCheck2 } from "lucide-react";
import { PageHeader } from "@/components/elaris/PageHeader";
import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/elaris/StatusPill";
import { ComponentHealthWorkbenchEmpty } from "@/components/platform/ComponentHealthWorkbenchEmpty";
import {
  fingerprintPrefix,
  loadComponentHealthWorkbench,
} from "@/lib/component-health/workbench-v04";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function ComponentHealthSessionsPage() {
  noStore();
  const catalogue = await loadComponentHealthWorkbench();
  if (catalogue.analyses.length === 0) {
    return <ComponentHealthWorkbenchEmpty title="Component Health · Sessions" />;
  }

  return (
    <>
      <PageHeader
        title="Sessions & Analysis Runs"
        actions={<StatusPill label="PRIVATE ARTIFACT CATALOGUE" tone="blue" />}
      />

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div className="flex items-start gap-3">
            <Database className="mt-0.5 size-4 text-muted-foreground" />
            <div>
              <div className="text-sm font-semibold">
                {catalogue.analyses.length} unique V0.3 analysis{catalogue.analyses.length === 1 ? "" : "es"}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                Duplicate private copies with the same Analysis ID and report SHA-256 are deduplicated in the Workbench.
              </div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            Source mode: {catalogue.sourceMode.replaceAll("_", " ")}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {["Analysis", "Observed session", "Phases", "Slots", "Copies", "Fingerprint", "Status", "Detail"].map((heading) => (
                  <th key={heading} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {catalogue.analyses.map((artifact) => {
                const report = artifact.report;
                const active = catalogue.activeAnalysisId === artifact.analysisId;
                return (
                  <tr key={artifact.analysisId} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono text-xs">{artifact.analysisId}</td>
                    <td className="px-4 py-3 font-mono text-xs">{report.run.inputs.observed.sessionId}</td>
                    <td className="px-4 py-3">{report.phases.length}</td>
                    <td className="px-4 py-3">{report.robot.componentSlots}</td>
                    <td className="px-4 py-3">{artifact.duplicateCopies}</td>
                    <td className="px-4 py-3 font-mono text-xs">{fingerprintPrefix(report.run.inputFingerprint)}…</td>
                    <td className="px-4 py-3">
                      <StatusPill label={active ? "ACTIVE" : "AVAILABLE"} tone={active ? "green" : "gray"} />
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={"/platform/component-health/sessions/" + encodeURIComponent(artifact.analysisId)}
                        className="font-medium text-primary hover:underline"
                      >
                        Open run →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {catalogue.warnings.length > 0 && (
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <div className="mb-2 flex items-center gap-2 font-semibold">
            <FileCheck2 className="size-4" />
            Catalogue notes
          </div>
          {catalogue.warnings.map((warning) => <div key={warning}>{warning}</div>)}
        </div>
      )}
    </>
  );
}
