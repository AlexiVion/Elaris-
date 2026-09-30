"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/elaris/Sidebar";
import { Topbar, type ViewerPerson } from "@/components/elaris/Topbar";
import { copy } from "@/lib/copy/en";

/**
 * Renders the app shell (sidebar + topbar + demo banner) around the page —
 * EXCEPT on the public Share View (/share/*), which shows no internal
 * navigation and cannot be edited (spec §7.8).
 */
export function ShellGate({
  persons,
  viewerId,
  attentionCount,
  children,
}: {
  persons: ViewerPerson[];
  viewerId: string;
  attentionCount: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  if (pathname.startsWith("/share")) return <>{children}</>;

  return (
    <div className="flex min-h-screen">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:text-primary-foreground">
        Skip to content
      </a>
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar persons={persons} viewerId={viewerId} attentionCount={attentionCount} />
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-1.5 text-center text-xs font-medium text-amber-800 md:px-6">
          {copy.demoBanner}
        </div>
        <main id="main" className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
