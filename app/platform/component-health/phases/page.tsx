import { unstable_noStore as noStore } from "next/cache";
import { Activity } from "lucide-react";
import { PageHeader } from "@/components/elaris/PageHeader";
import { SectionCard } from "@/components/elaris/SectionCard";
import { ComponentHealthWorkbenchEmpty } from "@/components/platform/ComponentHealthWorkbenchEmpty";
import {
  ComponentHealthWorkbenchPhaseExplorer,
  type WorkbenchPhaseExplorerPhase,
} from "@/components/platform/ComponentHealthWorkbenchPhaseExplorer";
import {
  componentSlug,
  loadActiveComponentHealthAnalysis,
} from "@/lib/component-health/workbench-v04";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function ComponentHealthPhasesPage() {
  noStore();
  const { artifact } = await loadActiveComponentHealthAnalysis();
  if (!artifact) {
    return <ComponentHealthWorkbenchEmpty title="Component Health · Phases" />;
  }

  const report = artifact.report;

  const phases: WorkbenchPhaseExplorerPhase[] = report.phases.map((phase) => ({
    id: phase.phaseId,
    label: phase.label,
    frameCount: phase.frameCount,
    observedStart: phase.observedTelemetryStart,
    observedEnd: phase.observedTelemetryEnd,
    rows: phase.components.map((component) => {
      const torque = component.comparisonsToIdle["joint.torque_estimate"];
      const torqueSummary = component.signals["joint.torque_estimate"].summary;

      return {
        slug: componentSlug(component),
        oemIndex: component.oemIndex,
        componentName: component.componentName,
        slotStatus: component.slotStatus,
        torqueIdleAbsP95: torque?.baselineAbsP95 ?? null,
        torqueObservedAbsP95: torque?.observedAbsP95 ?? torqueSummary?.absP95 ?? null,
        torqueRatio: torque?.absP95Ratio ?? null,
        torqueCoverage: torqueSummary?.coverage ?? null,
      };
    }),
  }));

  return (
    <>
      <PageHeader title="Phase Explorer" />

      <div className="mb-6">
        <SectionCard title="Operational comparison contract" icon={Activity}>
          <p className="text-sm leading-6 text-muted-foreground">
            V0.4 renders the complete V0.3 component/phase matrix from the private evidence artifact.
            Torque ratios use the human-confirmed same-session IDLE_BASELINE as the primary reference.
            A larger ratio means a larger observed signal relative to idle, not damage, failure probability or a health score.
          </p>
        </SectionCard>
      </div>

      <ComponentHealthWorkbenchPhaseExplorer
        phases={phases}
        referencePhaseId={report.reference.phaseId}
      />
    </>
  );
}
