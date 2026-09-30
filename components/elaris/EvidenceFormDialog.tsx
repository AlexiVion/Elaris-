"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { Input, Label, Select } from "@/components/ui/input";
import { saveEvidence } from "@/lib/actions/evidence";
import {
  EVIDENCE_CATEGORIES, EVIDENCE_KINDS, READINESS_CATEGORIES, EVIDENCE_SOURCES,
  CRITICALITIES, EVIDENCE_STATUSES, SLOTS,
} from "@/lib/domain/enums";
import {
  categoryLabel, kindLabel, readinessCategoryLabel, criticalityLike, slotLabel,
} from "@/lib/copy/labels";

interface Opt { code: string; name: string }
interface PersonOpt { id: string; name: string }

export interface EvidenceInitial {
  id?: string;
  code: string;
  title: string;
  category: string;
  kind: string;
  readinessCategory: string;
  source: string;
  deploymentCode: string;
  scopeSlots: string[];
  criticality: string;
  status: string;
  required: boolean;
  applicable: boolean;
  ownerPersonId: string;
  uri: string;
  fileSha256: string;
  dueDate: string; // yyyy-mm-dd or ""
}

const empty = (deploymentCode: string, category: string): EvidenceInitial => ({
  code: "", title: "", category, kind: "TEST", readinessCategory: "SAFETY_EVIDENCE", source: "INTERNAL",
  deploymentCode, scopeSlots: [], criticality: "MEDIUM", status: "NOT_STARTED", required: true, applicable: true,
  ownerPersonId: "", uri: "", fileSha256: "", dueDate: "",
});

export function EvidenceFormDialog({
  triggerLabel,
  triggerVariant = "default",
  deployments,
  persons,
  defaultCategory = "EVIDENCE",
  initial,
}: {
  triggerLabel: string;
  triggerVariant?: "default" | "outline";
  deployments: Opt[];
  persons: PersonOpt[];
  defaultCategory?: string;
  initial?: EvidenceInitial;
}) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [f, setF] = useState<EvidenceInitial>(
    initial ?? empty(deployments[0]?.code ?? "", defaultCategory)
  );
  const router = useRouter();

  function set<K extends keyof EvidenceInitial>(k: K, v: EvidenceInitial[K]) {
    setF((prev) => ({ ...prev, [k]: v }));
  }
  function toggleSlot(slot: string) {
    setF((prev) => ({
      ...prev,
      scopeSlots: prev.scopeSlots.includes(slot) ? prev.scopeSlots.filter((s) => s !== slot) : [...prev.scopeSlots, slot],
    }));
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // Compute SHA-256 in the browser; the file itself is NOT uploaded (spec §7.6).
    const buf = await file.arrayBuffer();
    const digest = await crypto.subtle.digest("SHA-256", buf);
    const hex = Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
    set("fileSha256", hex);
  }

  function submit() {
    setError(null);
    start(async () => {
      const res = await saveEvidence({ ...f, uri: f.uri || "", fileSha256: f.fileSha256 || "", dueDate: f.dueDate || "" });
      if (!res.ok) setError(res.error);
      else { setOpen(false); router.refresh(); }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={triggerVariant} size={initial ? "sm" : "default"}>{triggerLabel}</Button>
      </DialogTrigger>
      <DialogContent title={initial ? `Edit ${initial.code}` : "New item"} description="Reference metadata + link (spec §1.1). The document lives in the customer's system.">
        <div className="max-h-[70vh] space-y-3 overflow-y-auto pr-1">
          {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

          <div className="grid grid-cols-2 gap-3">
            <Field label="Code"><Input value={f.code} disabled={!!initial} onChange={(e) => set("code", e.target.value)} placeholder="INT-050" /></Field>
            <Field label="Deployment">
              <Select value={f.deploymentCode} onChange={(e) => set("deploymentCode", e.target.value)}>
                {deployments.map((d) => <option key={d.code} value={d.code}>{d.name}</option>)}
              </Select>
            </Field>
          </div>

          <Field label="Title"><Input value={f.title} onChange={(e) => set("title", e.target.value)} /></Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Category">
              <Select value={f.category} onChange={(e) => set("category", e.target.value)}>
                {EVIDENCE_CATEGORIES.map((c) => <option key={c} value={c}>{categoryLabel[c]}</option>)}
              </Select>
            </Field>
            <Field label="Kind">
              <Select value={f.kind} onChange={(e) => set("kind", e.target.value)}>
                {EVIDENCE_KINDS.map((k) => <option key={k} value={k}>{kindLabel[k]}</option>)}
              </Select>
            </Field>
            <Field label="Readiness category">
              <Select value={f.readinessCategory} onChange={(e) => set("readinessCategory", e.target.value)}>
                {READINESS_CATEGORIES.map((r) => <option key={r} value={r}>{readinessCategoryLabel[r]}</option>)}
              </Select>
            </Field>
            <Field label="Source">
              <Select value={f.source} onChange={(e) => set("source", e.target.value)}>
                {EVIDENCE_SOURCES.map((s) => <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>)}
              </Select>
            </Field>
            <Field label="Criticality">
              <Select value={f.criticality} onChange={(e) => set("criticality", e.target.value)}>
                {CRITICALITIES.map((c) => <option key={c} value={c}>{criticalityLike[c]}</option>)}
              </Select>
            </Field>
            <Field label="Status">
              <Select value={f.status} onChange={(e) => set("status", e.target.value)}>
                {EVIDENCE_STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ").toLowerCase()}</option>)}
              </Select>
            </Field>
            <Field label="Owner">
              <Select value={f.ownerPersonId} onChange={(e) => set("ownerPersonId", e.target.value)}>
                <option value="">— select —</option>
                {persons.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </Select>
            </Field>
            <Field label="Due date"><Input type="date" value={f.dueDate} onChange={(e) => set("dueDate", e.target.value)} /></Field>
          </div>

          <Field label="Scope (slots)">
            <div className="flex flex-wrap gap-1.5">
              {SLOTS.map((s) => {
                const on = f.scopeSlots.includes(s);
                return (
                  <button key={s} type="button" onClick={() => toggleSlot(s)}
                    className={`rounded-full border px-2.5 py-0.5 text-xs ${on ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}>
                    {slotLabel[s]}
                  </button>
                );
              })}
            </div>
          </Field>

          <Field label="Reference URI"><Input value={f.uri} onChange={(e) => set("uri", e.target.value)} placeholder="https://…" /></Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="File (SHA-256 only, not uploaded)">
              <Input type="file" onChange={onFile} />
              {f.fileSha256 && <p className="mt-1 truncate font-mono text-xs text-muted-foreground">{f.fileSha256}</p>}
            </Field>
            <div className="flex items-end gap-4 pb-1">
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.required} onChange={(e) => set("required", e.target.checked)} /> Required</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.applicable} onChange={(e) => set("applicable", e.target.checked)} /> Applicable</label>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit} disabled={pending}>{pending ? "Saving…" : "Save"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="mb-1 block">{label}</Label>
      {children}
    </div>
  );
}
