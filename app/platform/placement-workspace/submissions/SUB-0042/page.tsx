import Link from "next/link";
import { ExternalLink, FileCheck2, FileQuestion, ShieldCheck } from "lucide-react";
import { getHorizontalPlatformData } from "@/lib/db/platform";
import { RequestClientInfoButton } from "@/components/platform/PlacementDemoControls";
import { DefinitionList, Panel, ProductPageHeader, PrototypeNotice, StatusPill } from "@/components/platform/PrototypeUI";

export default async function PlacementSubmissionPage() {
  const data = await getHorizontalPlatformData();
  const d = data.deployment;
  const missing = [...d.evidence, ...d.requirements].filter((item) => item.status === "MISSING");

  return (
    <>
      <ProductPageHeader
        eyebrow="SUB-0042 · submission v2 · illustrative broker workflow"
        title="Humandroid Robotics Programme"
        description="A reusable technical submission assembled from shared deployment truth, with explicit information gaps instead of a reconstructed document pack."
        aside={<StatusPill value="QUESTIONS OPEN" />}
      />

      <div className="grid gap-5 xl:grid-cols-[0.78fr_1.22fr]">
        <Panel title="Submission context">
          <DefinitionList
            items={[
              { label: "Insured", value: "Humandroid · illustrative scenario" },
              { label: "Broker", value: "Vector Specialty Brokerage · fictional" },
              { label: "Coverage context", value: "Robotics / technology liability · illustrative only" },
              { label: "Submission version", value: "v2 · 01 Oct 2026" },
              { label: "Markets", value: "2 reviewing · fictional" },
              { label: "Status", value: "Questions open" },
            ]}
          />
          <div className="mt-5">
            <RequestClientInfoButton />
          </div>
        </Panel>

        <Panel title="Selected deployment" description="Real shared Elaris demo data reused inside a fictional submission wrapper.">
          <DefinitionList
            items={[
              { label: "Deployment", value: d.code + " · " + d.name },
              { label: "Robot", value: d.robot },
              { label: "Customer / site", value: d.customer + " · " + d.site },
              { label: "Task", value: d.task },
              { label: "Operating mode", value: d.operatingMode.replaceAll("_", " ") },
              { label: "Human exposure", value: d.humanExposure.replaceAll("_", " ") },
              { label: "Baseline", value: d.baselineCode + " · " + d.snapshotCode },
              { label: "Configuration hash", value: d.snapshotHash.slice(0, 16) + "…" },
            ]}
          />
          <Link href={"/deployments/" + d.code} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-violet-700 hover:underline">
            Open shared source record <ExternalLink className="size-4" />
          </Link>
        </Panel>
      </div>

      <div className="mt-5">
        <Panel title="Exact deployed configuration" description="The carrier-facing narrative can reference the exact technical state rather than a generic robot model.">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {d.configurationItems.map((item) => (
              <div key={item.slot} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{item.slot.replaceAll("_", " ")}</div>
                <div className="mt-1 text-sm font-semibold text-slate-900">{item.value}</div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <Panel title="Technical evidence pack" description="Existing evidence is reused with source/status rather than copied into a new silo.">
          <div className="space-y-1">
            {d.evidence.slice(0, 7).map((item) => (
              <div key={item.code} className="grid gap-3 border-b border-slate-100 py-3 last:border-0 md:grid-cols-[1fr_110px] md:items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <FileCheck2 className="size-4 text-emerald-600" />
                    <span className="text-sm font-semibold">{item.code} · {item.title}</span>
                  </div>
                  <div className="mt-1 text-xs text-slate-500">{item.source} · owner {item.owner}</div>
                </div>
                <StatusPill value={item.status} />
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Missing information" description="Broker work queue: request only what is missing from the reusable technical record.">
          <div className="space-y-3">
            {(missing.length ? missing : d.requirements.slice(0, 2)).map((item) => (
              <div key={item.code} className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-start gap-2">
                  <FileQuestion className="mt-0.5 size-4 text-amber-700" />
                  <div>
                    <div className="text-sm font-semibold text-amber-950">{item.code} · {item.title}</div>
                    <div className="mt-1 text-xs leading-5 text-amber-900/75">{item.readinessCategory.replaceAll("_", " ")} · owner {item.owner}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <RequestClientInfoButton label="Draft request for missing items" />
          </div>
        </Panel>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <Boundary icon={<ShieldCheck className="size-4" />} title="Versioned" text="The submission can point to the reviewed baseline/configuration." />
        <Boundary icon={<FileCheck2 className="size-4" />} title="Reusable" text="Evidence stays linked to its source and owner." />
        <Boundary icon={<FileQuestion className="size-4" />} title="Gap-aware" text="Missing information remains explicit instead of hidden in email threads." />
      </div>

      <div className="mt-5">
        <PrototypeNotice>
          SUB-0042, the broker, markets and coverage context are fictional. This screen tests whether brokers would reuse Elaris deployment/evidence data inside a real placement workflow.
        </PrototypeNotice>
      </div>
    </>
  );
}

function Boundary({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-semibold">{icon}{title}</div>
      <p className="mt-2 text-xs leading-5 text-slate-500">{text}</p>
    </div>
  );
}
