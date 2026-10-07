import Link from "next/link";
import { Activity, FileText, ShieldCheck, TriangleAlert } from "lucide-react";
import { PageHeader } from "@/components/elaris/PageHeader";
import { SectionCard } from "@/components/elaris/SectionCard";
import { StatusPill } from "@/components/elaris/StatusPill";
import {
  controlledProbeEvidence,
  fieldPhases,
  fieldRobot,
  humanizeSessionDisposition,
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
        <Summary label="Evidence" value="Observed telemetry" />
        <Summary label="Context" value="Human-confirmed phases" />
        <Summary label="Session" value={humanizeSessionDisposition(fieldRobot.sessionState)} />
      </div>

      <div className="mt-6">
        <SectionCard
          title="Phase overview"
          icon={Activity}
          action={
            <Link href="/platform/component-health/phases" className="text-sm font-medium text-primary hover:underline">
              Open Phase Explorer →
            </Link>
          }
        >
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
                    <td className="px-3 py-3">
                      {phase.kind === "CONTROLLED_PROBE"
                        ? "Controlled probe"
                        : phase.kind.charAt(0) + phase.kind.slice(1).toLowerCase()}
                    </td>
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
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-semibold">[{String(probe.oemIndex).padStart(2, "0")}] {probe.component}</div>
                    <div className="mt-1 text-xs text-muted-foreground">Human-confirmed controlled motion</div>
                  </div>
                  <StatusPill label="OBSERVED" tone="green" />
                </div>

                <div className="mt-4 space-y-4">
                  <ProbeBar
                    label="Velocity absP95"
                    idle={probe.velocityAbsP95.idle}
                    observed={probe.velocityAbsP95.observed}
                    unit={probe.velocityAbsP95.unit}
                    ratio={probe.velocityAbsP95.ratio}
                  />
                  <ProbeBar
                    label="Torque absP95"
                    idle={probe.torqueAbsP95.idle}
                    observed={probe.torqueAbsP95.observed}
                    unit={probe.torqueAbsP95.unit}
                    ratio={probe.torqueAbsP95.ratio}
                  />
                </div>

                <div className="mt-4 text-xs text-muted-foreground">
                  Position range: {format(probe.positionRange.idle, 6)} → {format(probe.positionRange.observed)} rad
                </div>
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
            <Boundary text="Same-session idle is the primary operational reference in this demo." />
            <Boundary text="The historical baseline remains secondary context because its operating context is not sufficiently confirmed." />
            <Boundary text="No diagnosis, health score, failure probability, remaining useful life or safety-certification claim is produced." />
            <Boundary text="Relative changes are descriptive and are not pass/fail thresholds." />
          </div>
        </SectionCard>
      </div>

      <div id="provenance" className="mt-6">
        <SectionCard title="Provenance & public-demo boundary" icon={ShieldCheck}>
          <div className="grid gap-4 md:grid-cols-2 text-sm">
            <Pair label="Robot" value={fieldRobot.model} />
            <Pair label="Acquisition" value="Read-only" />
            <Pair label="Evidence" value="Observed telemetry" />
            <Pair label="Context" value="Human-confirmed phases" />
            <Pair label="Technical validation" value="Passed" />
            <Pair label="Session" value={humanizeSessionDisposition(fieldRobot.sessionState)} />
          </div>

          <details className="mt-5 rounded-lg border border-border p-3">
            <summary className="cursor-pointer text-xs font-medium text-muted-foreground">Technical metadata</summary>
            <div className="mt-3 grid gap-3 font-mono text-[11px] md:grid-cols-2">
              <Pair label="capture_mode" value={fieldRobot.captureMode} />
              <Pair label="evidence_class" value={fieldRobot.evidenceClass} />
              <Pair label="context_evidence" value={fieldRobot.contextEvidence} />
              <Pair label="source_disposition" value={fieldRobot.sessionState} />
            </div>
          </details>

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

function ProbeBar({
  label,
  idle,
  observed,
  unit,
  ratio,
}: {
  label: string;
  idle: number;
  observed: number;
  unit: string;
  ratio: number;
}) {
  const max = Math.max(idle, observed);
  const idleWidth = max === 0 ? 0 : Math.max(4, (idle / max) * 100);
  const observedWidth = max === 0 ? 0 : Math.max(4, (observed / max) * 100);

  return (
    <div>
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="font-medium">{label}</span>
        <span className="font-semibold">×{ratio.toFixed(2)}</span>
      </div>
      <div className="mt-2 space-y-2">
        <BarLine label="Idle" value={`${idle.toFixed(3)} ${unit}`} width={idleWidth} strong={false} />
        <BarLine label="Observed" value={`${observed.toFixed(3)} ${unit}`} width={observedWidth} strong />
      </div>
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
  const maxRatio = Math.max(...rows.map((row) => row.ratio));

  return (
    <SectionCard title={title} icon={Activity}>
      <div className="space-y-4">
        {rows.map((row) => (
          <div key={row.oemIndex}>
            <div className="flex items-center justify-between gap-3 text-sm">
              <div className="font-medium">[{String(row.oemIndex).padStart(2, "0")}] {row.component}</div>
              <div className="font-semibold">×{row.ratio.toFixed(2)}</div>
            </div>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-slate-900"
                style={{ width: `${Math.max(6, (row.ratio / maxRatio) * 100)}%` }}
              />
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              Torque absP95 {row.idleTorque.toFixed(3)} → {row.observedTorque.toFixed(3)} N·m
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

function BarLine({
  label,
  value,
  width,
  strong,
}: {
  label: string;
  value: string;
  width: number;
  strong: boolean;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-2 text-[11px]">
        <span className="text-muted-foreground">{label}</span>
        <span>{value}</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className={strong ? "h-full rounded-full bg-slate-900" : "h-full rounded-full bg-slate-400"}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}
