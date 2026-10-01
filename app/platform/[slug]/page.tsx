import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, CircleAlert, ExternalLink, Layers3 } from "lucide-react";
import { getPlatformProduct } from "@/lib/platform/products";
import { getHorizontalPlatformData } from "@/lib/db/platform";

export default async function PlatformProductPage({ params }: { params: { slug: string } }) {
  const product = getPlatformProduct(params.slug);
  if (!product) notFound();

  const data = await getHorizontalPlatformData();
  const d = data.deployment;

  if (product.slug === "deployment-control") {
    return (
      <>
        <Back />
        <div className="rounded-3xl border border-slate-200 bg-white p-7 md:p-10">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="max-w-3xl">
              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">LIVE · REFERENCE PRODUCT</span>
              <div className="mt-4 text-sm font-medium text-slate-500">{product.actor}</div>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight md:text-4xl">{product.name}</h1>
              <p className="mt-4 text-base leading-7 text-slate-600">{product.description}</p>
            </div>
            <Link href="/" className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">
              Open live product
              <ExternalLink className="size-4" />
            </Link>
          </div>

          <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <div className="font-semibold text-emerald-950">Frozen reference boundary</div>
            <p className="mt-1 text-sm leading-6 text-emerald-900/80">
              Esta implementación representa el primer producto para el arquetipo Integrator / Deployer.
              El trabajo horizontal no modifica sus workflows para acomodar otros actores.
            </p>
          </div>

          <SharedDeployment data={d} />
        </div>
      </>
    );
  }

  const actorQueue = buildActorQueue(product.slug, data);

  return (
    <>
      <Back />

      <div className="flex flex-wrap items-start justify-between gap-5">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-800">PROTOTYPE</span>
            <span className="text-sm text-slate-500">{product.actor}</span>
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">{product.name}</h1>
          <p className="mt-3 text-base leading-7 text-slate-600">{product.description}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Decision lens</div>
          <div className="mt-3 text-xl font-semibold leading-8">“{product.primaryQuestion}”</div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {actorQueue.map((item) => (
              <div key={item.label} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold">{item.label}</div>
                  <span className={item.attention
                    ? "rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800"
                    : "rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800"}>
                    {item.value}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-500">{item.note}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-slate-950 p-6 text-white">
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Actor workflow v0</div>
          <ol className="mt-5 space-y-4">
            {product.workflow.map((step, index) => (
              <li key={step} className="flex items-center gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 text-xs font-semibold">
                  {index + 1}
                </span>
                <span className="text-sm font-medium">{step}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <SharedDeployment data={d} />

      <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-6">
        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Shared objects reused</div>
        <div className="mt-4 flex flex-wrap gap-2">
          {product.sharedObjects.map((item) => (
            <span key={item} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium">
              {item}
            </span>
          ))}
        </div>
        <div className="mt-5 flex items-start gap-3 rounded-xl bg-blue-50 p-4 text-sm text-blue-950">
          <CircleAlert className="mt-0.5 size-4 shrink-0" />
          <p>
            Esta vista es una hipótesis de producto por arquetipo. Reutiliza datos reales del demo, pero no agrega
            nuevos claims, decisiones automáticas ni workflows no validados.
          </p>
        </div>
      </section>
    </>
  );
}

function Back() {
  return (
    <Link href="/platform" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950">
      <ArrowLeft className="size-4" />
      Back to products
    </Link>
  );
}

function SharedDeployment({ data }: { data: Awaited<ReturnType<typeof getHorizontalPlatformData>>["deployment"] }) {
  return (
    <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Same shared deployment</div>
          <h2 className="mt-1 text-xl font-semibold">{data.name}</h2>
          <div className="mt-1 text-sm text-slate-500">{data.code} · {data.robot}</div>
        </div>
        <Link href={`/deployments/${data.code}`} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 hover:underline">
          Open source record
          <ArrowRight className="size-4" />
        </Link>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Datum label="Customer / site" value={`${data.customer} · ${data.site}`} />
        <Datum label="Task" value={data.task} />
        <Datum label="Baseline" value={`${data.baselineCode} · ${data.snapshotCode}`} />
        <Datum label="Mode / exposure" value={`${data.operatingMode} · ${data.humanExposure}`} />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Signal label="Evidence" value={data.evidenceCount} attention={data.missingCount > 0 || data.reviewCount > 0} />
        <Signal label="Requirements" value={data.requirementCount} attention={false} />
        <Signal label="Pending approvals" value={data.pendingApprovalCount} attention={data.pendingApprovalCount > 0} />
      </div>

      {data.latestChange && (
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <Layers3 className="mt-0.5 size-4 shrink-0 text-slate-500" />
          <div>
            <div className="text-sm font-semibold">Latest material change: {data.latestChange.code}</div>
            <div className="mt-1 text-xs text-slate-500">
              {data.latestChange.openImpactItems} open impact items · status {data.latestChange.status}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function Datum({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
  );
}

function Signal({ label, value, attention }: { label: string; value: number; attention: boolean }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-4">
      {attention ? <CircleAlert className="size-5 text-amber-600" /> : <CheckCircle2 className="size-5 text-emerald-600" />}
      <div>
        <div className="text-lg font-semibold tabular-nums">{value}</div>
        <div className="text-xs text-slate-500">{label}</div>
      </div>
    </div>
  );
}

function buildActorQueue(
  slug: string,
  data: Awaited<ReturnType<typeof getHorizontalPlatformData>>
): Array<{ label: string; value: string | number; note: string; attention: boolean }> {
  const p = data.portfolio;
  const d = data.deployment;

  switch (slug) {
    case "operational-readiness":
      return [
        { label: "Deployments live", value: p.activeDeployments, note: "Systems currently operating in the shared record.", attention: false },
        { label: "Missing evidence", value: p.missingEvidence, note: "Required information still missing across the demo portfolio.", attention: p.missingEvidence > 0 },
        { label: "Pending approvals", value: d.pendingApprovalCount, note: "Human acceptance/approval work still open for the selected deployment.", attention: d.pendingApprovalCount > 0 },
        { label: "Material changes", value: p.openChanges, note: "Configuration changes requiring review before acceptance stays current.", attention: p.openChanges > 0 },
      ];
    case "safety-change-control":
      return [
        { label: "Changes to review", value: p.openChanges, note: "Changes whose impact is still under human review.", attention: p.openChanges > 0 },
        { label: "Evidence to review", value: p.reviewEvidence, note: "Evidence currently marked review required.", attention: p.reviewEvidence > 0 },
        { label: "Named approvals open", value: d.pendingApprovalCount, note: "Approvals remain owned by the named decision maker.", attention: d.pendingApprovalCount > 0 },
        { label: "Open incidents", value: p.openIncidents, note: "Operational events that may inform the safety review.", attention: p.openIncidents > 0 },
      ];
    case "broker-workspace":
      return [
        { label: "Submission deployment", value: d.code, note: "One shared deployment becomes the core of the reusable submission.", attention: false },
        { label: "Evidence available", value: d.evidenceCount, note: "Existing evidence can be reused instead of recollected manually.", attention: false },
        { label: "Information gaps", value: d.missingCount, note: "Missing required items to resolve before external sharing.", attention: d.missingCount > 0 },
        { label: "Change alerts", value: p.openChanges, note: "Material system changes that may affect an existing submission.", attention: p.openChanges > 0 },
      ];
    case "underwriting-workspace":
      return [
        { label: "Systems in operation", value: p.activeDeployments, note: "Current deployed exposure represented by shared deployment records.", attention: false },
        { label: "Evidence gaps", value: p.missingEvidence, note: "Information gaps visible without reconstructing the submission.", attention: p.missingEvidence > 0 },
        { label: "Changes since review", value: p.openChanges, note: "Material configuration changes that may deserve underwriting review.", attention: p.openChanges > 0 },
        { label: "Incidents open", value: p.openIncidents, note: "Operational events visible in the same substrate.", attention: p.openIncidents > 0 },
      ];
    case "incident-reconstruction":
      return [
        { label: "Open incidents", value: p.openIncidents, note: "Incidents awaiting investigation or closure.", attention: p.openIncidents > 0 },
        { label: "Incident baseline", value: d.latestIncident?.baselineIdAtTime ? "Linked" : "Unknown", note: "Whether the deployed baseline can be reconstructed at incident time.", attention: !d.latestIncident?.baselineIdAtTime },
        { label: "Incident snapshot", value: d.latestIncident?.snapshotIdAtTime ? "Linked" : "Unknown", note: "Configuration snapshot captured in the incident record.", attention: !d.latestIncident?.snapshotIdAtTime },
        { label: "Prior material change", value: d.latestChange?.code ?? "—", note: "Recent configuration change available for chronology review.", attention: Boolean(d.latestChange) },
      ];
    default:
      return [
        { label: "Active deployments", value: p.activeDeployments, note: "Shared deployment truth.", attention: false },
        { label: "Active robots", value: p.activeRobots, note: "Physical assets represented in the same core.", attention: false },
        { label: "Open changes", value: p.openChanges, note: "Pending change review.", attention: p.openChanges > 0 },
        { label: "Open incidents", value: p.openIncidents, note: "Operational events.", attention: p.openIncidents > 0 },
      ];
  }
}
