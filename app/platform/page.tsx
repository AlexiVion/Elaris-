import Link from "next/link";
import {
  ArrowRight,
  Building2,
  BriefcaseBusiness,
  HardHat,
  FileCheck2,
  Network,
  ShieldCheck,
  Siren,
} from "lucide-react";
import { PLATFORM_PRODUCTS } from "@/lib/platform/products";
import { getHorizontalPlatformData } from "@/lib/db/platform";

const icons = {
  "deployment-control": Network,
  "operational-readiness": Building2,
  "safety-change-control": HardHat,
  "evidence-review": FileCheck2,
  "broker-workspace": BriefcaseBusiness,
  "underwriting-workspace": ShieldCheck,
  "incident-reconstruction": Siren,
};

export default async function PlatformHomePage() {
  const data = await getHorizontalPlatformData();

  return (
    <>
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 px-6 py-8 text-white md:px-10 md:py-10">
        <div className="max-w-3xl">
          <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-blue-300">Elaris horizontal v0</div>
          <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">
            Una infraestructura compartida. Productos diferentes para cada actor.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
            La misma verdad sobre robot, configuración, deployment, evidencia, decisiones, cambios e incidentes
            se presenta de forma distinta según quién necesita tomar la decisión.
          </p>
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <Metric label="Active deployments" value={data.portfolio.activeDeployments} />
          <Metric label="Active robots" value={data.portfolio.activeRobots} />
          <Metric label="Open change reviews" value={data.portfolio.openChanges} />
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Actor products</div>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">Choose the decision view</h2>
          </div>
          <div className="text-sm text-slate-500">All prototypes reuse the current Elaris data model.</div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {PLATFORM_PRODUCTS.map((product) => {
            const Icon = icons[product.slug as keyof typeof icons] ?? Network;
            const href = product.slug === "deployment-control" ? "/platform/deployment-control" : `/platform/${product.slug}`;
            return (
              <Link
                key={product.slug}
                href={href}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-slate-100 text-slate-800">
                    <Icon className="size-5" />
                  </span>
                  <Status status={product.status} />
                </div>
                <div className="mt-5 text-xs font-medium text-slate-500">{product.actor}</div>
                <h3 className="mt-1 text-lg font-semibold">{product.name}</h3>
                <p className="mt-2 min-h-12 text-sm leading-5 text-slate-600">{product.description}</p>
                <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-slate-900">
                  {product.status === "LIVE" ? "Open product" : "Open prototype"}
                  <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Shared substrate</div>
        <div className="mt-4 flex flex-wrap gap-2">
          {["Organization", "Robot", "Configuration", "Deployment", "Evidence", "Requirement", "Approval", "Change", "Incident", "Audit"].map((item) => (
            <span key={item} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium">
              {item}
            </span>
          ))}
        </div>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">
          Esta capa no reemplaza las aplicaciones por actor. Les da una verdad compartida que cada producto puede
          consultar con permisos, workflow y navegación propios.
        </p>
      </section>
    </>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <div className="text-2xl font-semibold tabular-nums">{value}</div>
      <div className="mt-1 text-xs text-slate-400">{label}</div>
    </div>
  );
}

function Status({ status }: { status: "LIVE" | "PROTOTYPE" }) {
  return (
    <span className={status === "LIVE"
      ? "rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-800"
      : "rounded-full bg-blue-100 px-2.5 py-1 text-[11px] font-semibold text-blue-800"}>
      {status}
    </span>
  );
}
