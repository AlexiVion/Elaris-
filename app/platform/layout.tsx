import Link from "next/link";
import { Hexagon, Layers3 } from "lucide-react";

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f6f7fb] text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-5 py-4 md:px-8">
          <Link href="/platform" className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-slate-950 text-white">
              <Hexagon className="size-5" strokeWidth={1.6} />
            </span>
            <div>
              <div className="font-semibold tracking-tight">Elaris Platform</div>
              <div className="text-xs text-slate-500">Shared infrastructure · actor-specific products</div>
            </div>
          </Link>

          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/platform"
              className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 sm:block"
            >
              Products
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50"
            >
              <Layers3 className="size-4" />
              Deployment Control
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-10">{children}</main>
    </div>
  );
}
