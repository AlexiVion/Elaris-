"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { Input, Label, Textarea, Select } from "@/components/ui/input";
import { createIncident } from "@/lib/actions/incidents";
import { SEVERITIES } from "@/lib/domain/enums";
import { criticalityLike } from "@/lib/copy/labels";

interface DeploymentOpt { code: string; name: string; robots: { id: string; code: string }[] }

export function IncidentFormDialog({ deployments }: { deployments: DeploymentOpt[] }) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [deploymentCode, setDeploymentCode] = useState(deployments[0]?.code ?? "");
  const robots = deployments.find((d) => d.code === deploymentCode)?.robots ?? [];
  const [robotId, setRobotId] = useState(robots[0]?.id ?? "");
  const [occurredAt, setOccurredAt] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("MEDIUM");
  const [timeline, setTimeline] = useState<{ at: string; note: string }[]>([]);

  function onDeployment(code: string) {
    setDeploymentCode(code);
    const r = deployments.find((d) => d.code === code)?.robots ?? [];
    setRobotId(r[0]?.id ?? "");
  }

  function submit() {
    setError(null);
    start(async () => {
      const res = await createIncident({
        deploymentCode, robotId, occurredAt, description, severity,
        timeline: timeline.filter((t) => t.at && t.note),
      });
      if (!res.ok) setError(res.error);
      else { setOpen(false); router.refresh(); }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>New incident</Button>
      </DialogTrigger>
      <DialogContent title="Log incident" description="The active baseline and snapshot are linked automatically (spec §7.7).">
        <div className="max-h-[70vh] space-y-3 overflow-y-auto pr-1">
          {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1 block">Deployment</Label>
              <Select value={deploymentCode} onChange={(e) => onDeployment(e.target.value)}>
                {deployments.map((d) => <option key={d.code} value={d.code}>{d.name}</option>)}
              </Select>
            </div>
            <div>
              <Label className="mb-1 block">Robot</Label>
              <Select value={robotId} onChange={(e) => setRobotId(e.target.value)}>
                {robots.map((r) => <option key={r.id} value={r.id}>{r.code}</option>)}
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1 block">Occurred at</Label>
              <Input type="datetime-local" value={occurredAt} onChange={(e) => setOccurredAt(e.target.value)} />
            </div>
            <div>
              <Label className="mb-1 block">Severity</Label>
              <Select value={severity} onChange={(e) => setSeverity(e.target.value)}>
                {SEVERITIES.map((s) => <option key={s} value={s}>{criticalityLike[s]}</option>)}
              </Select>
            </div>
          </div>
          <div>
            <Label className="mb-1 block">Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between">
              <Label>Timeline</Label>
              <Button type="button" variant="outline" size="sm" onClick={() => setTimeline((t) => [...t, { at: "", note: "" }])}>
                <Plus className="size-3.5" /> Add step
              </Button>
            </div>
            <div className="space-y-2">
              {timeline.map((t, i) => (
                <div key={i} className="flex gap-2">
                  <Input placeholder="10:14:01" value={t.at} onChange={(e) => setTimeline((prev) => prev.map((x, j) => (j === i ? { ...x, at: e.target.value } : x)))} className="w-32" />
                  <Input placeholder="What happened" value={t.note} onChange={(e) => setTimeline((prev) => prev.map((x, j) => (j === i ? { ...x, note: e.target.value } : x)))} />
                  <Button type="button" variant="ghost" size="icon" onClick={() => setTimeline((prev) => prev.filter((_, j) => j !== i))}><Trash2 className="size-4" /></Button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit} disabled={pending}>{pending ? "Saving…" : "Log incident"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
