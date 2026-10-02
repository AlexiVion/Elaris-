"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Bell,
  Bot,
  ClipboardCheck,
  FileQuestion,
  FileText,
  Grid3X3,
  Hexagon,
  Home,
  MessageSquareText,
  RefreshCcw,
  Search,
  Send,
  Users,
  Wrench,
} from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type NavIcon =
  | "home"
  | "clients"
  | "submissions"
  | "requests"
  | "questions"
  | "renewals"
  | "reports"
  | "robots"
  | "attention"
  | "service"
  | "return";

const iconMap = {
  home: Home,
  clients: Users,
  submissions: Send,
  requests: FileQuestion,
  questions: MessageSquareText,
  renewals: RefreshCcw,
  reports: FileText,
  robots: Bot,
  attention: Activity,
  service: Wrench,
  return: ClipboardCheck,
};

export function FullDemoProductShell({
  product,
  subtitle,
  organization,
  persona,
  attentionCount,
  nav,
  demoDataNotice,
  children,
}: {
  product: string;
  subtitle: string;
  organization: string;
  persona: string;
  attentionCount: number;
  nav: Array<{ href: string; label: string; icon: NavIcon; exact?: boolean }>;
  demoDataNotice?: string;
  children: ReactNode;
}) {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground md:flex" aria-label={product + " navigation"} title={subtitle}>
        <div className="flex items-center gap-3 px-6 py-6">
          <Hexagon className="size-8 text-primary" strokeWidth={1.5} />
          <div className="min-w-0">
            <div className="text-lg font-semibold leading-tight text-white">Elaris</div>
            <div className="truncate text-xs text-sidebar-muted">{product}</div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {nav.map((item) => {
            const Icon = iconMap[item.icon];
            const active = isActive(item.href, item.exact);
            return (
              <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={cn("flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors", active ? "bg-white/10 font-medium text-white" : "text-sidebar-foreground/80 hover:bg-white/5 hover:text-white")}>
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center gap-4 border-b border-border bg-card px-4 md:px-6">
          <div className="relative hidden max-w-xl flex-1 sm:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input type="search" placeholder={"Search " + product} aria-label={"Search " + product} className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </div>

          <div className="ml-auto flex items-center gap-3">
            <Link href="/" className="hidden items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium hover:bg-muted md:flex">
              <Grid3X3 className="size-4 text-muted-foreground" />
              Platform
            </Link>
            <div className="hidden items-center rounded-md border border-border px-3 py-1.5 text-sm font-medium lg:flex">{organization}</div>
            <button type="button" className="relative rounded-md p-2 hover:bg-muted" aria-label={"Attention required: " + attentionCount}>
              <Bell className="size-5 text-muted-foreground" />
              {attentionCount > 0 && <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold text-destructive-foreground">{attentionCount}</span>}
            </button>
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{persona.split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase()}</span>
              <div className="hidden text-sm md:block"><div className="font-medium leading-tight">{persona}</div><div className="text-xs text-muted-foreground">Demo persona</div></div>
            </div>
          </div>
        </header>

        <div className="border-b border-amber-200 bg-amber-50 px-4 py-1.5 text-center text-xs font-medium text-amber-800 md:px-6">
          {demoDataNotice ?? "Demo data — insurance workflow objects and organizations are fictional. Shared deployment/configuration data comes from the Elaris demo substrate."}
        </div>

        <main className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
