"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, CircleAlert, ClipboardCheck, Save } from "lucide-react";

type ReviewStatus =
  | "AWAITING_TECHNICAL_REVIEW"
  | "IN_REVIEW"
  | "REVIEWED_FOR_COMPLETENESS"
  | "BLOCKED";

type Disposition =
  | "OPEN"
  | "ACKNOWLEDGED"
  | "NEEDS_FOLLOWUP"
  | "DATA_LIMITATION";

type QueueItem = {
  scopeKey: string;
  code: string;
  evidenceCount: number;
  phaseCount: number;
  componentCount: number;
  priority: "HIGH" | "MEDIUM" | "LOW";
  recommendedAction: string;
  plainLanguage: string;
  whyItMatters: string;
};

type PersistedItem = {
  scopeKey: string;
  disposition: string;
  note: string | null;
};

export function ComponentHealthReviewWorkspace({
  analysisId,
  queue,
  initialReview,
  persistedItems,
}: {
  analysisId: string;
  queue: QueueItem[];
  initialReview: {
    status: ReviewStatus;
    summary: string;
  };
  persistedItems: PersistedItem[];
}) {
  const [status, setStatus] = useState<ReviewStatus>(initialReview.status);
  const [summary, setSummary] = useState(initialReview.summary);
  const [savingReview, setSavingReview] = useState(false);
  const [savedReview, setSavedReview] = useState(false);

  const initialByKey = useMemo(
    () => new Map(persistedItems.map((item) => [item.scopeKey, item])),
    [persistedItems]
  );

  async function saveReview() {
    setSavingReview(true);
    setSavedReview(false);
    try {
      const response = await fetch("/api/component-health/review", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ analysisId, status, summary }),
      });
      if (!response.ok) throw new Error(await response.text());
      setSavedReview(true);
    } finally {
      setSavingReview(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
        <div className="flex items-start gap-3">
          <ClipboardCheck className="mt-0.5 size-5 text-blue-700" />
          <div>
            <div className="font-semibold text-blue-950">
              Qué tenés que decidir acá
            </div>
            <p className="mt-2 text-sm leading-6 text-blue-900">
              No tenés que decidir si el robot está sano. Esta revisión sólo
              documenta qué evidencia está clara, qué limitaciones siguen abiertas
              y qué debe revisar alguien con conocimiento técnico/OEM antes de
              hacer una afirmación más fuerte.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="grid gap-4 lg:grid-cols-[240px_1fr_auto] lg:items-end">
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Estado de revisión
            </label>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as ReviewStatus)}
              className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="AWAITING_TECHNICAL_REVIEW">
                Awaiting technical review
              </option>
              <option value="IN_REVIEW">In review</option>
              <option value="REVIEWED_FOR_COMPLETENESS">
                Reviewed for completeness
              </option>
              <option value="BLOCKED">Blocked</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Nota general
            </label>
            <textarea
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
              placeholder="Ej.: revisión documental iniciada; interpretación mecánica pendiente de validación OEM."
              rows={2}
              className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          <button
            type="button"
            onClick={saveReview}
            disabled={savingReview}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-slate-900 px-4 text-sm font-medium text-white disabled:opacity-50"
          >
            <Save className="size-4" />
            {savingReview ? "Guardando…" : savedReview ? "Guardado" : "Guardar"}
          </button>
        </div>

        {status === "REVIEWED_FOR_COMPLETENESS" && (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">
            “Reviewed for completeness” significa que revisaste que la evidencia
            y sus límites estén documentados. No significa healthy, safe,
            certified ni approved for export.
          </div>
        )}
      </div>

      <div className="space-y-4">
        {queue.map((item) => (
          <ReviewItemCard
            key={item.scopeKey}
            analysisId={analysisId}
            item={item}
            initial={initialByKey.get(item.scopeKey)}
          />
        ))}
      </div>
    </div>
  );
}

function ReviewItemCard({
  analysisId,
  item,
  initial,
}: {
  analysisId: string;
  item: QueueItem;
  initial?: PersistedItem;
}) {
  const [disposition, setDisposition] = useState<Disposition>(
    (initial?.disposition as Disposition | undefined) ?? "OPEN"
  );
  const [note, setNote] = useState(initial?.note ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    setSaved(false);
    try {
      const response = await fetch("/api/component-health/review/item", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          analysisId,
          scopeKey: item.scopeKey,
          disposition,
          note,
        }),
      });
      if (!response.ok) throw new Error(await response.text());
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2">
            {item.priority === "HIGH" ? (
              <CircleAlert className="size-4 text-red-600" />
            ) : (
              <CheckCircle2 className="size-4 text-slate-500" />
            )}
            <div className="text-sm font-semibold">
              {item.code.replaceAll("_", " ")}
            </div>
          </div>

          <div className="mt-2 text-sm leading-6">{item.plainLanguage}</div>

          <div className="mt-3 rounded-lg bg-muted/40 p-3 text-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Qué hay que hacer
            </div>
            <div className="mt-1">{item.recommendedAction}</div>
          </div>

          <div className="mt-3 text-xs leading-5 text-muted-foreground">
            <strong>Por qué importa:</strong> {item.whyItMatters}
          </div>
        </div>

        <div className="rounded-full border border-border px-3 py-1 text-xs font-semibold">
          {item.priority} · {item.evidenceCount} records
        </div>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-[220px_1fr_auto] lg:items-end">
        <div>
          <label className="text-xs font-medium text-muted-foreground">
            Disposición
          </label>
          <select
            value={disposition}
            onChange={(event) =>
              setDisposition(event.target.value as Disposition)
            }
            className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="OPEN">Open</option>
            <option value="ACKNOWLEDGED">Acknowledged</option>
            <option value="NEEDS_FOLLOWUP">Needs follow-up</option>
            <option value="DATA_LIMITATION">Data limitation</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground">
            Nota
          </label>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={2}
            placeholder="Documentá solamente lo que sabés; no hace falta interpretar mecánica si no está confirmado."
            className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>

        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border bg-background px-4 text-sm font-medium hover:bg-muted disabled:opacity-50"
        >
          <Save className="size-4" />
          {saving ? "Guardando…" : saved ? "Guardado" : "Guardar"}
        </button>
      </div>

      <div className="mt-3 text-xs text-muted-foreground">
        Afecta {item.phaseCount} fases · {item.componentCount} componentes.
      </div>
    </div>
  );
}
