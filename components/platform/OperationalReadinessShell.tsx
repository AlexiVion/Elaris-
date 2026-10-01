"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  Boxes,
  FileOutput,
  GitCompareArrows,
  Inbox,
  LayoutDashboard,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import type { ReactNode } from "react";

const nav = [
  { label: "Overview", href: "/platform/operational-readiness", icon: LayoutDashboard, exact: true },
  { label: "Deployments", href: "/platform/operational-readiness/deployments", icon: Boxes },
  { label: "Review Queue", href: "/platform/operational-readiness/review-queue", icon: Inbox },
  { label: "Acceptance", href: "/platform/operational-readiness/acceptance", icon: ShieldCheck },
  { label: "Changes", href: "/platform/operational-readiness/changes", icon: GitCompareArrows },
  { label: "Reports", href: "/platform/operational-readiness/reports", icon: FileOutput },
];

export function OperationalReadinessShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="-mx-5 -my-8 min-h-[calc(100vh-73px)] md:-mx-8 md:-my-10">
      <div className="grid min-h-[calc(100vh-73px)] lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="border-r border-slate-200 bg-white p-4 lg:p-5">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-950">
            <ArrowLeft className="size-3.5" />
            Elaris Platform
          </Link>

          <div className="mt-6">
            <div className="flex items-start gap-3">
              <span className="mt-1 block size-2.5 rounded-full bg-blue-600" />
              <div>
                <div className="font-semibold leading-tight text-slate-950">Operational Readiness</div>
                <div className="mt-1 text-xs leading-4 text-slate-500">Enterprise Buyer / Operator</div>
              </div>
            </div>
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Workspace</div>
              <div className="mt-1 text-sm font-semibold text-slate-900">Northgas Energy</div>
              <div className="mt-1 text-xs text-slate-500">Buyer demo · deployment acceptance</div>
            </div>
          </div>

          <nav className="mt-6 space-y-1">
            {nav.map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
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

          <div className="mt-8 border-t border-slate-200 pt-4">
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                <UserRound className="size-4" />
              </span>
              <div>
                <div className="text-xs font-semibold text-slate-900">Customer Engineering</div>
                <div className="text-[11px] text-slate-500">Demo user</div>
              </div>
            </div>
            <div className="mt-4 inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-blue-700">
              Demo workspace
            </div>
          </div>
        </aside>

        <div className="min-w-0 bg-[#f7f8fb] p-5 md:p-7 lg:p-8">{children}</div>
      </div>
    </div>
  );
}
