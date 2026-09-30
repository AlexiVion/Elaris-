import Link from "next/link";
import { Bot, Layers, FileText, GitBranch } from "lucide-react";
import { PageHeader } from "@/components/elaris/PageHeader";
import { SectionCard } from "@/components/elaris/SectionCard";
import { EnumPill } from "@/components/elaris/EnumPill";
import { robotStatusPill, changeStatusPill, categoryLabel } from "@/lib/copy/labels";
import { search } from "@/lib/db/search";

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = searchParams.q ?? "";
  const results = await search(q);

  return (
    <>
      <PageHeader title={q ? `Search: “${q}”` : "Search"} />
      {!q ? (
        <p className="text-sm text-muted-foreground">Type a robot, deployment, evidence or change code or title in the search bar.</p>
      ) : results.total === 0 ? (
        <p className="text-sm text-muted-foreground">No results for “{q}”.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {results.deployments.length > 0 && (
            <SectionCard title="Deployments" icon={Layers}>
              <ul className="divide-y divide-border">
                {results.deployments.map((d) => (
                  <li key={d.code} className="py-2">
                    <Link href={`/deployments/${d.code}`} className="font-medium text-primary hover:underline">{d.name}</Link>
                    <span className="ml-2 text-xs text-muted-foreground">{d.code} · {d.customer}</span>
                  </li>
                ))}
              </ul>
            </SectionCard>
          )}
          {results.robots.length > 0 && (
            <SectionCard title="Robots" icon={Bot}>
              <ul className="divide-y divide-border">
                {results.robots.map((r) => (
                  <li key={r.code} className="flex items-center justify-between py-2">
                    <Link href={`/robots/${encodeURIComponent(r.code)}`} className="font-medium text-primary hover:underline">{r.code}</Link>
                    <EnumPill value={r.status} map={robotStatusPill} />
                  </li>
                ))}
              </ul>
            </SectionCard>
          )}
          {results.changes.length > 0 && (
            <SectionCard title="Changes" icon={GitBranch}>
              <ul className="divide-y divide-border">
                {results.changes.map((c) => (
                  <li key={c.code} className="flex items-center justify-between py-2">
                    <span><Link href={`/changes/${c.code}`} className="font-medium text-primary hover:underline">{c.code}</Link><span className="ml-2 text-xs text-muted-foreground">{c.deployment} · {c.robot}</span></span>
                    <EnumPill value={c.status} map={changeStatusPill} />
                  </li>
                ))}
              </ul>
            </SectionCard>
          )}
          {results.evidence.length > 0 && (
            <SectionCard title="Evidence & requirements" icon={FileText}>
              <ul className="divide-y divide-border">
                {results.evidence.map((e) => (
                  <li key={e.code} className="py-2">
                    <span className="font-medium">{e.code}</span>
                    <span className="ml-2">{e.title}</span>
                    <span className="ml-2 text-xs text-muted-foreground">{categoryLabel[e.category] ?? e.category} · {e.deployment}</span>
                  </li>
                ))}
              </ul>
            </SectionCard>
          )}
        </div>
      )}
    </>
  );
}
