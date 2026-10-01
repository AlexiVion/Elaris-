import { FileCheck2, FileQuestion, Image as ImageIcon, MessageSquareText, ScrollText } from "lucide-react";
import { getHorizontalPlatformData } from "@/lib/db/platform";
import { Panel, ProductPageHeader, PrototypeNotice, StatusPill } from "@/components/platform/PrototypeUI";

export default async function IncidentEvidenceRoomPage() {
  const data = await getHorizontalPlatformData();
  const incident = data.incidents.find((item) => item.code === "INC-2026-001");
  const d = data.deployment;

  if (!incident) return null;

  return (
    <>
      <ProductPageHeader
        eyebrow="Incident evidence"
        title="Evidence Room · INC-2026-001"
        description="A place to preserve and organize the evidence used to reconstruct an incident without mixing facts with hypotheses."
        aside={<StatusPill value="INVESTIGATING" />}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <EvidenceCard icon={<ScrollText className="size-5" />} title="Incident timeline" status="AVAILABLE" text={`${incident.timeline.length} persisted events`} />
        <EvidenceCard icon={<FileCheck2 className="size-5" />} title="Baseline / configuration" status="AVAILABLE" text={`${incident.baselineCode} · ${incident.snapshotCode}`} />
        <EvidenceCard icon={<FileCheck2 className="size-5" />} title="Safety evidence" status="AVAILABLE" text={`${d.evidence.filter((item) => item.readinessCategory === "SAFETY_EVIDENCE").length} shared evidence items`} />
        <EvidenceCard icon={<FileQuestion className="size-5" />} title="Robot log bundle" status="MISSING" text="No event/log bundle captured in current MVP" />
        <EvidenceCard icon={<ImageIcon className="size-5" />} title="Photos / video" status="MISSING" text="No media linked to incident" />
        <EvidenceCard icon={<MessageSquareText className="size-5" />} title="Witness / operator statements" status="MISSING" text="No statements captured" />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <Panel title="Shared safety evidence">
          {d.evidence.filter((item) => item.readinessCategory === "SAFETY_EVIDENCE").map((item) => (
            <div key={item.code} className="flex items-center justify-between gap-3 border-b border-slate-100 py-3 last:border-0">
              <div><div className="text-sm font-semibold">{item.code} · {item.title}</div><div className="mt-1 text-xs text-slate-500">{item.source} · owner {item.owner}</div></div>
              <StatusPill value={item.status} />
            </div>
          ))}
        </Panel>

        <Panel title="Evidence preservation gaps" description="This is where a real claims/forensics interview should tell us what is missing.">
          <ul className="space-y-3 text-sm leading-6 text-slate-600">
            <li>• No event-recorder / ROS log bundle is linked.</li>
            <li>• No photo/video or site-camera reference is modeled.</li>
            <li>• No statement / interview record is modeled.</li>
            <li>• No damage, repair cost, claim or loss-outcome object exists.</li>
            <li>• No chain-of-custody workflow exists beyond Elaris audit/provenance.</li>
          </ul>
        </Panel>
      </div>

      <div className="mt-5"><PrototypeNotice>Missing cards are deliberate discovery prompts, not claims that these artifacts should always exist.</PrototypeNotice></div>
    </>
  );
}

function EvidenceCard({ icon, title, status, text }: { icon: React.ReactNode; title: string; status: string; text: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">{icon}</span>
        <StatusPill value={status} />
      </div>
      <div className="mt-4 font-semibold">{title}</div>
      <div className="mt-1 text-xs leading-5 text-slate-500">{text}</div>
    </div>
  );
}
