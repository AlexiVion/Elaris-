"use client";

import { useState } from "react";
import { Check, Send, ShieldCheck } from "lucide-react";

export function DecisionComposer() {
  const [decision, setDecision] = useState("Review required");
  const [note, setNote] = useState("Resolve missing training/site acceptance evidence and complete IT review before go-live.");
  const [saved, setSaved] = useState(false);

  const options = ["Accept", "Accept with conditions", "Review required", "Reject"];

  return (
    <div>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => { setDecision(option); setSaved(false); }}
            className={decision === option
              ? "rounded-xl border border-blue-500 bg-blue-50 p-3 text-left ring-1 ring-blue-500"
              : "rounded-xl border border-slate-200 bg-white p-3 text-left hover:bg-slate-50"}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-slate-900">{option}</span>
              {decision === option && <Check className="size-4 text-blue-700" />}
            </div>
          </button>
        ))}
      </div>

      <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-slate-400">Decision note / conditions</label>
      <textarea
        value={note}
        onChange={(event) => { setNote(event.target.value); setSaved(false); }}
        rows={3}
        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
      />

      <button
        type="button"
        onClick={() => setSaved(true)}
        className="mt-3 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
      >
        <ShieldCheck className="size-4" />
        Record demo decision
      </button>

      {saved && (
        <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
          Demo decision recorded in this browser session: <strong>{decision}</strong>.
        </div>
      )}
    </div>
  );
}

export function RequestEvidenceButton({ label = "Request evidence" }: { label?: string }) {
  const [sent, setSent] = useState(false);
  return (
    <button
      type="button"
      onClick={() => setSent(true)}
      className={sent
        ? "inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700"
        : "inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"}
    >
      {sent ? <Check className="size-3.5" /> : <Send className="size-3.5" />}
      {sent ? "Request drafted" : label}
    </button>
  );
}
