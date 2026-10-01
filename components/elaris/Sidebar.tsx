"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Bot,
  Layers,
  FileText,
  CheckSquare,
  GitBranch,
  AlertTriangle,
  BarChart3,
  Sparkles,
  Hexagon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { copy } from "@/lib/copy/en";

export function Sidebar({ basePath = "" }: { basePath?: string }) {
  const pathname = usePathname();
  const path = (value: string) => value === "/" ? (basePath || "/") : basePath + value;

  const nav = [
    { href: path("/"), label: copy.nav.home, icon: Home, exact: true },
    { href: path("/robots"), label: copy.nav.robots, icon: Bot },
    { href: path("/deployments"), label: copy.nav.deployments, icon: Layers },
    { href: path("/evidence"), label: copy.nav.evidence, icon: FileText },
    { href: path("/requirements"), label: copy.nav.requirements, icon: CheckSquare },
    { href: path("/changes"), label: copy.nav.changes, icon: GitBranch },
    { href: path("/incidents"), label: copy.nav.incidents, icon: AlertTriangle },
    { href: path("/reports"), label: copy.nav.reports, icon: BarChart3 },
  ];

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  return (
    <aside className="hidden w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground md:flex" aria-label="Main navigation">
      <div className="flex items-center gap-3 px-6 py-6">
        <Hexagon className="size-8 text-primary" strokeWidth={1.5} />
        <div>
          <div className="text-lg font-semibold leading-tight text-white">{copy.brand.name}</div>
          <div className="text-xs text-sidebar-muted">{copy.brand.subtitle}</div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {nav.map((item) => {
          const active = isActive(item.href, item.exact);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-white/10 font-medium text-white"
                  : "text-sidebar-foreground/80 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}

        <div aria-disabled="true" className="flex items-center justify-between rounded-md px-3 py-2 text-sm text-sidebar-foreground/40" title={copy.nav.assistantComingSoon}>
          <span className="flex items-center gap-3"><Sparkles className="size-4" />{copy.nav.assistant}</span>
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wide">{copy.nav.assistantComingSoon}</span>
        </div>
      </nav>
    </aside>
  );
}
