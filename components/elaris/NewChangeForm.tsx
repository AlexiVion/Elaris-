"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { EnumPill } from "@/components/elaris/EnumPill";
import { severityPill, slotLabel, suggestedActionLabel, categoryLabel } from "@/lib/copy/labels";
import { previewChange, createChange } from "@/lib/actions/changes";
import type { DiffEntry, ImpactResult, ImpactCounts } from "@/lib/domain/types";

interface SlotValue { slot: string; value: string }

export function NewChangeForm({
  deploymentCode,
  initialItems,
}: {
  deploymentCode: string;
  initialItems: SlotValue[];
}) {
  const [values, setValues] = useState<SlotValue[]>(initialItems);
  const [note, setNote] = useState("");
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ diff: DiffEntry[]; items: ImpactResult[]; counts: ImpactCounts } | null>(null);
  const router = useRouter();

  const changedSlots = new Set(
    values.filter((v, i) => v.value.trim() !== (initialItems[i]?.value ?? "")).map((v) => v.slot)
  );
  const hasChanges = changedSlots.size > 0;

  function setValue(slot: string, value: string) {
    setValues((prev) => prev.map((v) => (v.slot === slot ? { ...v, value } : v)));
    setPreview(null);
  }

  function doPreview() {
    setError(null);
    start(async () => {
      const res = await previewChange({ deploymentCode, edits: values, note });
      if (!res.ok) { setError(res.error); setPreview(null); }
      else setPreview(res.data);
    });
  }

  function doConfirm() {
    setError(null);
    start(async () => {
      const res = await createChange({ deploymentCode, edits: values, note });
      if (!res.ok) setError(res.error);
      else router.push(`/changes/${res.data.code}`);
    });
  }

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <h3 className="mb-3 text-base font-semibold">Edit configuration</h3>
        <p className="mb-4 text-sm text-muted-foreground">
          Values start from the active snapshot. Edit any slot; changed slots are highlighted.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {values.map((v) => {
            const isChanged = changedSlots.has(v.slot);
            return (
              <div key={v.slot}>
                <Label htmlFor={v.slot}>
                  {slotLabel[v.slot] ?? v.slot}
                  {isChanged && <span className="ml-2 text-xs font-normal text-emerald-600">changed</span>}
                </Label>
                <Input id={v.slot} value={v.value} onChange={(e) => setValue(v.slot, e.target.value)} className={isChanged ? "border-emerald-400" : ""} />
              </div>
            );
          })}
        </div>
        <div className="mt-4">
          <Label htmlFor="note">Note (optional)</Label>
          <Textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Why this change" />
        </div>
        {error && <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <div className="mt-4 flex gap-2">
          <Button variant="outline" onClick={doPreview} disabled={pending || !hasChanges}>
            {pending && !preview ? "Computing…" : "Preview impact"}
          </Button>
          <Button onClick={doConfirm} disabled={pending || !hasChanges}>
            Confirm change
          </Button>
        </div>
      </Card>

      {preview && (
        <Card className="p-5">
          <h3 className="mb-3 text-base font-semibold">Preview</h3>
          <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Counter value={preview.counts.evidence} label="Evidence" />
            <Counter value={preview.counts.requirements} label="Requirements" />
            <Counter value={preview.counts.approvals} label="Approvals" />
            <Counter value={preview.counts.deployments} label="Deployment" />
          </div>
          <div className="mb-4">
            <div className="mb-1 text-sm font-medium">Diff</div>
            <ul className="text-sm">
              {preview.diff.map((d) => (
                <li key={d.slot} className="flex gap-2 border-t border-border py-1.5">
                  <span className="w-32 text-muted-foreground">{slotLabel[d.slot] ?? d.slot}</span>
                  <span className="text-red-600 line-through">{d.before ?? "—"}</span>
                  <span>→</span>
                  <span className="text-emerald-600">{d.after ?? "—"}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="text-sm font-medium">Affected items ({preview.items.length})</div>
          <table className="mt-1 w-full text-sm">
            <tbody>
              {preview.items.map((it, i) => (
                <tr key={i} className="border-t border-border">
                  <td className="py-2 pr-2 font-medium">{it.title}</td>
                  <td className="py-2 pr-2 text-muted-foreground">{categoryLabel[it.targetType] ?? it.targetType.toLowerCase()}</td>
                  <td className="py-2 pr-2">{suggestedActionLabel[it.suggestedAction] ?? it.suggestedAction}</td>
                  <td className="py-2"><EnumPill value={it.severity} map={severityPill} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

function Counter({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-md bg-muted/60 p-3">
      <div className="text-xl font-semibold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
