import Link from "next/link";
import { notFound } from "next/navigation";
import { Bot, Box, GitBranch, Layers, FileText, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/elaris/PageHeader";
import { SectionCard } from "@/components/elaris/SectionCard";
import { Card } from "@/components/ui/card";
import { EnumPill } from "@/components/elaris/EnumPill";
import { copy } from "@/lib/copy/en";
import {
  robotStatusPill, evidenceStatusPill, severityPill, incidentStatusPill, changeStatusPill, slotLabel,
} from "@/lib/copy/labels";
import { getRobotDetail } from "@/lib/db/robots";
import { formatDate, formatDateTime } from "@/lib/format";
import { SLOTS } from "@/lib/domain/enums";
import type { DiffEntry } from "@/lib/domain/types";

const SLOT_INDEX = new Map(SLOTS.map((s, i) => [s, i]));

function diffSummary(diff: DiffEntry[]): string {
  if (diff.length === 0) return "Initial snapshot";
  return diff.map((d) => `${slotLabel[d.slot]}: ${d.before ?? "—"} → ${d.after ?? "—"}`).join("; ");
}

export default async function RobotProfilePage({ params }: { params: { code: string } }) {
  const detail = await getRobotDetail(decodeURIComponent(params.code));
  if (!detail) notFound();

  const { robot, deployments, activeSnapshotCode, activeSnapshotItems, history, changes, evidence, incidents } = detail;
  const items = [...activeSnapshotItems].sort((a, b) => (SLOT_INDEX.get(a.slot as never) ?? 99) - (SLOT_INDEX.get(b.slot as never) ?? 99));

  return (
    <>
      <PageHeader
        breadcrumb={<Link href="/robots" className="hover:underline">{copy.nav.robots}</Link>}
        title={robot.code}
        actions={<EnumPill value={robot.status} map={robotStatusPill} />}
      />

      {/* Identity (no battery / online-offline, spec §7.5) */}
      <Card className="mb-6 p-5">
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-4">
          <Field icon={Bot} label="Model" value={robot.model} />
          <Field label="Serial number" value={robot.serialNumber ?? "Not recorded"} mono />
          <Field icon={Box} label="Active snapshot" value={activeSnapshotCode} />
          <Field label="Deployments" value={String(deployments.length)} />
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Active snapshot by slots */}
        <SectionCard title="Active configuration" icon={Box}>
          <table className="w-full text-sm">
            <tbody>
              {items.map((it) => (
                <tr key={it.id} className="border-t border-border first:border-0">
                  <td className="py-2 pr-3 text-muted-foreground">{slotLabel[it.slot] ?? it.slot}</td>
                  <td className="py-2 text-right font-medium">{it.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </SectionCard>

        {/* Deployments */}
        <SectionCard title={copy.nav.deployments} icon={Layers}>
          {deployments.length === 0 ? (
            <Empty>Not in any deployment.</Empty>
          ) : (
            <ul className="space-y-2">
              {deployments.map((d) => (
                <li key={d.code}>
                  <Link href={`/deployments/${d.code}`} className="text-sm font-medium text-primary hover:underline">{d.name}</Link>
                  <div className="text-xs text-muted-foreground">{d.contextOrganizationName}</div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        {/* Linked evidence */}
        <SectionCard title="Linked evidence" icon={FileText}>
          {evidence.length === 0 ? (
            <Empty>No linked evidence.</Empty>
          ) : (
            <table className="w-full text-sm">
              <tbody>
                {evidence.slice(0, 8).map((e) => (
                  <tr key={e.code} className="border-t border-border first:border-0">
                    <td className="py-2 pr-2 font-medium">{e.code}</td>
                    <td className="py-2 pr-2 text-muted-foreground">{e.title}</td>
                    <td className="py-2"><EnumPill value={e.status} map={evidenceStatusPill} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </SectionCard>
      </div>

      {/* Snapshot / change history with diff */}
      <div className="mt-6">
        <SectionCard title="Snapshot history" icon={GitBranch}>
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="pb-2 text-left text-xs font-medium text-muted-foreground">Snapshot</th>
                <th className="pb-2 text-left text-xs font-medium text-muted-foreground">{copy.common.date}</th>
                <th className="pb-2 text-left text-xs font-medium text-muted-foreground">Diff from parent</th>
                <th className="pb-2 text-left text-xs font-medium text-muted-foreground">Note</th>
              </tr>
            </thead>
            <tbody>
              {history.map((s) => (
                <tr key={s.code} className="border-t border-border align-top">
                  <td className="py-2 pr-2 font-medium">{s.code}</td>
                  <td className="py-2 pr-2 whitespace-nowrap text-muted-foreground">{formatDate(s.createdAt)}</td>
                  <td className="py-2 pr-2">{diffSummary(s.diff)}</td>
                  <td className="py-2 pr-2 text-muted-foreground">{s.note ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </SectionCard>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title={copy.nav.changes} icon={GitBranch} viewAllHref="/changes">
          {changes.length === 0 ? <Empty>No changes.</Empty> : (
            <table className="w-full text-sm">
              <tbody>
                {changes.map((c) => (
                  <tr key={c.code} className="border-t border-border first:border-0">
                    <td className="py-2 pr-2"><Link href={`/changes/${c.code}`} className="font-medium hover:underline">{c.code}</Link></td>
                    <td className="py-2 pr-2 whitespace-nowrap text-muted-foreground">{formatDate(c.createdAt)}</td>
                    <td className="py-2"><EnumPill value={c.status} map={changeStatusPill} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </SectionCard>

        <SectionCard title={copy.nav.incidents} icon={AlertTriangle} viewAllHref="/incidents">
          {incidents.length === 0 ? <Empty>No incidents.</Empty> : (
            <table className="w-full text-sm">
              <tbody>
                {incidents.map((i) => (
                  <tr key={i.code} className="border-t border-border first:border-0">
                    <td className="py-2 pr-2 whitespace-nowrap text-muted-foreground">{formatDate(i.occurredAt)}</td>
                    <td className="py-2 pr-2">{i.description}</td>
                    <td className="py-2 pr-2"><EnumPill value={i.severity} map={severityPill} /></td>
                    <td className="py-2"><EnumPill value={i.status} map={incidentStatusPill} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </SectionCard>
      </div>
    </>
  );
}

function Field({ icon: Icon, label, value, mono }: { icon?: typeof Bot; label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start gap-2">
      {Icon && <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />}
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className={mono ? "font-mono text-xs" : "font-medium"}>{value}</div>
      </div>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="py-6 text-center text-sm text-muted-foreground">{children}</p>;
}
