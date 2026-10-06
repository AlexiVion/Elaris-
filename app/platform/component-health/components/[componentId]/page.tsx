import Link from "next/link";
import { Activity, FileSearch, ShieldCheck, TriangleAlert } from "lucide-react";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/elaris/PageHeader";
import { SectionCard } from "@/components/elaris/SectionCard";
import { StatusPill } from "@/components/elaris/StatusPill";
import {
  fieldRobot,
  getFieldComponent,
  getProbeEvidence,
  unresolvedObservation,
} from "@/lib/demo/component-health-field-data";

const format = (value: number, digits = 3) => value.toFixed(digits);

export default function FieldComponentDetailPage({ params }: { params: { componentId: string } }) {
  const component = getFieldComponent(params.componentId);
  if (!component) notFound();

  const probe = getProbeEvidence(component.id);
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
        actions={<StatusPill label={unresolved ? "UNRESOLVED" : "OBSERVED USABLE"} tone={unresolved ? "amber" : "green"} />}
      />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
        <div className="space-y-6">
          {probe ? (
            <SectionCard title="Same-session controlled probe evidence" icon={Activity}>
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <StatusPill label={probe.phase.replaceAll("_", " ")} tone="blue" />
                <span className="text-xs text-muted-foreground">Primary reference: IDLE_BASELINE from the same field session</span>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <EvidenceMetric
                  label="Position range"
                  idle={format(probe.positionRange.idle, 6)}
                  observed={format(probe.positionRange.observed, 3)}
                  unit={probe.positionRange.unit}
                  ratio={null}
                />
                <EvidenceMetric
                  label="Velocity absP95"
                  idle={format(probe.velocityAbsP95.idle)}
                  observed={format(probe.velocityAbsP95.observed)}
                  unit={probe.velocityAbsP95.unit}
                  ratio={probe.velocityAbsP95.ratio}
                />
                <EvidenceMetric
                  label="Torque absP95"
                  idle={format(probe.torqueAbsP95.idle)}
                  observed={format(probe.torqueAbsP95.observed)}
                  unit={probe.torqueAbsP95.unit}
                  ratio={probe.torqueAbsP95.ratio}
                />
              </div>

              <div className="mt-5 rounded-lg bg-slate-950 p-4 text-white">
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Evidence interpretation</div>
                <p className="mt-2 text-sm leading-6 text-slate-200">
                  The human-confirmed controlled motion produced a distinct observed telemetry signature for this component.
                  This is descriptive operational evidence, not a diagnosis or health verdict.
                </p>
              </div>
            </SectionCard>
          ) : unresolved ? (
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
          ) : (
            <SectionCard title="Observed component evidence" icon={Activity}>
              <p className="text-sm leading-6 text-muted-foreground">
                This mapped joint slot was observed as usable in the real field capture. The public demo keeps only the
                component inventory and selected controlled-probe aggregates; full per-phase telemetry remains in the private
                evidence pack.
              </p>
              <div className="mt-4 rounded-lg border border-border p-4 text-sm">
                <div className="font-medium">Available in private evidence pack</div>
                <div className="mt-2 text-muted-foreground">
                  Position, velocity, torque estimate, voltage, temperature and state-code observations by phase.
                </div>
              </div>
            </SectionCard>
          )}

          <SectionCard title="Evidence boundary" icon={ShieldCheck}>
            <div className="grid gap-2 text-sm">
              <Boundary text="OBSERVED telemetry is kept distinct from HUMAN_CONFIRMED phase context." />
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
              <Row label="Capture mode" value={fieldRobot.captureMode} />
              <Row label="Evidence class" value={fieldRobot.evidenceClass} />
            </dl>
          </SectionCard>

          <SectionCard title="Related evidence" icon={Activity}>
            <div className="grid gap-3 text-sm">
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
  ratio,
}: {
  label: string;
  idle: string;
  observed: string;
  unit: string;
  ratio: number | null;
}) {
  return (
    <div className="rounded-xl border border-border p-4">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="mt-3 text-sm">
        <span className="text-muted-foreground">Idle</span>
        <div className="mt-1 font-semibold">{idle} {unit}</div>
      </div>
      <div className="mt-3 text-sm">
        <span className="text-muted-foreground">Observed</span>
        <div className="mt-1 font-semibold">{observed} {unit}</div>
      </div>
      {ratio != null && <div className="mt-3 text-xs font-semibold text-primary">×{ratio.toFixed(2)} vs same-session idle</div>}
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
