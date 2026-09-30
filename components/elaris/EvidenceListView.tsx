import { Card } from "@/components/ui/card";
import { EnumPill } from "@/components/elaris/EnumPill";
import { EvidenceFormDialog, type EvidenceInitial } from "@/components/elaris/EvidenceFormDialog";
import { evidenceStatusPill, severityPill, kindLabel, slotLabel } from "@/lib/copy/labels";
import { getEvidenceList, getFormOptions, type EvidenceFilters } from "@/lib/db/evidence";
import { EVIDENCE_STATUSES, CRITICALITIES, type EvidenceCategory } from "@/lib/domain/enums";

const th = "px-4 py-3 text-left text-xs font-medium text-muted-foreground";

export async function EvidenceListView({
  category,
  title,
  basePath,
  filters,
}: {
  category: EvidenceCategory;
  title: string;
  basePath: string;
  filters: EvidenceFilters;
}) {
  const [rows, options] = await Promise.all([getEvidenceList(category, filters), getFormOptions()]);

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <EvidenceFormDialog triggerLabel={`New ${category === "EVIDENCE" ? "evidence" : "requirement"}`} deployments={options.deployments} persons={options.persons} defaultCategory={category} />
      </div>

      {/* Filters (GET form → query params) */}
      <form className="mb-4 flex flex-wrap items-end gap-2" action={basePath} method="get">
        <FilterSelect name="deployment" label="Deployment" value={filters.deploymentCode}>
          <option value="">All</option>
          {options.deployments.map((d) => <option key={d.code} value={d.code}>{d.name}</option>)}
        </FilterSelect>
        <FilterSelect name="status" label="Status" value={filters.status}>
          <option value="">All</option>
          {EVIDENCE_STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ").toLowerCase()}</option>)}
        </FilterSelect>
        <FilterSelect name="criticality" label="Criticality" value={filters.criticality}>
          <option value="">All</option>
          {CRITICALITIES.map((c) => <option key={c} value={c}>{c.toLowerCase()}</option>)}
        </FilterSelect>
        <button className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground" type="submit">Filter</button>
      </form>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className={th}>Code</th>
                <th className={th}>Title</th>
                <th className={th}>Deployment</th>
                <th className={th}>Type</th>
                <th className={th}>Scope</th>
                <th className={th}>Owner</th>
                <th className={th}>Criticality</th>
                <th className={th}>Status</th>
                <th className={th}></th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-10 text-center text-muted-foreground">No items match these filters.</td></tr>
              ) : rows.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{r.code}</td>
                  <td className="px-4 py-3">{r.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.deploymentName}</td>
                  <td className="px-4 py-3">{kindLabel[r.kind] ?? r.kind}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{r.scopeSlots.map((s) => slotLabel[s] ?? s).join(", ") || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.ownerName}</td>
                  <td className="px-4 py-3"><EnumPill value={r.criticality} map={severityPill} /></td>
                  <td className="px-4 py-3"><EnumPill value={r.status} map={evidenceStatusPill} /></td>
                  <td className="px-4 py-3">
                    <EvidenceFormDialog triggerLabel="Edit" triggerVariant="outline" deployments={options.deployments} persons={options.persons} initial={toInitial(r)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

function toInitial(r: Awaited<ReturnType<typeof getEvidenceList>>[number]): EvidenceInitial {
  return {
    id: r.id, code: r.code, title: r.title, category: r.category, kind: r.kind,
    readinessCategory: r.readinessCategory, source: r.source, deploymentCode: r.deploymentCode,
    scopeSlots: r.scopeSlots, criticality: r.criticality, status: r.status, required: r.required,
    applicable: r.applicable, ownerPersonId: r.ownerPersonId, uri: r.uri, fileSha256: r.fileSha256, dueDate: r.dueDate,
  };
}

function FilterSelect({ name, label, value, children }: { name: string; label: string; value?: string; children: React.ReactNode }) {
  return (
    <label className="text-xs text-muted-foreground">
      <span className="mb-1 block">{label}</span>
      <select name={name} defaultValue={value ?? ""} className="h-9 rounded-md border border-input bg-background px-2 text-sm text-foreground">
        {children}
      </select>
    </label>
  );
}
