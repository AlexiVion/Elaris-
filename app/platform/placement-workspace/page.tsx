import Link from "next/link";
import { ArrowRight, CircleAlert, FileStack, MessageSquareText, RefreshCcw } from "lucide-react";
import { getHorizontalPlatformData } from "@/lib/db/platform";
import { MetricCard, Panel, ProductPageHeader, PrototypeNotice, StatusPill } from "@/components/platform/PrototypeUI";

export default async function PlacementWorkspacePage() {
  const data = await getHorizontalPlatformData();
  const d = data.deployment;

  const pipeline = [
    {
      id: "SUB-0042",
      insured: "Humandroid · illustrative placement",
      subject: "Robotics deployment programme",
      markets: "2 markets reviewing",
      status: "QUESTIONS OPEN",
      next: "Answer technical questions",
      href: "/platform/placement-workspace/submissions/SUB-0042",
    },
    {
      id: "SUB-0039",
      insured: "Atlas Automation · synthetic",
      subject: "Warehouse AMR fleet",
      markets: "Draft",
      status: "COLLECTING INFO",
      next: "Client evidence request",
      href: "#",
    },
    {
      id: "SUB-0035",
      insured: "Nova Handling · synthetic",
      subject: "Manipulator renewal",
      markets: "Renewal",
      status: "RENEWAL DUE",
      next: "Review changes",
      href: "/platform/placement-workspace/renewal",
    },
  ];

  return (
    <>
      <ProductPageHeader
        eyebrow="Vector Specialty Brokerage · robotics desk · fictional workspace"
        title="Placement Workspace"
        description="Build a reusable technical submission from versioned deployment facts, resolve missing information and carrier questions, then carry material changes forward into renewal."
        aside={<span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">DEMO WORKSPACE</span>}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Open submissions" value={3} note="Synthetic placement workflow" />
        <MetricCard label="Client info requests" value={2} tone="attention" note="Technical items awaiting client input" />
        <MetricCard label="Market questions" value={4} tone="attention" note="Across two fictional markets" />
        <MetricCard label="Renewals due" value={1} tone="attention" note="Changes need reconciliation" />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel
          title="Placement pipeline"
          description="Presentation-only broker workflow wrapped around real Elaris deployment truth."
        >
          <div className="space-y-1">
            {pipeline.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="grid gap-3 border-b border-slate-100 py-4 last:border-0 md:grid-cols-[1fr_150px_140px] md:items-center"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-violet-700">{item.id}</span>
                    <span className="text-sm font-semibold text-slate-900">{item.insured}</span>
                  </div>
                  <div className="mt-1 text-xs text-slate-500">{item.subject} · next: {item.next}</div>
                </div>
                <div className="text-xs text-slate-500">{item.markets}</div>
                <StatusPill value={item.status} />
              </Link>
            ))}
          </div>
        </Panel>

        <Panel title="Needs attention" description="What the broker would work on next in the demo scenario.">
          <div className="space-y-4">
            <Attention
              icon={<MessageSquareText className="size-4" />}
              title="Carrier technical question"
              detail="Atlas Specialty asks how restricted-zone entry is controlled."
              href="/platform/placement-workspace/questions"
            />
            <Attention
              icon={<CircleAlert className="size-4" />}
              title={String(d.missingCount) + " shared-data gaps"}
              detail="Required deployment information is still missing from the reusable pack."
              href="/platform/placement-workspace/submissions/SUB-0042"
            />
            <Attention
              icon={<RefreshCcw className="size-4" />}
              title={d.latestChange ? d.latestChange.code + " changed since prior submission" : "No material change"}
              detail="Renewal should explain what changed without rebuilding the full technical narrative."
              href="/platform/placement-workspace/renewal"
            />
          </div>
        </Panel>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1fr_0.9fr]">
        <Panel
          title="SUB-0042 · technical submission snapshot"
          description="The submission wrapper is fictional. The technical deployment underneath is the real shared demo record."
          action={
            <Link href="/platform/placement-workspace/submissions/SUB-0042" className="inline-flex items-center gap-1 text-xs font-semibold text-violet-700 hover:underline">
              Open submission <ArrowRight className="size-3.5" />
            </Link>
          }
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Datum label="Deployment" value={d.code + " · " + d.name} />
            <Datum label="System" value={d.robot} />
            <Datum label="Customer / site" value={d.customer + " · " + d.site} />
            <Datum label="Task" value={d.task} />
            <Datum label="Baseline" value={d.baselineCode + " · " + d.snapshotCode} mono />
            <Datum label="Evidence / requirements" value={d.evidenceCount + " / " + d.requirementCount} />
          </div>
        </Panel>

        <Panel title="What the broker is reusing">
          <div className="space-y-3 text-sm">
            <ReuseRow label="Exact deployed configuration" value={d.configurationItems.length + " versioned slots"} />
            <ReuseRow label="Evidence already available" value={String(d.evidenceCount)} />
            <ReuseRow label="Required items missing" value={String(d.missingCount)} attention />
            <ReuseRow label="Material change open" value={d.latestChange?.code ?? "None"} attention={Boolean(d.latestChange)} />
            <ReuseRow label="Incident context" value={d.latestIncident?.code ?? "None"} attention={Boolean(d.latestIncident)} />
          </div>
          <div className="mt-5">
            <Link href="/platform/placement-workspace/share" className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white">
              <FileStack className="size-4" /> Preview market pack
            </Link>
          </div>
        </Panel>
      </div>

      <div className="mt-5">
        <PrototypeNotice>
          Submission, market, placement status and carrier questions are synthetic discovery objects. Elaris is not providing insurance advice, pricing, placement authority or policy issuance.
        </PrototypeNotice>
      </div>
    </>
  );
}

function Attention({ icon, title, detail, href }: { icon: React.ReactNode; title: string; detail: string; href: string }) {
  return (
    <Link href={href} className="flex items-start gap-3 rounded-xl border border-slate-200 p-3 hover:bg-slate-50">
      <span className="mt-0.5 text-violet-600">{icon}</span>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-slate-900">{title}</div>
        <div className="mt-1 text-xs leading-5 text-slate-500">{detail}</div>
      </div>
      <ArrowRight className="mt-1 size-4 text-slate-400" />
    </Link>
  );
}

function Datum({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</div>
      <div className={"mt-1 text-sm font-semibold text-slate-900 " + (mono ? "font-mono" : "")}>{value}</div>
    </div>
  );
}

function ReuseRow({ label, value, attention = false }: { label: string; value: string; attention?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 last:border-0">
      <span className="text-slate-500">{label}</span>
      <span className={attention ? "font-semibold text-amber-700" : "font-semibold text-slate-900"}>{value}</span>
    </div>
  );
}
