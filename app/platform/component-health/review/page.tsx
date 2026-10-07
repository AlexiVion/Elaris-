import { unstable_noStore as noStore } from "next/cache";
import { ClipboardCheck, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/elaris/PageHeader";
import { SectionCard } from "@/components/elaris/SectionCard";
import { StatusPill } from "@/components/elaris/StatusPill";
import { ComponentHealthWorkbenchEmpty } from "@/components/platform/ComponentHealthWorkbenchEmpty";
import { ComponentHealthReviewWorkspace } from "@/components/platform/ComponentHealthReviewWorkspace";
import {
  loadActiveComponentHealthAnalysis,
} from "@/lib/component-health/workbench-v04";
import {
  buildComponentHealthReviewQueue,
  getPersistedComponentHealthReview,
  reviewStatusExplanation,
  type ComponentHealthReviewStatus,
} from "@/lib/component-health/review-v041";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function ComponentHealthReviewPage() {
  noStore();
  const { artifact } = await loadActiveComponentHealthAnalysis();

  if (!artifact) {
    return <ComponentHealthWorkbenchEmpty title="Component Health · Review" />;
  }

  const report = artifact.report;
  const queue = buildComponentHealthReviewQueue(report);
  const persisted = await getPersistedComponentHealthReview(
    report.run.analysisId
  );

  const status = (persisted?.status ??
    "AWAITING_TECHNICAL_REVIEW") as ComponentHealthReviewStatus;

  return (
    <>
      <PageHeader
        title="Review & Next Actions"
        actions={
          <StatusPill
            label={status.replaceAll("_", " ")}
            tone={
              status === "BLOCKED"
                ? "red"
                : status === "REVIEWED_FOR_COMPLETENESS"
                  ? "green"
                  : status === "IN_REVIEW"
                    ? "blue"
                    : "amber"
            }
          />
        }
      />

      <div className="mb-6 grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
        <SectionCard title="Qué sabemos ahora" icon={ClipboardCheck}>
          <div className="space-y-3 text-sm leading-6">
            <p>
              Elaris tiene evidencia observada de {report.phases.length} fases y{" "}
              {report.robot.componentSlots} slots del Unitree G1.
            </p>
            <p>
              La evidencia es suficiente para comparar señales con el idle de la
              misma sesión y para identificar problemas de calidad / semántica.
            </p>
            <p>
              No es suficiente para afirmar que un componente está sano, fallando
              o cerca de fallar. Ese tipo de conclusión requiere reglas
              ingenieriles u outcomes validados que todavía no existen.
            </p>
          </div>
        </SectionCard>

        <SectionCard title="Estado de decisión" icon={ShieldCheck}>
          <div className="space-y-3 text-sm">
            <Fact label="Review workflow" value={status.replaceAll("_", " ")} />
            <Fact label="Significado" value={reviewStatusExplanation(status)} />
            <Fact label="Data export" value="NOT APPROVED" />
            <Fact label="Public release" value="NOT AUTHORIZED" />
          </div>
        </SectionCard>
      </div>

      <ComponentHealthReviewWorkspace
        analysisId={report.run.analysisId}
        queue={queue}
        initialReview={{
          status,
          summary: persisted?.summary ?? "",
        }}
        persistedItems={(persisted?.items ?? []).map((item) => ({
          scopeKey: item.scopeKey,
          disposition: item.disposition,
          note: item.note,
        }))}
      />
    </>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-medium">{value}</div>
    </div>
  );
}
