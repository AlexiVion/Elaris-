import Link from "next/link";
import { Activity, FileSearch, ShieldCheck, TriangleAlert } from "lucide-react";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/elaris/PageHeader";
import { SectionCard } from "@/components/elaris/SectionCard";
import { StatusPill } from "@/components/elaris/StatusPill";
import {
  fieldRobot,
  getFieldComponent,
  getOperationalEvidence,
  getProbeEvidence,
  unresolvedObservation,
} from "@/lib/demo/component-health-field-data";

const format = (value: number, digits = 3) => value.toFixed(digits);

export default function FieldComponentDetailPage({ params }: { params: { componentId: string } }) {
  const component = getFieldComponent(params.componentId);
  if (!component) notFound();

  const probe = getProbeEvidence(component.id);
  const operationalEvidence = getOperationalEvidence(component.oemIndex);
  const unresolved = component.status === "OBSERVED_UNRESOLVED_SLOT";

  return (
    <>
      <PageHeader
        title={`[${String(component.oemIndex).padStart(2, "0")}] ${component.name}`}
        breadcrumb={
          <>
            <Link href="/platform/component-health/components" className="hover:underline">Components</Link>
            {" / "}
            {component.id}
          </>
        }
        actions={<StatusPill label={unresolved ? "UNRESOLVED" : "TELEMETRY AVAILABLE"} tone={unresolved ? "amber" : "green"} />}
      />

      <div className="grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
        <div className="space-y-6">
          {probe && (
            <SectionCard title="Controlled probe · idle vs observed" icon={Activity}>
              <div className="mb-5 flex flex-wrap items-center gap-2">
                <StatusPill label="CONTROLLED PROBE" tone="blue" />
                <span className="text-xs text-muted-foreground">
                  Human-confirmed phase: {probe.phase.replaceAll("_", " ").toLowerCase()}
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <EvidenceMetric
                  label="Position range"
                  idle={probe.positionRange.idle}
                  observed={probe.positionRange.observed}
                  unit={probe.positionRange.unit}
                  digits={3}
                  ratio={null}
                />
                <EvidenceMetric
                  label="Velocity absP95"
                  idle={probe.velocityAbsP95.idle}
                  observed={probe.velocityAbsP95.observed}
                  unit={probe.velocityAbsP95.unit}
                  digits={3}
                  ratio={probe.velocityAbsP95.ratio}
                />
                <EvidenceMetric
                  label="Torque absP95"
                  idle={probe.torqueAbsP95.idle}
                  observed={probe.torqueAbsP95.observed}
                  unit={probe.torqueAbsP95.unit}
                  digits={3}
                  ratio={probe.torqueAbsP95.ratio}
                />
              </div>

              <div className="mt-5 rounded-lg bg-slate-950 p-4 text-white">
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">What this supports</div>
                <p className="mt-2 text-sm leading-6 text-slate-200">
                  The controlled motion produced a distinct observed telemetry signature for this component compared with
                  same-session idle. This is operational evidence, not a health verdict.
                </p>
              </div>
            </SectionCard>
          )}

          {operationalEvidence.length > 0 && (
            <SectionCard title="Operational signature across phases" icon={Activity}>
              <p className="mb-5 text-sm leading-6 text-muted-foreground">
                Sanitized torque aggregates already present in the real evidence pack for this component. Ratios use
                same-session idle as the reference.
              </p>
              <div className="space-y-4">
                {operationalEvidence.map((evidence) => {
                  const max = Math.max(evidence.idleTorque, evidence.observedTorque);
                  const idleWidth = max === 0 ? 0 : Math.max(4, (evidence.idleTorque / max) * 100);
                  const observedWidth = max === 0 ? 0 : Math.max(4, (evidence.observedTorque / max) * 100);

                  return (
                    <div key={evidence.phaseId} className="rounded-xl border border-border p-4">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <div className="text-sm font-semibold">{evidence.phaseLabel}</div>
                          <div className="mt-1 text-xs text-muted-foreground">{evidence.phaseContext}</div>
                        </div>
                        <div className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                          ×{evidence.ratio.toFixed(2)}
                        </div>
                      </div>

                      <div className="mt-4 space-y-3">
                        <SignalBar
                          label="Idle"
                          value={`${evidence.idleTorque.toFixed(3)} N·m`}
                          width={idleWidth}
                          strong={false}
                        />
                        <SignalBar
                          label="Observed"
                          value={`${evidence.observedTorque.toFixed(3)} N·m`}
                          width={observedWidth}
                          strong
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </SectionCard>
          )}

          {unresolved ? (
            <SectionCard title="Unresolved observation" icon={TriangleAlert}>
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm leading-6 text-amber-950">{unresolvedObservation.observation}</p>
                <dl className="mt-4 space-y-2 text-sm">
                  <Row label="Observed OEM state code" value={String(unresolvedObservation.stateCode)} />
                  <Row label="Physical signals" value="Constant zero in captured session" />
                  <Row label="Elaris interpretation" value="Configuration / slot unresolved" />
                </dl>
              </div>
              <p className="mt-4 text-xs leading-5 text-muted-foreground">
                Elaris deliberately does not convert a constant-zero slot into a healthy or active-component claim.
              </p>
            </SectionCard>
          ) : !probe && operationalEvidence.length === 0 ? (
            <SectionCard title="Observed component evidence" icon={Activity}>
              <p className="text-sm leading-6 text-muted-foreground">
                This mapped joint slot was observed as usable in the real field capture. No selected sanitized aggregate for
                this component is embedded in the public demo yet; the private evidence pack retains the per-phase telemetry.
              </p>
              <div className="mt-4 rounded-lg border border-border p-4 text-sm">
                <div className="font-medium">Private evidence scope</div>
                <div className="mt-2 text-muted-foreground">
                  Position, velocity, torque estimate, voltage, temperature and state-code observations by phase.
                </div>
              </div>
            </SectionCard>
          ) : null}

          <SectionCard title="Evidence boundary" icon={ShieldCheck}>
            <div className="grid gap-2 text-sm">
              <Boundary text="Observed telemetry is kept distinct from human-confirmed phase context." />
              <Boundary text="No failure probability, health score, diagnosis or remaining useful life is produced." />
              <Boundary text="Relative differences are descriptive until a separately validated rule exists." />
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard title="Component identity" icon={FileSearch}>
            <dl className="space-y-3 text-sm">
              <Row label="Robot" value={fieldRobot.code} />
              <Row label="Model" value={fieldRobot.model} />
              <Row label="OEM index" value={String(component.oemIndex)} />
              <Row label="Component ID" value={component.id} />
              <Row label="Group" value={component.group} />
              <Row label="Acquisition" value="Read-only" />
              <Row label="Evidence" value="Observed telemetry" />
            </dl>

            <details className="mt-5 rounded-lg border border-border p-3">
              <summary className="cursor-pointer text-xs font-medium text-muted-foreground">Technical identifiers</summary>
              <dl className="mt-3 space-y-2 font-mono text-[11px]">
                <Row label="capture_mode" value={fieldRobot.captureMode} />
                <Row label="evidence_class" value={fieldRobot.evidenceClass} />
                <Row label="component_status" value={component.status} />
              </dl>
            </details>
          </SectionCard>

          <SectionCard title="Related evidence" icon={Activity}>
            <div className="grid gap-3 text-sm">
              <Link href="/platform/component-health/phases" className="rounded-lg border border-border p-3 font-medium hover:bg-muted/40">
                Explore operational phases →
              </Link>
              <Link href="/platform/component-health/robots/G1-FIELD-001" className="rounded-lg border border-border p-3 font-medium hover:bg-muted/40">
                Open robot session →
              </Link>
              <Link href="/platform/component-health/reports/field-evidence" className="rounded-lg border border-border p-3 font-medium hover:bg-muted/40">
                Open field evidence report →
              </Link>
            </div>
          </SectionCard>
        </div>
      </div>
    </>
  );
}

function EvidenceMetric({
  label,
  idle,
  observed,
  unit,
  digits,
  ratio,
}: {
  label: string;
  idle: number;
  observed: number;
  unit: string;
  digits: number;
  ratio: number | null;
}) {
  const max = Math.max(idle, observed);
  const idleWidth = max === 0 ? 0 : Math.max(4, (idle / max) * 100);
  const observedWidth = max === 0 ? 0 : Math.max(4, (observed / max) * 100);

  return (
    <div className="rounded-xl border border-border p-4">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="mt-4 space-y-3">
        <SignalBar label="Idle" value={`${format(idle, digits)} ${unit}`} width={idleWidth} strong={false} />
        <SignalBar label="Observed" value={`${format(observed, digits)} ${unit}`} width={observedWidth} strong />
      </div>
      {ratio != null && <div className="mt-4 text-xs font-semibold text-primary">×{ratio.toFixed(2)} vs same-session idle</div>}
    </div>
  );
}

function SignalBar({
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
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}</span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className={strong ? "h-full rounded-full bg-slate-900" : "h-full rounded-full bg-slate-400"}
          style={{ width: `${width}%` }}
        />
      </div>
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="max-w-[62%] break-words text-right font-medium">{value}</dd>
    </div>
  );
}
