import Link from "next/link";
import { notFound } from "next/navigation";
import {
  GitBranch, Box, Bot, Clock, Calendar, FileText, ShieldAlert, Users, CheckSquare,
  Check, FileOutput,
} from "lucide-react";
import { PageHeader } from "@/components/elaris/PageHeader";
import { SectionCard } from "@/components/elaris/SectionCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EnumPill } from "@/components/elaris/EnumPill";
import { copy } from "@/lib/copy/en";
import {
  changeStatusPill, severityPill, impactStatusPill, approvalStatusPill, categoryLabel,
  suggestedActionLabel, slotLabel, roleLabel,
} from "@/lib/copy/labels";
import { getChangeDetail } from "@/lib/db/changes";
import { getActor } from "@/lib/actions/context";
import { prisma } from "@/lib/db/prisma";
import { ApproveChangeButton } from "@/components/elaris/ApproveChangeButton";
import { ImpactActions } from "@/components/elaris/ImpactActions";
import { formatDate } from "@/lib/format";
import { SLOTS, type Slot } from "@/lib/domain/enums";

const SLOT_INDEX = new Map(SLOTS.map((s, i) => [s, i]));

export default async function ChangeImpactPage({ params }: { params: { code: string } }) {
  const detail = await getChangeDetail(params.code);
  if (!detail) notFound();

  const { change, diff, items, counts, affectedApprovals, primarySlot } = detail;
  const changed = new Set<Slot>(diff.map((d) => d.slot));

  const [actor, persons, evidenceRows] = await Promise.all([
    getActor(),
    prisma.person.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.evidenceItem.findMany({
      where: { deploymentId: change.deploymentId, archivedAt: null },
      select: { id: true, code: true, title: true },
      orderBy: { code: "asc" },
    }),
  ]);
  const evidenceOptions = evidenceRows.map((e) => ({ id: e.id, label: `${e.code} — ${e.title}` }));

  // §6.4 approval gate: blocked while any HIGH item OR any affected approval
  // still needs review. A Safety Lead cannot satisfy another person's approval.
  const blockingOpen = items.some(
    (i) => (i.status === "PENDING" || i.status === "IN_REVIEW") &&
      (i.severity === "HIGH" || i.targetType === "APPROVAL")
  );

  const beforeItems = sortItems(change.beforeSnapshot.items);
  const afterItems = sortItems(change.afterSnapshot.items);

  return (
    <>
      <PageHeader
        breadcrumb={
          <span className="flex items-center gap-1">
            <Link href="/deployments" className="hover:underline">{copy.nav.deployments}</Link>
            <span>/</span>
            <Link href={`/deployments/${change.deployment.code}`} className="hover:underline">{change.deployment.name}</Link>
            <span>/</span>
            <span>Change {change.code}</span>
          </span>
        }
        title="Change Impact"
        actions={
          <div className="flex items-start gap-2">
            <ApproveChangeButton
              changeCode={change.code}
              blockingOpen={blockingOpen}
              isSafetyLead={actor.role === "SAFETY_LEAD"}
              alreadyApproved={change.status === "APPROVED"}
            />
            <Button variant="outline" asChild>
              <Link href={`/reports/impact/${change.code}`}><FileOutput className="size-4" /> Export Impact Report</Link>
            </Button>
          </div>
        }
      />

      {/* Title band */}
      <Card className="mb-6 p-5">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex size-12 items-center justify-center rounded-lg bg-muted"><GitBranch className="size-6 text-muted-foreground" /></span>
          <h2 className="text-2xl font-semibold">
            {primarySlot ? (
              <>
                <span className="text-red-600">{primarySlot.before ?? "—"}</span>
                <span className="mx-2 text-muted-foreground">→</span>
                <span className="text-emerald-600">{primarySlot.after ?? "—"}</span>
              </>
            ) : (
              "Configuration change"
            )}
          </h2>
          <div className="ml-auto flex flex-wrap items-center gap-6 text-sm">
            <Meta icon={Box} label="Deployment" value={change.deployment.name} />
            <Meta icon={Bot} label="Robot" value={change.robot.code} />
            <Meta icon={Clock} label={copy.common.status} value={<EnumPill value={change.status} map={changeStatusPill} />} />
            <Meta icon={Calendar} label="Created" value={formatDate(change.createdAt)} />
          </div>
        </div>
      </Card>

      <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50/60 px-4 py-3 text-sm text-blue-950">
        <span className="font-semibold">Review boundary:</span> Potential impact is a review signal, not automatic invalidation.
        Evidence, requirements and named approvals stay human decisions.
      </div>

      {/* Before / After + Potential Impact */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-2">
          <BeforeAfter title="Before" side="before" items={beforeItems} changed={changed} />
          <BeforeAfter title="After" side="after" items={afterItems} changed={changed} />
        </div>

        <SectionCard title="Potential Impact" icon={ShieldAlert}>
          <div className="grid grid-cols-2 gap-3">
            <Counter value={counts.evidence} label="Affected evidence items" tone="red" />
            <Counter value={counts.requirements} label="Affected requirements" tone="amber" />
            <Counter value={counts.approvals} label="Affected approvals" tone="blue" />
            <Counter value={counts.deployments} label="Affected deployment" tone="slate" />
          </div>
        </SectionCard>
      </div>

      {/* Affected Items + Recommended Actions */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <SectionCard title="Affected Items" icon={FileText} className="lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  {[copy.common.item, copy.common.category, copy.common.reason, copy.common.suggestedAction, copy.common.impact, copy.common.status, ""].map((h, i) => (
                    <th key={h || i} className="px-2 py-2 text-left text-xs font-medium text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id} className="border-t border-border align-top">
                    <td className="px-2 py-3 font-medium">
                      {it.title}
                      {it.targetType !== "CHECK" && it.targetType !== "APPROVAL" && (
                        <div className="text-xs font-normal text-muted-foreground">{codeFromTitle(it.title)}</div>
                      )}
                    </td>
                    <td className="px-2 py-3 text-muted-foreground">{categoryLabel[it.targetType] ?? label(it.targetType)}</td>
                    <td className="px-2 py-3 text-muted-foreground">{it.reason}</td>
                    <td className="px-2 py-3">{suggestedActionLabel[it.suggestedAction] ?? it.suggestedAction}</td>
                    <td className="px-2 py-3"><EnumPill value={it.severity} map={severityPill} /></td>
                    <td className="px-2 py-3"><EnumPill value={it.status} map={impactStatusPill} /></td>
                    <td className="px-2 py-3">
                      <ImpactActions
                        itemId={it.id}
                        targetType={it.targetType}
                        suggestedAction={it.suggestedAction}
                        status={it.status}
                        persons={persons}
                        evidenceOptions={evidenceOptions}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard title="Recommended Actions" icon={CheckSquare}>
          <ul className="space-y-2">
            {items.map((it) => {
              const done = it.status === "RESOLVED" || it.status === "WAIVED";
              return (
                <li key={it.id} className="flex items-center gap-3">
                  <span className={`flex size-5 shrink-0 items-center justify-center rounded border ${done ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>
                    {done && <Check className="size-3.5" />}
                  </span>
                  <span className="flex-1 text-sm">
                    {suggestedActionLabel[it.suggestedAction] ?? it.suggestedAction} {it.title}
                  </span>
                  <EnumPill value={it.severity} map={severityPill} />
                </li>
              );
            })}
          </ul>
        </SectionCard>
      </div>

      {/* Approvals Potentially Affected */}
      <SectionCard title="Approvals Potentially Affected" icon={Users} viewAllHref={`/deployments/${change.deployment.code}`} viewAllCount={affectedApprovals.length}>
        <table className="w-full text-sm">
          <thead>
            <tr>
              {[copy.common.approval, copy.common.person, copy.common.role, copy.common.reason, "Original", "Re-approval"].map((h) => (
                <th key={h} className="px-2 py-2 text-left text-xs font-medium text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {affectedApprovals.map((a, i) => (
              <tr key={i} className="border-t border-border">
                <td className="px-2 py-3 font-medium">{a.title}</td>
                <td className="px-2 py-3">{a.personName}</td>
                <td className="px-2 py-3 text-muted-foreground">{roleLabel[a.role] ?? a.role}</td>
                <td className="px-2 py-3 text-muted-foreground">{a.reason}</td>
                <td className="px-2 py-3"><EnumPill value={a.originalStatus} map={approvalStatusPill} /></td>
                <td className="px-2 py-3"><EnumPill value={a.reviewStatus} map={impactStatusPill} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </SectionCard>
    </>
  );
}

function sortItems<T extends { slot: string }>(rows: T[]): T[] {
  return [...rows].sort((a, b) => (SLOT_INDEX.get(a.slot as Slot) ?? 99) - (SLOT_INDEX.get(b.slot as Slot) ?? 99));
}

function label(v: string): string {
  return v.charAt(0) + v.slice(1).toLowerCase();
}

/** Impact-item titles carry the code in parentheses, e.g. "Integration test (INT-042)". */
function codeFromTitle(title: string): string {
  const m = title.match(/\(([^)]+)\)\s*$/);
  return m ? m[1]! : "";
}

function BeforeAfter({
  title, side, items, changed,
}: {
  title: string; side: "before" | "after"; items: { id: string; slot: string; value: string }[]; changed: Set<Slot>;
}) {
  return (
    <Card className="overflow-hidden">
      <div className={`px-4 py-3 text-sm font-semibold ${side === "before" ? "bg-red-50 text-red-800" : "bg-emerald-50 text-emerald-800"}`}>
        {title}
      </div>
      <table className="w-full text-sm">
        <tbody>
          {items.map((it) => {
            const isChanged = changed.has(it.slot as Slot);
            return (
              <tr key={it.id} className={`border-t border-border ${isChanged ? (side === "before" ? "bg-red-50/60" : "bg-emerald-50/60") : ""}`}>
                <td className="px-4 py-2.5 text-muted-foreground">{slotLabel[it.slot] ?? it.slot}</td>
                <td className="px-4 py-2.5 text-right font-medium">
                  {it.value}
                  {isChanged && <span className="ml-2 text-xs font-normal text-muted-foreground">changed</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
}

function Counter({ value, label, tone }: { value: number; label: string; tone: "red" | "amber" | "blue" | "slate" }) {
  const toneClass = {
    red: "bg-red-50 text-red-700",
    amber: "bg-amber-50 text-amber-700",
    blue: "bg-blue-50 text-blue-700",
    slate: "bg-slate-100 text-slate-700",
  }[tone];
  return (
    <div className={`rounded-lg p-4 ${toneClass}`}>
      <div className="text-2xl font-semibold">{value}</div>
      <div className="text-xs">{label}</div>
    </div>
  );
}

function Meta({ icon: Icon, label, value }: { icon: typeof Box; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="size-4 text-muted-foreground" />
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="font-medium">{value}</div>
      </div>
    </div>
  );
}
