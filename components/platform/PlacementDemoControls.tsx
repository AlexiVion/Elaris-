"use client";

import { useState } from "react";
import { Check, Send, Share2 } from "lucide-react";

export function RequestClientInfoButton({ label = "Request client information" }: { label?: string }) {
  const [sent, setSent] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setSent(true)}
      className={sent
        ? "inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700"
        : "inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"}
    >
      {sent ? <Check className="size-3.5" /> : <Send className="size-3.5" />}
      {sent ? "Request drafted" : label}
    </button>
  );
}

export function MarketQuestionResponse() {
  const [answer, setAnswer] = useState(
    "Restricted-zone entry is handled through the deployment safety controls and site operating procedure. The current technical pack references SAF-017 and the active baseline B-0017-01; broker review is required before sending."
  );
  const [ready, setReady] = useState(false);

  return (
    <div>
      <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        Draft broker response
      </label>
      <textarea
        value={answer}
        onChange={(event) => {
          setAnswer(event.target.value);
          setReady(false);
        }}
        rows={5}
        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm leading-6 text-slate-800 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
      />
      <button
        type="button"
        onClick={() => setReady(true)}
        className="mt-3 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
      >
        <Check className="size-4" />
        Mark ready for broker review
      </button>
      {ready && (
        <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
          Demo response is ready for broker review. Nothing was sent to a carrier.
        </div>
      )}
    </div>
  );
}

export function PrepareMarketPackButton() {
  const [prepared, setPrepared] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setPrepared(true)}
      className={prepared
        ? "inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-800"
        : "inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"}
    >
      {prepared ? <Check className="size-4" /> : <Share2 className="size-4" />}
      {prepared ? "Demo pack prepared" : "Prepare read-only market pack"}
    </button>
  );
}
