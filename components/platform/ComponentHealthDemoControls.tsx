"use client";

import { useState } from "react";
import { CheckCircle2, SearchCheck, Wrench } from "lucide-react";

type DemoState = "ATTENTION" | "INSPECTION SCHEDULED" | "INSPECTION RECORDED" | "REPLACEMENT PROPOSED";

export function ComponentHealthDemoControls() {
  const [state, setState] = useState<DemoState>("ATTENTION");
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Demo interaction</div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <div><div className="text-sm font-semibold">Current case state</div><div className="mt-1 text-sm text-muted-foreground">{state}</div></div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setState("INSPECTION SCHEDULED")} className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-muted"><SearchCheck className="size-4" />Schedule inspection</button>
          <button type="button" onClick={() => setState("INSPECTION RECORDED")} className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-muted"><CheckCircle2 className="size-4" />Mark inspected</button>
          <button type="button" onClick={() => setState("REPLACEMENT PROPOSED")} className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"><Wrench className="size-4" />Propose replacement</button>
        </div>
      </div>
      <p className="mt-4 text-xs leading-5 text-muted-foreground">Presentation-only state. No service decision is persisted and no automated maintenance authority is implied.</p>
    </div>
  );
}
