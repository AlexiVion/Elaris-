import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { Boxes } from "lucide-react";
import { PageHeader } from "@/components/elaris/PageHeader";
import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/elaris/StatusPill";
import { ComponentHealthWorkbenchEmpty } from "@/components/platform/ComponentHealthWorkbenchEmpty";
import {
  componentGroup,
  componentSlug,
  loadActiveComponentHealthAnalysis,
} from "@/lib/component-health/workbench-v04";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function FieldComponentsPage() {
  noStore();
  const { artifact } = await loadActiveComponentHealthAnalysis();
  if (!artifact) {
    return <ComponentHealthWorkbenchEmpty title="Component Health · Components" />;
  }

  const report = artifact.report;
  const reference =
    report.phases.find((phase) => phase.phaseId === report.reference.phaseId) ??
    report.phases[0];

  const rows = (reference?.components ?? []).map((component) => {
    const phaseVersions = report.phases.flatMap((phase) => {
      const match = phase.components.find(
        (candidate) => candidate.oemIndex === component.oemIndex
      );
      return match ? [match] : [];
    });
    const unresolved = phaseVersions.some(
      (item) => item.slotStatus === "OBSERVED_UNRESOLVED_SLOT"
    );
    const missingPhases = phaseVersions.filter(
      (item) => item.availability === "MISSING"
    ).length;

    return {
      ...component,
      slug: componentSlug(component),
      group: componentGroup(component.componentName),
      unresolved,
      missingPhases,
      observedPhases: report.phases.length - missingPhases,
    };
  });

  return (
    <>
      <PageHeader
        title="Observed components"
        actions={<StatusPill label="V0.4 · REAL ARTIFACT" tone="blue" />}
      />

      <Card className="overflow-hidden">
        <div className="border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <Boxes className="size-4 text-muted-foreground" />
            <div>
              <div className="text-sm font-semibold">
                {rows.length} Unitree G1 component slots from active V0.3 evidence
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                Status reflects evidence availability / mapping quality. It is not a health verdict.
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {[
                  "OEM index",
                  "Component",
                  "Group",
                  "Observed phases",
                  "Evidence status",
                  "Detail",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="px-4 py-3 text-left text-xs font-medium text-muted-foreground"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((component) => (
                <tr
                  key={component.oemIndex}
                  className="border-b border-border last:border-0 hover:bg-muted/30"
                >
                  <td className="px-4 py-3 font-mono text-xs">
                    {String(component.oemIndex).padStart(2, "0")}
                  </td>
                  <td className="px-4 py-3 font-medium">{component.componentName}</td>
                  <td className="px-4 py-3 text-muted-foreground">{component.group}</td>
                  <td className="px-4 py-3">
                    {component.observedPhases} / {report.phases.length}
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill
                      label={
                        component.unresolved
                          ? "UNRESOLVED"
                          : component.missingPhases > 0
                            ? "PARTIAL"
                            : "TELEMETRY AVAILABLE"
                      }
                      tone={
                        component.unresolved
                          ? "amber"
                          : component.missingPhases > 0
                            ? "gray"
                            : "green"
                      }
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={"/platform/component-health/components/" + component.slug}
                      className="font-medium text-primary hover:underline"
                    >
                      Open evidence →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
