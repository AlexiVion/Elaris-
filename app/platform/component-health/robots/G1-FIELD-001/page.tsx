import Link from "next/link";
import { Activity, Bot, FileText, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/elaris/PageHeader";
import { SectionCard } from "@/components/elaris/SectionCard";
import { StatusPill } from "@/components/elaris/StatusPill";
import { Card } from "@/components/ui/card";
import {
  fieldComponents,
  fieldPhases,
  fieldRobot,
  unresolvedObservation,
} from "@/lib/demo/component-health-field-data";

export default function G1FieldRobotPage() {
  return (
    <>
      <PageHeader
        title={fieldRobot.code + " · " + fieldRobot.model}
        breadcrumb={<Link href="/platform/component-health/robots" className="hover:underline">Robot evidence</Link>}
        actions={<StatusPill label="OBSERVED" tone="green" />}
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Info label="Acquisition" value={fieldRobot.captureMode} icon={ShieldCheck} />
        <Info label="Observed slots" value={String(fieldRobot.componentSlots)} icon={Bot} />
        <Info label="Operational phases" value={String(fieldRobot.observedPhases)} icon={Activity} />
        <Info label="Disposition" value={fieldRobot.sessionState} icon={FileText} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_.65fr]">
        <SectionCard title="Operational phase timeline" icon={Activity}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["Phase", "Context", "Frames", "Joint numeric events"].map((heading) => (
                    <th key={heading} className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fieldPhases.map((phase) => (
                  <tr key={phase.id} className="border-b border-border last:border-0">
                    <td className="px-3 py-3">
                      <div className="font-medium">{phase.label}</div>
                      <div className="mt-1 font-mono text-[11px] text-muted-foreground">{phase.id}</div>
                    </td>
                    <td className="px-3 py-3"><StatusPill label={phase.kind.replaceAll("_", " ")} tone={phase.kind === "REFERENCE" ? "blue" : "gray"} /></td>
                    <td className="px-3 py-3">{phase.frames.toLocaleString()}</td>
                    <td className="px-3 py-3">{phase.jointEvents.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard title="Evidence context" icon={ShieldCheck}>
            <dl className="space-y-3 text-sm">
              <Row label="Evidence class" value={fieldRobot.evidenceClass} />
              <Row label="Context evidence" value={fieldRobot.contextEvidence} />
              <Row label="Historical baseline" value={fieldRobot.baselineFrames + " frames"} />
              <Row label="Baseline events" value={fieldRobot.baselineEvents.toLocaleString()} />
              <Row label="Usable components" value={String(fieldRobot.usableComponents)} />
              <Row label="Unresolved slots" value={String(fieldRobot.unresolvedComponents)} />
            </dl>
          </SectionCard>

          <SectionCard title="Data quality" icon={FileText}>
            <div className="text-sm font-semibold">[{unresolvedObservation.oemIndex}] {unresolvedObservation.component}</div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{unresolvedObservation.interpretation}</p>
          </SectionCard>

          <div className="grid gap-3">
            <Link href="/platform/component-health/components" className="rounded-lg border border-border p-4 text-sm font-medium hover:bg-muted/40">
              Browse all {fieldComponents.length} component slots →
            </Link>
            <Link href="/platform/component-health/reports/field-evidence" className="rounded-lg border border-border p-4 text-sm font-medium hover:bg-muted/40">
              Open field evidence report →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

function Info({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Activity }) {
  return (
    <Card className="p-4">
      <Icon className="size-4 text-muted-foreground" />
      <div className="mt-3 text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 break-words text-sm font-semibold">{value}</div>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}
