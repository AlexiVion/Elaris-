"use client";

import { useState } from "react";
import { FileQuestion, MessageSquareText, Send } from "lucide-react";
import { PageHeader } from "@/components/elaris/PageHeader";
import { SectionCard } from "@/components/elaris/SectionCard";
import { StatusPill } from "@/components/elaris/StatusPill";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { placementQuestions } from "@/lib/demo/placement";

export default function MarketQuestionsPage() {
  const [ready, setReady] = useState(false);

  return (
    <>
      <PageHeader title="Market Questions" actions={<Button variant="outline"><FileQuestion className="size-4" /> New demo question</Button>} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <SectionCard title="Question Queue" icon={MessageSquareText}>
          <div className="space-y-2">
            {placementQuestions.map((q, index) => (
              <Card key={q.code} className={index === 0 ? "border-primary/30 bg-primary/[0.03] p-4" : "p-4"}>
                <div className="flex items-start justify-between gap-3">
                  <div><div className="text-xs font-medium text-muted-foreground">{q.market} · {q.code}</div><div className="mt-1 text-sm font-medium leading-6">{q.question}</div><div className="mt-2 text-xs text-muted-foreground">{q.submission} · owner {q.owner}</div></div>
                  <StatusPill label={q.status} tone={q.status === "ANSWERABLE" ? "green" : "amber"} />
                </div>
              </Card>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="MQ-221 · Draft Response" icon={Send}>
          <div className="rounded-md border border-border bg-muted/30 p-4 text-sm leading-6">
            Restricted-zone entry is handled through the deployment safety controls and site operating procedure. The technical response references the reviewed deployment baseline and current safety evidence; broker review is required before external sharing.
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Ref label="Deployment" value="DEP-0017 · Valve Inspection Pilot" />
            <Ref label="Baseline" value="B-0017-01 · C004" />
            <Ref label="Human exposure" value="SHARED AREA" />
            <Ref label="Response owner" value="Broker technical desk" />
          </div>
          <Button className="mt-5" onClick={() => setReady(true)}><Send className="size-4" /> Mark ready for broker review</Button>
          {ready && <div className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">Demo response ready for broker review. Nothing was sent externally.</div>}
        </SectionCard>
      </div>
    </>
  );
}
function Ref({ label, value }: { label: string; value: string }) {
  return <div className="rounded-md border border-border bg-muted/20 p-3"><div className="text-xs text-muted-foreground">{label}</div><div className="mt-1 text-sm font-medium">{value}</div></div>;
}
