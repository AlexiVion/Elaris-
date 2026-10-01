import { MessageSquareText, Paperclip, UserRound } from "lucide-react";
import { getHorizontalPlatformData } from "@/lib/db/platform";
import { MarketQuestionResponse, RequestClientInfoButton } from "@/components/platform/PlacementDemoControls";
import { Panel, ProductPageHeader, PrototypeNotice, StatusPill } from "@/components/platform/PrototypeUI";

export default async function PlacementQuestionsPage() {
  const data = await getHorizontalPlatformData();
  const d = data.deployment;
  const evidence = d.evidence[0];

  const questions = [
    {
      market: "Atlas Specialty · fictional",
      question: "How is restricted-zone entry handled when the robot operates near personnel?",
      owner: "Broker technical desk",
      status: "DRAFT RESPONSE",
      linked: evidence ? evidence.code + " · " + evidence.title : d.baselineCode,
    },
    {
      market: "Meridian Risk · fictional",
      question: "Which exact hand/end-effector and control-stack versions are deployed at Northgas?",
      owner: "Shared Elaris record",
      status: "ANSWERABLE",
      linked: d.baselineCode + " · " + d.snapshotCode,
    },
    {
      market: "Atlas Specialty · fictional",
      question: "Has the system changed since the original technical submission?",
      owner: "Broker technical desk",
      status: "OPEN",
      linked: d.latestChange?.code ?? "No material change",
    },
  ];

  return (
    <>
      <ProductPageHeader
        eyebrow="SUB-0042 · market Q&A"
        title="Market Questions"
        description="Structure carrier questions around the same deployment facts and evidence so the broker can answer without rebuilding the technical story from email."
        aside={<StatusPill value="4 OPEN" />}
      />

      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <Panel title="Question queue" description="Fictional carrier questions for product discovery.">
          <div className="space-y-3">
            {questions.map((item, index) => (
              <div key={item.question} className={index === 0 ? "rounded-xl border border-violet-300 bg-violet-50 p-4" : "rounded-xl border border-slate-200 p-4"}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">{item.market}</div>
                    <div className="mt-2 text-sm font-semibold leading-6 text-slate-900">{item.question}</div>
                  </div>
                  <StatusPill value={item.status} />
                </div>
                <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1"><UserRound className="size-3.5" /> {item.owner}</span>
                  <span className="inline-flex items-center gap-1"><Paperclip className="size-3.5" /> {item.linked}</span>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel
          title="Atlas Specialty · restricted-zone question"
          description="Draft response using existing deployment/evidence references. Broker remains responsible for review and sending."
        >
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-start gap-3">
              <MessageSquareText className="mt-0.5 size-5 text-violet-600" />
              <div>
                <div className="text-sm font-semibold">Carrier question</div>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  How is restricted-zone entry handled when the robot operates near personnel?
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Reference label="Deployment" value={d.code + " · " + d.name} />
            <Reference label="Baseline" value={d.baselineCode + " · " + d.snapshotCode} />
            <Reference label="Human exposure" value={d.humanExposure.replaceAll("_", " ")} />
            <Reference label="Evidence reference" value={evidence ? evidence.code + " · " + evidence.title : "Review required"} />
          </div>

          <div className="mt-5">
            <MarketQuestionResponse />
          </div>
        </Panel>
      </div>

      <div className="mt-5">
        <Panel title="Client follow-up" description="Use the gap explicitly when the answer is not already supported by the shared record.">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold">Do not guess missing technical facts</div>
              <div className="mt-1 text-xs leading-5 text-slate-500">
                If the shared record cannot support a response, route a precise information request back to the client.
              </div>
            </div>
            <RequestClientInfoButton label="Draft client follow-up" />
          </div>
        </Panel>
      </div>

      <div className="mt-5">
        <PrototypeNotice>
          Carrier names and questions are synthetic. Elaris does not advise the broker how to place risk; this prototype tests whether structured technical Q&A reduces repeated client/carrier back-and-forth.
        </PrototypeNotice>
      </div>
    </>
  );
}

function Reference({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</div>
      <div className="mt-1 text-sm font-semibold text-slate-900">{value}</div>
    </div>
  );
}
