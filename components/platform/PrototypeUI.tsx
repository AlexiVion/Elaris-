import type { ReactNode } from "react";

export function ProductPageHeader({
  eyebrow,
  title,
  description,
  aside,
}: {
  eyebrow: string;
  title: string;
  description: string;
  aside?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-5">
      <div className="max-w-3xl">
        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{eyebrow}</div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
      </div>
      {aside}
    </div>
  );
}

export function MetricCard({
  label,
  value,
  note,
  tone = "neutral",
}: {
  label: string;
  value: string | number;
  note?: string;
  tone?: "neutral" | "good" | "attention" | "danger";
}) {
  const toneClass = {
    neutral: "border-slate-200 bg-white",
    good: "border-emerald-200 bg-emerald-50/60",
    attention: "border-amber-200 bg-amber-50/70",
    danger: "border-rose-200 bg-rose-50/70",
  }[tone];

  return (
    <div className={`rounded-2xl border p-4 ${toneClass}`}>
      <div className="text-xs font-medium text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{value}</div>
      {note && <div className="mt-1 text-xs leading-5 text-slate-500">{note}</div>}
    </div>
  );
}

export function Panel({
  title,
  description,
  children,
  action,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="font-semibold text-slate-950">{title}</h2>
          {description && <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>}
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function StatusPill({ value }: { value: string }) {
  const normalized = value.toUpperCase();
  const cls =
    ["VALID", "APPROVED", "CLOSED", "READY", "ACCEPTED", "COMPLETE"].includes(normalized)
      ? "bg-emerald-100 text-emerald-800"
      : ["MISSING", "HIGH", "REJECTED", "BLOCKED"].includes(normalized)
        ? "bg-rose-100 text-rose-800"
        : ["IN_REVIEW", "REVIEW_REQUIRED", "PENDING", "MEDIUM", "WAITING"].includes(normalized)
          ? "bg-amber-100 text-amber-800"
          : "bg-slate-100 text-slate-700";

  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${cls}`}>{value.replaceAll("_", " ")}</span>;
}

export function DefinitionList({
  items,
}: {
  items: Array<{ label: string; value: ReactNode }>;
}) {
  return (
    <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label}>
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">{item.label}</dt>
          <dd className="mt-1 text-sm font-medium text-slate-900">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function PrototypeNotice({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-xs leading-5 text-violet-950">
      <span className="font-semibold">Prototype hypothesis:</span> {children}
    </div>
  );
}

export function WorkRow({
  title,
  meta,
  status,
  right,
}: {
  title: string;
  meta: string;
  status: string;
  right?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 py-3 last:border-b-0">
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-slate-900">{title}</div>
        <div className="mt-0.5 text-xs text-slate-500">{meta}</div>
      </div>
      <StatusPill value={status} />
      {right}
    </div>
  );
}
