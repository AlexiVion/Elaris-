"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  ClipboardCheck,
  FileSearch2,
  Home,
  ListChecks,
  ShieldCheck,
  Siren,
  TriangleAlert,
} from "lucide-react";
import type { ReactNode } from "react";

type NavIcon = "home" | "records" | "review" | "decision" | "evidence" | "incident" | "alert";

type NavItem = {
  label: string;
  href: string;
  icon: NavIcon;
};

const iconMap = {
  home: Home,
  records: ListChecks,
  review: ClipboardCheck,
  decision: ShieldCheck,
  evidence: FileSearch2,
  incident: Siren,
  alert: TriangleAlert,
};

export function ActorProductShell({
  product,
  actor,
  children,
  nav,
  accent = "blue",
}: {
  product: string;
  actor: string;
  children: ReactNode;
  nav: NavItem[];
  accent?: "blue" | "amber" | "violet" | "rose";
}) {
  const pathname = usePathname();

  const accentClass = {
    blue: "bg-blue-600",
    amber: "bg-amber-500",
    violet: "bg-violet-600",
    rose: "bg-rose-600",
  }[accent];

  return (
    <div className="-mx-5 -my-8 min-h-[calc(100vh-73px)] md:-mx-8 md:-my-10">
      <div className="grid min-h-[calc(100vh-73px)] lg:grid-cols-[250px_minmax(0,1fr)]">
        <aside className="border-r border-slate-200 bg-white p-4 lg:p-5">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-900">
            <ArrowLeft className="size-3.5" />
            All products
          </Link>

          <div className="mt-6 flex items-start gap-3">
            <span className={`mt-1 block size-2.5 rounded-full ${accentClass}`} />
            <div>
              <div className="font-semibold leading-tight">{product}</div>
              <div className="mt-1 text-xs leading-4 text-slate-500">{actor}</div>
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-900">
            Prototype hypothesis · validate in field
          </div>

          <nav className="mt-6 space-y-1">
            {nav.map((item) => {
              const Icon = iconMap[item.icon];
              const active = pathname === item.href || (item.href !== nav[0]?.href && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={active
                    ? "flex items-center gap-2.5 rounded-lg bg-slate-950 px-3 py-2.5 text-sm font-medium text-white"
                    : "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950"}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 border-t border-slate-200 pt-4 text-xs leading-5 text-slate-500">
            Reads the same Elaris shared substrate as Deployment Control. Actor-specific objects shown here may be presentation-only.
          </div>
        </aside>

        <div className="min-w-0 bg-[#f7f8fb] p-5 md:p-7 lg:p-8">{children}</div>
      </div>
    </div>
  );
}
