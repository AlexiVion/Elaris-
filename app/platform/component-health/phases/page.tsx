import { Activity, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/elaris/PageHeader";
import { SectionCard } from "@/components/elaris/SectionCard";
import { ComponentHealthPhaseExplorer } from "@/components/platform/ComponentHealthPhaseExplorer";

export default function ComponentHealthPhasesPage() {
  return (
    <>
      <PageHeader title="Phase Explorer" />

      <div className="mb-6 grid gap-4 lg:grid-cols-[1.4fr_.6fr]">
        <SectionCard title="Compare real operational contexts" icon={Activity}>
          <p className="text-sm leading-6 text-muted-foreground">
            Explore how the same Unitree G1 components changed across human-confirmed locomotion phases.
            The visual signature uses torque absP95 relative to the same-session idle reference.
          </p>
        </SectionCard>

        <SectionCard title="Interpretation boundary" icon={ShieldCheck}>
          <p className="text-sm leading-6 text-muted-foreground">
            Larger ratios mean a larger observed difference from idle in this session. They are not health scores,
            anomaly scores or pass/fail thresholds.
          </p>
        </SectionCard>
      </div>

      <ComponentHealthPhaseExplorer />
    </>
  );
}
