import Link from "next/link";
import { CheckCircle2, ExternalLink, FileText, LockKeyhole, MessageSquareText } from "lucide-react";
import { getHorizontalPlatformData } from "@/lib/db/platform";
import { PrepareMarketPackButton } from "@/components/platform/PlacementDemoControls";
import { Panel, ProductPageHeader, PrototypeNotice, StatusPill } from "@/components/platform/PrototypeUI";

export default async function PlacementSharePage() {
  const data = await getHorizontalPlatformData();
  const d = data.deployment;

  const sections = [
    ["Insured / submission context", "INCLUDED"],
    ["Selected deployments", "INCLUDED"],
    ["Exact configuration / baseline", "INCLUDED"],
    ["Technical evidence index", "INCLUDED"],
    ["Open information gaps", "INCLUDED"],
    ["Market Q&A", "BROKER REVIEW"],
    ["Pricing / terms recommendation", "NOT PROVIDED"],
  ];

  return (
    <>
      <ProductPageHeader
        eyebrow="SUB-0042 · market-specific read-only output"
        title="Technical Market Pack"
        description="Preview a carrier-facing technical pack assembled from selected shared facts and evidence, with broker-controlled scope and explicit gaps."
        aside={<StatusPill value="DRAFT" />}
      />

      <div className="grid gap-5 xl:grid-cols-[0.82fr_1.18fr]">
        <Panel title="Share scope" description="Fictional Atlas Specialty recipient for demo purposes.">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Recipient</div>
            <div className="mt-1 text-sm font-semibold">Atlas Specialty · fictional market</div>
            <div className="mt-1 text-xs text-slate-500">Read-only technical pack · no policy or binding action</div>
          </div>

          <div className="mt-4 space-y-1">
            {sections.map(([label, status]) => (
              <div key={label} className="flex items-center justify-between gap-4 border-b border-slate-100 py-3 last:border-0">
                <span className="text-sm text-slate-600">{label}</span>
                <StatusPill value={status} />
              </div>
            ))}
          </div>

          <div className="mt-5">
            <PrepareMarketPackButton />
          </div>
        </Panel>

        <Panel title="Pack preview" description="The technical facts below come from the shared Elaris demo record.">
          <div className="rounded-2xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-600">Technical submission pack</div>
              <div className="mt-2 text-xl font-semibold">Humandroid · SUB-0042 · v2</div>
              <div className="mt-1 text-sm text-slate-500">Illustrative broker output · 01 Oct 2026</div>
            </div>
            <div className="grid gap-4 p-5 sm:grid-cols-2">
              <PackDatum label="Deployment" value={d.code + " · " + d.name} />
              <PackDatum label="System" value={d.robot} />
              <PackDatum label="Site / customer" value={d.site + " · " + d.customer} />
              <PackDatum label="Task" value={d.task} />
              <PackDatum label="Baseline" value={d.baselineCode + " · " + d.snapshotCode} />
              <PackDatum label="Evidence available" value={String(d.evidenceCount)} />
            </div>
            <div className="border-t border-slate-100 p-5">
              <div className="grid gap-3 md:grid-cols-3">
                <MiniCard icon={<CheckCircle2 className="size-4" />} title="Versioned state" text="Exact reviewed deployment snapshot." />
                <MiniCard icon={<MessageSquareText className="size-4" />} title="Open questions" text="Broker-controlled Q&A remains visible." />
                <MiniCard icon={<LockKeyhole className="size-4" />} title="Read-only" text="Recipient does not become a decision authority in Elaris." />
              </div>
            </div>
          </div>
        </Panel>
      </div>

      <div className="mt-5">
        <Panel title="Source provenance" description="A broker can always drill back to the internal source record before sending.">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <FileText className="mt-0.5 size-5 text-violet-600" />
              <div>
                <div className="text-sm font-semibold">{d.code} · {d.baselineCode} · {d.snapshotCode}</div>
                <div className="mt-1 text-xs text-slate-500">Shared Elaris deployment truth behind this demo pack.</div>
              </div>
            </div>
            <Link href={"/deployments/" + d.code} className="inline-flex items-center gap-2 text-sm font-semibold text-violet-700 hover:underline">
              Open source record <ExternalLink className="size-4" />
            </Link>
          </div>
        </Panel>
      </div>

      <div className="mt-5">
        <PrototypeNotice>
          This is a demo export concept, not a real carrier submission, quote, policy document or placement action. Broker review remains mandatory before external sharing.
        </PrototypeNotice>
      </div>
    </>
  );
}

function PackDatum({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
  );
}

function MiniCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <div className="flex items-center gap-2 text-xs font-semibold">{icon}{title}</div>
      <div className="mt-1 text-[11px] leading-4 text-slate-500">{text}</div>
    </div>
  );
}
