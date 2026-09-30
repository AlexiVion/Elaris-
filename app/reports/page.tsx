import Link from "next/link";
import { FileText, Bot, Layers, GitBranch, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/elaris/PageHeader";
import { SectionCard } from "@/components/elaris/SectionCard";
import { copy } from "@/lib/copy/en";
import { prisma } from "@/lib/db/prisma";

export default async function ReportsPage() {
  const [deployments, robots, changes] = await Promise.all([
    prisma.deployment.findMany({ select: { code: true, name: true }, orderBy: { code: "asc" } }),
    prisma.robot.findMany({ select: { code: true, model: true }, orderBy: { code: "asc" } }),
    prisma.change.findMany({ select: { code: true, status: true, deployment: { select: { name: true } } }, orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <>
      <PageHeader title={copy.nav.reports} />
      <p className="mb-6 max-w-2xl text-sm text-muted-foreground">
        Printable A4 reports with JSON export and read-only Share links. Elaris does not certify or approve.
      </p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <SectionCard title="Deployment Readiness Pack" icon={Layers}>
          <ul className="divide-y divide-border">
            {deployments.map((d) => (
              <Row key={d.code} href={`/reports/readiness/${d.code}`} title={d.name} sub={d.code} />
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="System Passport" icon={Bot}>
          <ul className="divide-y divide-border">
            {robots.map((r) => (
              <Row key={r.code} href={`/reports/passport/${encodeURIComponent(r.code)}`} title={r.code} sub={r.model} />
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="Change Impact Report" icon={GitBranch}>
          <ul className="divide-y divide-border">
            {changes.map((c) => (
              <Row key={c.code} href={`/reports/impact/${c.code}`} title={c.code} sub={c.deployment.name} />
            ))}
          </ul>
        </SectionCard>
      </div>
    </>
  );
}

function Row({ href, title, sub }: { href: string; title: string; sub: string }) {
  return (
    <li>
      <Link href={href} className="flex items-center gap-2 py-2.5 hover:opacity-80">
        <FileText className="size-4 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium">{title}</div>
          <div className="truncate text-xs text-muted-foreground">{sub}</div>
        </div>
        <ArrowRight className="size-4 text-muted-foreground" />
      </Link>
    </li>
  );
}
