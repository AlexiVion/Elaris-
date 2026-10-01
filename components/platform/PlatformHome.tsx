import Link from "next/link";
import {
  ArrowRight,
  Building2,
  BriefcaseBusiness,
  FileCheck2,
  HardHat,
  Hexagon,
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
  "placement-workspace": BriefcaseBusiness,
  "broker-workspace": BriefcaseBusiness,
  "underwriting-workspace": ShieldCheck,
  "incident-reconstruction": Siren,
};

export default async function PlatformHome() {
  const data = await getHorizontalPlatformData();

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-slate-950">
      <header className="flex h-16 items-center border-b border-slate-200 bg-white px-6 md:px-8 xl:px-10">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-lg bg-slate-950 text-white">
            <Hexagon className="size-5" strokeWidth={1.6} />
          </span>
          <div>
            <div className="font-semibold leading-tight">Elaris Platform</div>
            <div className="text-xs text-slate-500">Physical AI shared infrastructure</div>
          </div>
        </div>
        <div className="ml-auto rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700">
          Product portfolio
        </div>
      </header>

      <main className="w-full px-6 py-8 md:px-8 md:py-10 xl:px-10">
        <section className="overflow-hidden rounded-2xl bg-slate-950 px-7 py-8 text-white md:px-10 md:py-10">
          <div className="max-w-4xl">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-300">Elaris</div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">
              Shared infrastructure. Purpose-built products for every Physical AI actor.
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-300 md:text-base">
              Start at the platform level, then enter a dedicated product. Each product has its own full-screen
              navigation, workflow and decision experience while reusing the same versioned technical truth.
            </p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <Metric label="Active deployments" value={data.portfolio.activeDeployments} />
            <Metric label="Active robots" value={data.portfolio.activeRobots} />
            <Metric label="Open change reviews" value={data.portfolio.openChanges} />
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-5">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Products</div>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">Choose a product</h2>
            <p className="mt-1 text-sm text-slate-500">
              Opening a product leaves the platform shell and enters that product as a full-screen application.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {PLATFORM_PRODUCTS.map((product) => {
              const Icon = icons[product.slug as keyof typeof icons] ?? Network;
              return (
                <Link
                  key={product.slug}
                  href={"/platform/" + product.slug}
                  className="group flex min-h-56 flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="flex size-11 items-center justify-center rounded-lg bg-slate-100 text-slate-800">
                      <Icon className="size-5" />
                    </span>
                    <Status status={product.status} />
                  </div>
                  <div className="mt-5 text-xs font-medium text-slate-500">{product.actor}</div>
                  <h3 className="mt-1 text-lg font-semibold">{product.name}</h3>
                  <p className="mt-2 flex-1 text-sm leading-5 text-slate-600">{product.description}</p>
                  <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-slate-900">
                    Open product
                    <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6">
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Shared substrate</div>
          <div className="mt-4 flex flex-wrap gap-2">
            {["Organization", "Robot", "Configuration", "Deployment", "Evidence", "Requirement", "Approval", "Change", "Incident", "Audit"].map((item) => (
              <span key={item} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium">
                {item}
              </span>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
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
