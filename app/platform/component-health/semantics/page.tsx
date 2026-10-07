import { unstable_noStore as noStore } from "next/cache";
import { BadgeCheck, BookOpen, CircleHelp, ShieldAlert } from "lucide-react";
import { PageHeader } from "@/components/elaris/PageHeader";
import { SectionCard } from "@/components/elaris/SectionCard";
import { ComponentHealthWorkbenchEmpty } from "@/components/platform/ComponentHealthWorkbenchEmpty";
import { loadActiveComponentHealthAnalysis } from "@/lib/component-health/workbench-v04";
import {
  buildComponentHealthTechnicalVerification,
  type ComponentHealthTechnicalStatus,
} from "@/lib/component-health/technical-semantics-v042";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function ComponentHealthSemanticsPage() {
  noStore();
  const { artifact } = await loadActiveComponentHealthAnalysis();

  if (!artifact) {
    return (
      <ComponentHealthWorkbenchEmpty title="Component Health · Technical Semantics" />
    );
  }

  const modeMachine = readModeMachine();
  const verification = buildComponentHealthTechnicalVerification(
    artifact.report,
    { modeMachine }
  );

  return (
    <>
      <PageHeader
        title="Technical Semantics Verification"
        actions={
          <div className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900">
            V0.4.2 · {verification.summary.stillUnresolved} unresolved
          </div>
        }
      />

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Confirmed normal"
          value={verification.summary.confirmedNormal}
        />
        <Metric
          label="Confirmed supported"
          value={verification.summary.confirmedSupported}
        />
        <Metric
          label="Confirmed unsupported"
          value={verification.summary.confirmedUnsupported}
        />
        <Metric
          label="Still unresolved"
          value={verification.summary.stillUnresolved}
        />
      </div>

      <div className="mb-6 grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
        <SectionCard title="Qué resolvió V0.4.2" icon={BadgeCheck}>
          <div className="space-y-3 text-sm leading-6">
            <p>
              El mapping OEM de Right wrist yaw queda confirmado en el índice 28
              del mapa público G1.
            </p>
            <p>
              La semántica de los dos canales de temperatura queda anclada a la
              implementación pública de Unitree: casing y winding.
            </p>
            <p>
              Si se adjunta <code>mode_machine</code> observado por lectura,
              Elaris resuelve la familia 23-DOF / 29-DOF contra perfiles públicos
              de Unitree. Eso no convierte ningún valor en diagnóstico.
            </p>
          </div>
        </SectionCard>

        <SectionCard title="Límite de interpretación" icon={ShieldAlert}>
          <div className="space-y-3 text-sm leading-6">
            <p>
              Assessment: <strong>{verification.assessment}</strong>
            </p>
            <p>
              Interpretation: <strong>{verification.interpretation}</strong>
            </p>
            <p>
              La evidencia puede cerrar mappings y contratos de lectura, pero no
              declara HEALTHY, FAILED, SAFE, CERTIFIED ni READY FOR SERVICE.
            </p>
          </div>
        </SectionCard>
      </div>

      <div className="space-y-4">
        {verification.items.map((item) => (
          <div
            key={item.key}
            className="rounded-xl border border-border bg-card p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-xs font-medium text-muted-foreground">
                  {item.key}
                </div>
                <h2 className="mt-1 text-base font-semibold">{item.title}</h2>
              </div>
              <StatusBadge status={item.status} />
            </div>

            <div className="mt-4 grid gap-5 lg:grid-cols-2">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Confirmado
                </div>
                {item.confirmedFacts.length > 0 ? (
                  <ul className="mt-2 space-y-2 text-sm leading-6">
                    {item.confirmedFacts.map((fact) => (
                      <li key={fact}>• {fact}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Sin hecho técnico adicional confirmado en este scope.
                  </p>
                )}
              </div>

              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Todavía abierto
                </div>
                {item.unresolvedQuestions.length > 0 ? (
                  <ul className="mt-2 space-y-2 text-sm leading-6">
                    {item.unresolvedQuestions.map((question) => (
                      <li key={question}>• {question}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Sin pregunta técnica abierta en este scope.
                  </p>
                )}
              </div>
            </div>

            {item.nextAction && (
              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-950">
                <strong>Siguiente acción:</strong> {item.nextAction}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
        <SectionCard title="Evidencia observada" icon={CircleHelp}>
          <div className="space-y-2 text-sm">
            <Fact
              label="mode_machine attached"
              value={
                verification.context.modeMachine === null
                  ? "NOT ATTACHED"
                  : String(verification.context.modeMachine)
              }
            />
            <Fact
              label="Resolved G1 DOF"
              value={
                verification.context.effectiveDof === null
                  ? "UNRESOLVED"
                  : `${verification.context.effectiveDof}-DOF`
              }
            />
            <Fact
              label="Configuration conflict"
              value={verification.context.configurationConflict ? "YES" : "NO"}
            />
            <Fact
              label="Unresolved slot findings"
              value={String(verification.observed.unresolvedSlotCount)}
            />
            <Fact
              label="Right wrist yaw · phases observed"
              value={String(
                verification.observed.rightWristYaw.observedInPhases
              )}
            />
            <Fact
              label="Right wrist yaw · phases unresolved"
              value={String(
                verification.observed.rightWristYaw.unresolvedInPhases
              )}
            />
            <Fact
              label="Duplicate samples"
              value={String(
                verification.observed.duplicateSignalSampleCount
              )}
            />
            <Fact
              label="Largest observed end gap"
              value={
                verification.observed.largestObservedEndGapMs === null
                  ? "—"
                  : `${verification.observed.largestObservedEndGapMs} ms`
              }
            />
          </div>
        </SectionCard>

        <SectionCard title="Fuentes OEM fijadas" icon={BookOpen}>
          <div className="space-y-3">
            {verification.references.map((reference) => (
              <div
                key={reference.id}
                className="rounded-lg border border-border p-3 text-sm"
              >
                <div className="font-medium">{reference.id}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {reference.repository}/{reference.path}
                </div>
                <p className="mt-2 leading-5">{reference.supports}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </>
  );
}

function readModeMachine() {
  const raw = process.env.ELARIS_COMPONENT_HEALTH_G1_MODE_MACHINE?.trim();
  if (!raw) return null;

  const value = Number(raw);
  if (!Number.isInteger(value) || value < 0 || value > 255) {
    return null;
  }

  return value;
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: ComponentHealthTechnicalStatus }) {
  const classes =
    status === "STILL_UNRESOLVED"
      ? "border-amber-200 bg-amber-50 text-amber-900"
      : status === "CONFIRMED_UNSUPPORTED"
        ? "border-blue-200 bg-blue-50 text-blue-900"
        : "border-emerald-200 bg-emerald-50 text-emerald-900";

  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${classes}`}>
      {status.replaceAll("_", " ")}
    </span>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border px-3 py-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
