import Link from "next/link";
import { Activity, Bot, ClipboardCheck, FileText, TriangleAlert } from "lucide-react";
import { PageHeader } from "@/components/elaris/PageHeader";
import { KpiCard } from "@/components/elaris/KpiCard";
import { SectionCard } from "@/components/elaris/SectionCard";
import { StatusPill } from "@/components/elaris/StatusPill";
import {
  controlledProbeEvidence,
  evidenceBoundary,
  fieldPhases,
  fieldRobot,
  humanizeSessionDisposition,
  operationalFingerprints,
  unresolvedObservation,
} from "@/lib/demo/component-health-field-data";

const format = (value: number, digits = 2) => value.toFixed(digits);

export default function ComponentHealthHome() {
  const turningMax = Math.max(...operationalFingerprints.TURNING.map((row) => row.ratio));

  return (
    <>
      <PageHeader
        title="Component Health · Field Evidence"
        actions={<StatusPill label="REAL FIELD DATA · V0.2" tone="blue" />}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Real robots represented" value={1} icon={Bot} tone="blue" delta={null} />
        <KpiCard label="Joint slots observed" value={fieldRobot.componentSlots} icon={Activity} tone="slate" delta={null} />
        <KpiCard label="Operational phases" value={fieldRobot.observedPhases} icon={ClipboardCheck} tone="green" delta={null} />
        <KpiCard label="Unresolved slots" value={fieldRobot.unresolvedComponents} icon={TriangleAlert} tone="red" delta={null} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
        <SectionCard title="Validated field session" icon={FileText}>
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <Fact label="Robot" value={fieldRobot.model} />
            <Fact label="Acquisition" value="Read-only" />
            <Fact label="Evidence" value="Observed telemetry" />
            <Fact label="Context" value="Human-confirmed phases" />
            <Fact label="Session" value={humanizeSessionDisposition(fieldRobot.sessionState)} />
            <Fact label="Technical validation" value="Passed" />
            <Fact label="Historical baseline" value={`${fieldRobot.baselineFrames} frames · ${fieldRobot.baselineEvents.toLocaleString()} events`} />
            <Fact label="Usable / unresolved" value={`${fieldRobot.usableComponents} / ${fieldRobot.unresolvedComponents}`} />
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/platform/component-health/robots/G1-FIELD-001" className="text-sm font-medium text-primary hover:underline">
              Open robot evidence →
            </Link>
            <Link href="/platform/component-health/phases" className="text-sm font-medium text-primary hover:underline">
              Explore phases →
            </Link>
            <Link href="/platform/component-health/reports/field-evidence" className="text-sm font-medium text-primary hover:underline">
              Open evidence report →
            </Link>
          </div>
        </SectionCard>

        <SectionCard title="Evidence boundary" icon={ClipboardCheck}>
          <div className="space-y-2">
            {evidenceBoundary.map((item) => (
              <div key={item} className="flex gap-3 rounded-md bg-muted/40 px-3 py-2 text-sm">
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-slate-400" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="mt-6">
        <SectionCard title="Controlled component probes" icon={Activity}>
          <div className="grid gap-4 lg:grid-cols-3">
            {controlledProbeEvidence.map((probe) => (
              <Link
                key={probe.componentId}
                href={`/platform/component-health/components/${probe.componentId}`}
                className="rounded-xl border border-border p-4 hover:bg-muted/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold">[{String(probe.oemIndex).padStart(2, "0")}] {probe.component}</div>
                    <div className="mt-1 text-xs text-muted-foreground">Controlled probe</div>
                  </div>
                  <StatusPill label="OBSERVED" tone="green" />
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <Metric label="Position" value={`${format(probe.positionRange.observed, 3)} rad`} />
                  <Metric label="Velocity" value={`×${format(probe.velocityAbsP95.ratio)}`} />
                  <Metric label="Torque" value={`×${format(probe.torqueAbsP95.ratio)}`} />
                </div>

                <div className="mt-4 space-y-2">
                  <MiniCompare label="Velocity" ratio={probe.velocityAbsP95.ratio} />
                  <MiniCompare label="Torque" ratio={probe.torqueAbsP95.ratio} />
                </div>

                <p className="mt-4 text-xs leading-5 text-muted-foreground">
                  Same-session idle → human-confirmed motion. Descriptive evidence only.
                </p>
              </Link>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
        <SectionCard
          title="Turning fingerprint"
          icon={Activity}
          action={<Link href="/platform/component-health/phases" className="text-sm font-medium text-primary hover:underline">Phase Explorer →</Link>}
        >
          <div className="space-y-4">
            {operationalFingerprints.TURNING.map((row) => (
              <div key={row.oemIndex}>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <Link
                    href={`/platform/component-health/components/joint-${String(row.oemIndex).padStart(2, "0")}-${row.component.toLowerCase().replaceAll(" ", "-")}`}
                    className="font-medium hover:text-primary"
                  >
                    [{String(row.oemIndex).padStart(2, "0")}] {row.component}
                  </Link>
                  <span className="font-semibold">×{format(row.ratio)}</span>
                </div>
                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-slate-900"
                    style={{ width: `${Math.max(6, (row.ratio / turningMax) * 100)}%` }}
                  />
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Torque absP95 {row.idleTorque.toFixed(3)} → {row.observedTorque.toFixed(3)} N·m
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Data-quality finding" icon={TriangleAlert}>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-semibold text-amber-950">[{unresolvedObservation.oemIndex}] {unresolvedObservation.component}</div>
              <StatusPill label="UNRESOLVED" tone="amber" />
            </div>
            <p className="mt-3 text-sm leading-6 text-amber-900">{unresolvedObservation.observation}</p>
            <p className="mt-3 text-xs leading-5 text-amber-800">{unresolvedObservation.interpretation}</p>
          </div>
          <div className="mt-4 text-xs leading-5 text-muted-foreground">
            {fieldPhases.length} human-confirmed phases are represented. No unresolved slot is converted into a health verdict.
          </div>
        </SectionCard>
      </div>
    </>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 font-medium">{value}</div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-muted/50 px-2 py-3">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
  );
}

function MiniCompare({ label, ratio }: { label: string; ratio: number }) {
  const observedWidth = Math.min(100, Math.max(12, 28 + Math.log2(Math.max(1, ratio)) * 22));

  return (
    <div className="grid grid-cols-[58px_1fr_auto] items-center gap-2 text-[11px]">
      <span className="text-muted-foreground">{label}</span>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-slate-900" style={{ width: `${observedWidth}%` }} />
      </div>
      <span className="font-medium">×{ratio.toFixed(2)}</span>
    </div>
  );
}
