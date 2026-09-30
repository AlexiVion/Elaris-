"use client";

import { Search, Bell } from "lucide-react";
import { copy } from "@/lib/copy/en";
import { roleLabel } from "@/lib/copy/labels";

export interface ViewerPerson {
  id: string;
  name: string;
  role: string;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Topbar({
  persons,
  viewerId,
  attentionCount,
}: {
  persons: ViewerPerson[];
  viewerId: string;
  attentionCount: number;
}) {
  const viewer = persons.find((p) => p.id === viewerId) ?? persons[0];

  function onViewerChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const id = e.target.value;
    // Persona seed selector — no real auth (spec §2). Persisted in a cookie.
    document.cookie = `elaris_viewer=${id}; path=/; max-age=31536000; samesite=lax`;
    window.location.reload();
  }

  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-border bg-card px-4 md:px-6">
      <form action="/search" method="get" role="search" className="relative hidden max-w-xl flex-1 sm:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          name="q"
          placeholder={copy.topbar.searchPlaceholder}
          aria-label={copy.topbar.searchPlaceholder}
          className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </form>

      <div className="ml-auto flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm font-medium md:flex">
          {copy.topbar.organization}
        </div>

        <button
          type="button"
          className="relative rounded-md p-2 hover:bg-muted"
          aria-label={`${copy.topbar.attentionRequired}: ${attentionCount}`}
        >
          <Bell className="size-5 text-muted-foreground" />
          {attentionCount > 0 && (
            <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold text-destructive-foreground">
              {attentionCount}
            </span>
          )}
        </button>

        <div className="flex items-center gap-2">
          <span
            className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary"
            aria-hidden
          >
            {viewer ? initials(viewer.name) : "?"}
          </span>
          <label className="sr-only" htmlFor="viewing-as">
            {copy.topbar.viewingAs}
          </label>
          <select
            id="viewing-as"
            value={viewer?.id}
            onChange={onViewerChange}
            className="h-9 rounded-md border border-input bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            title={copy.topbar.viewingAs}
          >
            {persons.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — {roleLabel[p.role] ?? p.role}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
}
