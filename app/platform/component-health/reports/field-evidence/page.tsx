import Link from "next/link";
import { Activity, FileText, ShieldCheck, TriangleAlert } from "lucide-react";
import { PageHeader } from "@/components/elaris/PageHeader";
import { SectionCard } from "@/components/elaris/SectionCard";
import { StatusPill } from "@/components/elaris/StatusPill";
import {
  controlledProbeEvidence,
  fieldPhases,
  fieldRobot,
  operationalFingerprints,
  unresolvedObservation,
} from "@/lib/demo/component-health-field-data";

const format = (value: number, digits = 3) => value.toFixed(digits);

export default function FieldEvidenceReportPage() {
  return (
    <>
      <PageHeader
        title="Field Evidence Report"
        breadcrumb={<Link href="/platform/component-health/reports" className="hover:underline">Reports</Link>}
        actions={<StatusPill label="DESCRIPTIVE COMPARISON" tone="blue" />}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Summary label="Evidence class" value={fieldRobot.evidenceClass} />
        <Summary label="Context evidence" value={fieldRobot.contextEvidence} />
        <Summary label="Session disposition" value={fieldRobot.sessionState} />
      </div>

      <div className="mt-6">
        <SectionCard title="Phase overview" icon={Activity}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["Phase", "Type", "Frames", "Joint numeric events"].map((heading) => (
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
                    <td className="px-3 py-3">{phase.kind.replaceAll("_", " ")}</td>
                    <td className="px-3 py-3">{phase.frames.toLocaleString()}</td>
                    <td className="px-3 py-3">{phase.jointEvents.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>

      <div className="mt-6">
        <SectionCard title="Controlled probe evidence" icon={FileText}>
          <div className="grid gap-4 lg:grid-cols-3">
            {controlledProbeEvidence.map((probe) => (
              <Link
                key={probe.componentId}
                href={`/platform/component-health/components/${probe.componentId}`}
                className="rounded-xl border border-border p-4 hover:bg-muted/40"
              >
                <div className="text-sm font-semibold">[{String(probe.oemIndex).padStart(2, "0")}] {probe.component}</div>
                <div className="mt-1 text-xs text-muted-foreground">{probe.phase}</div>
                <dl className="mt-4 space-y-2 text-sm">
                  <Pair label="Position range" value={`${format(probe.positionRange.idle, 6)} → ${format(probe.positionRange.observed)} rad`} />
                  <Pair label="Velocity absP95" value={`×${probe.velocityAbsP95.ratio.toFixed(2)}`} />
                  <Pair label="Torque absP95" value={`×${probe.torqueAbsP95.ratio.toFixed(2)}`} />
                </dl>
              </Link>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Fingerprint title="Forward / backward locomotion" rows={operationalFingerprints.LOCOMOTION_FORWARD_BACK} />
        <Fingerprint title="Turning" rows={operationalFingerprints.TURNING} />
        <Fingerprint title="Mixed operation" rows={operationalFingerprints.MIXED_OPERATION} />
      </div>

      <div id="data-quality" className="mt-6 grid gap-6 xl:grid-cols-[.8fr_1.2fr]">
        <SectionCard title="Data quality" icon={TriangleAlert}>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <div className="text-sm font-semibold text-amber-950">[{unresolvedObservation.oemIndex}] {unresolvedObservation.component}</div>
            <p className="mt-2 text-sm leading-6 text-amber-900">{unresolvedObservation.observation}</p>
            <p className="mt-3 text-xs leading-5 text-amber-800">{unresolvedObservation.interpretation}</p>
          </div>
        </SectionCard>

        <SectionCard title="Assessment boundary" icon={ShieldCheck}>
          <div className="grid gap-2 text-sm">
            <Boundary text="Same-session IDLE_BASELINE is the primary operational reference in this demo." />
            <Boundary text="The historical baseline remains context only because its operating context is not sufficiently confirmed." />
            <Boundary text="No diagnosis, health score, failure probability, remaining useful life or safety-certification claim is produced." />
            <Boundary text="Relative changes are descriptive and are not pass/fail thresholds." />
          </div>
        </SectionCard>
      </div>

      <div id="provenance" className="mt-6">
        <SectionCard title="Provenance & public-demo boundary" icon={ShieldCheck}>
          <div className="grid gap-4 md:grid-cols-2 text-sm">
            <Pair label="Robot" value={fieldRobot.model} />
            <Pair label="Capture mode" value={fieldRobot.captureMode} />
            <Pair label="Evidence class" value={fieldRobot.evidenceClass} />
            <Pair label="Context evidence" value={fieldRobot.contextEvidence} />
            <Pair label="Technical validation" value={fieldRobot.technicalValidation} />
            <Pair label="Source disposition" value={fieldRobot.sessionState} />
          </div>
          <p className="mt-5 text-xs leading-5 text-muted-foreground">
            This UI embeds only sanitized aggregate values needed to demonstrate the Component Health workflow. Raw telemetry,
            encryption material, source hashes, exact source identifiers and sensitive provenance remain outside the public demo.
          </p>
        </SectionCard>
      </div>
    </>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-2 text-sm font-semibold">{value}</div>
    </div>
  );
}

function Pair({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}

function Boundary({ text }: { text: string }) {
  return (
    <div className="flex gap-3 rounded-md bg-muted/40 px-3 py-2">
      <span className="mt-1 size-1.5 shrink-0 rounded-full bg-slate-400" />
      <span>{text}</span>
    </div>
  );
}

function Fingerprint({
  title,
  rows,
}: {
  title: string;
  rows: readonly { component: string; oemIndex: number; idleTorque: number; observedTorque: number; ratio: number }[];
}) {
  return (
    <SectionCard title={title} icon={Activity}>
      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.oemIndex} className="rounded-lg border border-border p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-medium">[{String(row.oemIndex).padStart(2, "0")}] {row.component}</div>
              <div className="text-sm font-semibold">×{row.ratio.toFixed(2)}</div>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Torque absP95 {row.idleTorque.toFixed(3)} → {row.observedTorque.toFixed(3)} N·m
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
