"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { Input, Textarea, Label, Select } from "@/components/ui/input";
import { reviewImpact, resolveImpact, waiveImpact, assignImpact } from "@/lib/actions/changes";

interface PersonOpt { id: string; name: string }
interface EvidenceOpt { id: string; label: string }

export function ImpactActions({
  itemId,
  targetType,
  suggestedAction,
  status,
  persons,
  evidenceOptions,
}: {
  itemId: string;
  targetType: string;
  suggestedAction: string;
  status: string;
  persons: PersonOpt[];
  evidenceOptions: EvidenceOpt[];
}) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [assignee, setAssignee] = useState(persons[0]?.id ?? "");
  const [note, setNote] = useState("");
  const [newEvidenceId, setNewEvidenceId] = useState("");
  const [testDate, setTestDate] = useState("");
  const [testResult, setTestResult] = useState("");
  const [justification, setJustification] = useState("");

  const done = status === "RESOLVED" || status === "WAIVED";
  const requiresTestOrEvidence = suggestedAction === "RE_RUN";
  const isApproval = targetType === "APPROVAL";

  function run(fn: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    start(async () => {
      const res = await fn();
      if (!res.ok) setError(res.error ?? "Action failed");
      else {
        setOpen(false);
        router.refresh();
      }
    });
  }

  if (done) {
    return <span className="text-xs text-muted-foreground">Closed</span>;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Manage</Button>
      </DialogTrigger>
      <DialogContent
        title={isApproval ? "Manage affected approval" : "Manage impact item"}
        description={isApproval
          ? "The named approver must record the re-approval. It cannot be waived by the change approver."
          : "Put in review, assign, resolve or waive this item."}
      >
        <div className="space-y-5">
          {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

          {/* Assign + review */}
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Label htmlFor="assignee">Assign to</Label>
              <Select id="assignee" value={assignee} onChange={(e) => setAssignee(e.target.value)}>
                {persons.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </Select>
            </div>
            <Button variant="outline" disabled={pending || !assignee} onClick={() => run(() => assignImpact({ itemId, assigneeId: assignee }))}>
              Assign
            </Button>
            <Button variant="outline" disabled={pending} onClick={() => run(() => reviewImpact({ itemId }))}>
              Put in review
            </Button>
          </div>

          {/* Resolve */}
          <div className="rounded-md border border-border p-3">
            <div className="mb-2 text-sm font-medium">Resolve</div>
            {requiresTestOrEvidence && (
              <p className="mb-2 text-xs text-muted-foreground">
                A re-run needs a linked new evidence item, or a test date and result (spec §6.4).
              </p>
            )}
            <div className="space-y-2">
              {requiresTestOrEvidence && (
                <>
                  <div>
                    <Label htmlFor="newEv">Link new evidence</Label>
                    <Select id="newEv" value={newEvidenceId} onChange={(e) => setNewEvidenceId(e.target.value)}>
                      <option value="">— none —</option>
                      {evidenceOptions.map((e) => (
                        <option key={e.id} value={e.id}>{e.label}</option>
                      ))}
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="testDate">Test date</Label>
                      <Input id="testDate" type="date" value={testDate} onChange={(e) => setTestDate(e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="testResult">Result</Label>
                      <Input id="testResult" value={testResult} onChange={(e) => setTestResult(e.target.value)} placeholder="Pass / notes" />
                    </div>
                  </div>
                </>
              )}
              <div>
                <Label htmlFor="note">{isApproval ? "Re-approval note" : "Resolution note"}</Label>
                <Textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} placeholder={isApproval ? "What the named approver reviewed" : "What was done"} />
              </div>
              <Button
                disabled={pending}
                onClick={() => run(() => resolveImpact({ itemId, note, newEvidenceId: newEvidenceId || undefined, testDate: testDate || undefined, testResult: testResult || undefined }))}
              >
                {isApproval ? "Record re-approval" : "Resolve item"}
              </Button>
            </div>
          </div>

          {/* Waive */}
          {isApproval ? (
            <div className="rounded-md border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
              Affected approvals cannot be waived here. The named approver must review and record the re-approval.
            </div>
          ) : (
            <div className="rounded-md border border-border p-3">
              <div className="mb-2 text-sm font-medium">Waive</div>
              <p className="mb-2 text-xs text-muted-foreground">A waiver requires a written justification, recorded in the audit log (spec §6.4).</p>
              <Textarea value={justification} onChange={(e) => setJustification(e.target.value)} placeholder="Justification (required)" />
              <Button variant="destructive" className="mt-2" disabled={pending || justification.trim().length < 3} onClick={() => run(() => waiveImpact({ itemId, justification }))}>
                Waive item
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
