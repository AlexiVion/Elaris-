import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Bot, Box, ListChecks, Building2, Activity, ShieldCheck, Settings2, FileText,
  BadgeCheck, Wrench, Fingerprint, GitBranch, AlertTriangle, Share2, FileOutput, User, MapPin,
} from "lucide-react";
import { PageHeader } from "@/components/elaris/PageHeader";
import { SectionCard } from "@/components/elaris/SectionCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ReadinessDonut } from "@/components/elaris/ReadinessDonut";
import { ReadinessBar } from "@/components/elaris/ReadinessBar";
import { EnumPill } from "@/components/elaris/EnumPill";
import { copy } from "@/lib/copy/en";
import {
  lifecyclePill, operationalStatePill, readinessStatusPill, evidenceStatusPill,
  approvalStatusPill, severityPill, incidentStatusPill, changeStatusPill, slotLabel,
  readinessCategoryLabel, environmentLabel, operatingModeLabel, humanExposureLabel,
  deploymentContextKindLabel,
} from "@/lib/copy/labels";
import { getDeploymentDetail } from "@/lib/db/deployments";
import { formatDate, formatDateTime } from "@/lib/format";
import { SLOTS } from "@/lib/domain/enums";
import type { ReadinessCategory } from "@/lib/domain/enums";
import type { DiffEntry } from "@/lib/domain/types";

const CATEGORY_ICON: Record<ReadinessCategory, typeof ShieldCheck> = {
  SYSTEM_IDENTITY: Fingerprint,
  CONFIGURATION: Settings2,
  SAFETY_EVIDENCE: ShieldCheck,
  CUSTOMER_REQUIREMENTS: FileText,
  INSURANCE: BadgeCheck,
  MAINTENANCE: Wrench,
};

const SLOT_INDEX = new Map(SLOTS.map((s, i) => [s, i]));

function changeSummary(diff: DiffEntry[]): string {
  if (diff.length === 0) return "Configuration change";
  if (diff.length === 1) return `${slotLabel[diff[0]!.slot]} → ${diff[0]!.after ?? "—"}`;
  return `${diff.map((d) => slotLabel[d.slot]).join(", ")} updated`;
}

export default async function DeploymentOverviewPage({
  params,
  searchParams,
}: {
  params: { code: string };
  searchParams: { tab?: string };
}) {
  const detail = await getDeploymentDetail(params.code);
  if (!detail) notFound();

  const { dep, readiness, coverage, snapshot, recentChanges, incidents, audit } = detail;
  const tab = searchParams.tab === "history" ? "history" : "overview";
  const robots = dep.deploymentRobots.map((dr) => dr.robot);
  const primaryRobot = robots[0];
  const configItems = snapshot
    ? [...snapshot.items].sort((a, b) => (SLOT_INDEX.get(a.slot as never) ?? 99) - (SLOT_INDEX.get(b.slot as never) ?? 99))
    : [];

  const requirements = dep.evidenceItems.filter((e) => e.category === "REQUIREMENT" && e.archivedAt === null);
  const approvals = dep.approvals.filter((a) => a.status !== "REVOKED");
  const pendingChange = recentChanges.find((c) => c.status === "DRAFT" || c.status === "REVIEW_REQUIRED");

  return (
    <>
      <PageHeader
        breadcrumb={<Link href="/deployments" className="hover:underline">{copy.nav.deployments}</Link>}
        title={dep.name}
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href={`/deployments/${dep.code}/changes/new`}><GitBranch className="size-4" /> New change</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/reports/readiness/${dep.code}`}><Share2 className="size-4" /> Share View</Link>
            </Button>
            <Button asChild>
              <Link href={`/reports/readiness/${dep.code}`}><FileOutput className="size-4" /> Generate Report</Link>
            </Button>
          </>
        }
      />

      <div className="-mt-3 mb-5 flex items-center gap-3">
        <EnumPill value={dep.operationalState} map={operationalStatePill} />
        <span className="text-sm text-muted-foreground">{dep.code}</span>
      </div>

      {dep.activeBaseline && (
        <Card className="mb-5 border-primary/20 bg-primary/[0.03] px-4 py-3">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <div>
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Active baseline</span>
              <div className="font-semibold">{dep.activeBaseline.code} · {dep.activeBaseline.snapshot.code}</div>
            </div>
            <div className="min-w-0">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Configuration hash</span>
              <div className="truncate font-mono text-xs">{dep.activeBaseline.hash.slice(0, 16)}…</div>
            </div>
            <div className="ml-auto">
              {pendingChange ? (
                <>
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Pending change</span>
                  <div>
                    <Link href={`/changes/${pendingChange.code}`} className="font-semibold text-primary hover:underline">
                      {pendingChange.code} · review required
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Configuration state</span>
                  <div className="font-semibold">Baseline current</div>
                </>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Tabs */}
      <div className="mb-6 flex gap-1 border-b border-border">
        <TabLink href={`/deployments/${dep.code}`} active={tab === "overview"}>Overview</TabLink>
        <TabLink href={`/deployments/${dep.code}?tab=history`} active={tab === "history"}>History</TabLink>
      </div>

      {/* KPI strip (spec §7.3) */}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <KpiTile icon={Bot} label="Robot" value={primaryRobot ? primaryRobot.code : "—"} sub={robots.length > 1 ? `+${robots.length - 1} more` : undefined} />
        <KpiTile icon={Box} label="Configuration" value={snapshot?.code ?? "—"} />
        <KpiTile icon={ListChecks} label="Task" value={dep.task?.name ?? "Not assigned"} />
        <KpiTile
          icon={Building2}
          label="Environment"
          value={dep.site.environmentType ? (environmentLabel[dep.site.environmentType] ?? dep.site.environmentType) : "Not recorded"}
        />
        <KpiTile
          icon={Activity}
          label="Context"
          value={deploymentContextKindLabel[dep.contextKind] ?? dep.contextKind}
          sub={dep.lifecycle ? (lifecyclePill[dep.lifecycle]?.label ?? dep.lifecycle) : undefined}
        />
        <Card className="flex items-center justify-between p-4">
          <div>
            <div className="text-xs text-muted-foreground">{copy.home.readiness}</div>
          </div>
          <ReadinessDonut percent={readiness.percent} />
        </Card>
      </div>

      {tab === "overview" ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Overview */}
            <SectionCard title="Overview" action={<Link href={`/deployments/${dep.code}`} className="text-sm text-muted-foreground">{copy.common.edit}</Link>}>
              <p className="mb-4 text-sm leading-relaxed text-foreground/90">{dep.description}</p>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                {dep.providerOrganization ? (
                  <Field icon={Building2} label="Provider / owner context" value={dep.providerOrganization.name} />
                ) : null}
                {dep.site.hostOrganization ? (
                  <Field icon={Building2} label="Host organization" value={dep.site.hostOrganization.name} />
                ) : null}
                {dep.customer ? (
                  <Field icon={Building2} label="Customer" value={dep.customer.name} />
                ) : null}
                <Field icon={MapPin} label="Site" value={`${dep.site.name} · ${dep.site.city}, ${dep.site.country}`} />
                <Field icon={Activity} label="Context kind" value={deploymentContextKindLabel[dep.contextKind] ?? dep.contextKind} />
                {dep.humanExposure ? (
                  <Field icon={User} label="Human exposure" value={humanExposureLabel[dep.humanExposure] ?? dep.humanExposure} />
                ) : null}
                {dep.operatingMode ? (
                  <Field icon={Settings2} label="Operating mode" value={operatingModeLabel[dep.operatingMode] ?? dep.operatingMode} />
                ) : null}
                {dep.task ? <Field icon={ListChecks} label="Task" value={dep.task.name} /> : null}
                <Field icon={FileText} label="Reference" value={dep.code} />
              </dl>
            </SectionCard>

            {/* Readiness Status */}
            <SectionCard title="Readiness Status" icon={ShieldCheck}>
              <ul className="divide-y divide-border">
                {readiness.categories.map((c) => {
                  const Icon = CATEGORY_ICON[c.category];
                  return (
                    <li key={c.category} className="flex items-center gap-3 py-3">
                      <Icon className="size-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium">{readinessCategoryLabel[c.category]}</div>
                        <div className="truncate text-xs text-muted-foreground">{c.description}</div>
                      </div>
                      <EnumPill value={c.status} map={readinessStatusPill} />
                    </li>
                  );
                })}
              </ul>
            </SectionCard>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Configuration Snapshot */}
            <SectionCard title="Configuration Snapshot" icon={Box}>
              <table className="w-full text-sm">
                <tbody>
                  {configItems.map((it) => (
                    <tr key={it.id} className="border-t border-border first:border-0">
                      <td className="py-2 pr-3 text-muted-foreground">{slotLabel[it.slot] ?? it.slot}</td>
                      <td className="py-2 text-right font-medium">{it.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </SectionCard>

            {/* Evidence Coverage */}
            <SectionCard title="Evidence Coverage" icon={FileText}>
              <div className="grid grid-cols-2 gap-3">
                <MiniTile value={detail.documents} label="Documents" />
                <MiniTile value={detail.tests} label="Tests" />
                <MiniTile value={detail.approvals} label="Approvals" />
                <MiniTile value={coverage.linked} label="Linked" />
              </div>
              <div className="mt-4">
                <ReadinessBar percent={coverage.percent} label={copy.coverage.label} />
                <p className="mt-1 text-xs text-muted-foreground">
                  {copy.coverage.linked(coverage.linked, coverage.applicable)}
                </p>
              </div>
            </SectionCard>

            {/* Requirements & Approvals */}
            <SectionCard title="Requirements & Approvals" icon={ListChecks}>
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="pb-2 text-left text-xs font-medium text-muted-foreground">{copy.common.item}</th>
                    <th className="pb-2 text-left text-xs font-medium text-muted-foreground">{copy.common.owner}</th>
                    <th className="pb-2 text-left text-xs font-medium text-muted-foreground">{copy.common.status}</th>
                  </tr>
                </thead>
                <tbody>
                  {requirements.slice(0, 4).map((r) => (
                    <tr key={r.id} className="border-t border-border">
                      <td className="py-2 pr-2 font-medium">{r.title}</td>
                      <td className="py-2 pr-2 text-muted-foreground">{r.owner.name}</td>
                      <td className="py-2"><EnumPill value={r.status} map={evidenceStatusPill} /></td>
                    </tr>
                  ))}
                  {approvals.map((a) => (
                    <tr key={a.id} className="border-t border-border">
                      <td className="py-2 pr-2 font-medium">{a.title}</td>
                      <td className="py-2 pr-2 text-muted-foreground">{a.approver.name}</td>
                      <td className="py-2"><EnumPill value={a.status} map={approvalStatusPill} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </SectionCard>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Recent Changes */}
            <SectionCard title={copy.home.recentChanges} icon={GitBranch} viewAllHref="/changes" viewAllCount={recentChanges.length}>
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="pb-2 text-left text-xs font-medium text-muted-foreground">{copy.common.change}</th>
                    <th className="pb-2 text-left text-xs font-medium text-muted-foreground">{copy.common.date}</th>
                    <th className="pb-2 text-left text-xs font-medium text-muted-foreground">{copy.common.author}</th>
                    <th className="pb-2 text-left text-xs font-medium text-muted-foreground">{copy.common.impact}</th>
                  </tr>
                </thead>
                <tbody>
                  {recentChanges.map((c) => (
                    <tr key={c.code} className="border-t border-border">
                      <td className="py-2 pr-2">
                        <Link href={`/changes/${c.code}`} className="font-medium hover:underline">{changeSummary(c.diff)}</Link>
                      </td>
                      <td className="py-2 pr-2 whitespace-nowrap text-muted-foreground">{formatDate(c.createdAt)}</td>
                      <td className="py-2 pr-2 text-muted-foreground">{c.authorName}</td>
                      <td className="py-2">{c.maxSeverity ? <EnumPill value={c.maxSeverity} map={severityPill} /> : <span className="text-muted-foreground">—</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </SectionCard>

            {/* Related Incidents */}
            <SectionCard title="Related Incidents" icon={AlertTriangle} viewAllHref="/incidents" viewAllCount={incidents.length}>
              {incidents.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">No related incidents.</p>
              ) : (
                <table className="w-full text-sm">
                  <tbody>
                    {incidents.map((i) => (
                      <tr key={i.id} className="border-t border-border first:border-0">
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
        </div>
      ) : (
        // History tab: baselines (with hash) + changes (spec §7.3)
        <div className="space-y-6">
          <SectionCard title="Baselines" icon={Box}>
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="pb-2 text-left text-xs font-medium text-muted-foreground">Baseline</th>
                  <th className="pb-2 text-left text-xs font-medium text-muted-foreground">Snapshot</th>
                  <th className="pb-2 text-left text-xs font-medium text-muted-foreground">Hash</th>
                  <th className="pb-2 text-left text-xs font-medium text-muted-foreground">Frozen</th>
                  <th className="pb-2 text-left text-xs font-medium text-muted-foreground">By</th>
                </tr>
              </thead>
              <tbody>
                {dep.baselines.map((b) => (
                  <tr key={b.id} className="border-t border-border">
                    <td className="py-2 pr-2 font-medium">
                      {b.code}
                      {dep.activeBaselineId === b.id && <span className="ml-2 text-xs text-emerald-600">active</span>}
                    </td>
                    <td className="py-2 pr-2">{b.snapshot.code}</td>
                    <td className="py-2 pr-2 font-mono text-xs text-muted-foreground">{b.hash.slice(0, 12)}…</td>
                    <td className="py-2 pr-2 whitespace-nowrap text-muted-foreground">{formatDateTime(b.frozenAt)}</td>
                    <td className="py-2">{b.frozenBy.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </SectionCard>

          <SectionCard title={copy.home.recentChanges} icon={GitBranch}>
            <table className="w-full text-sm">
              <tbody>
                {recentChanges.map((c) => (
                  <tr key={c.code} className="border-t border-border first:border-0">
                    <td className="py-2 pr-2"><Link href={`/changes/${c.code}`} className="font-medium hover:underline">{c.code}</Link></td>
                    <td className="py-2 pr-2">{changeSummary(c.diff)}</td>
                    <td className="py-2 pr-2 whitespace-nowrap text-muted-foreground">{formatDate(c.createdAt)}</td>
                    <td className="py-2 pr-2"><EnumPill value={c.status} map={changeStatusPill} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </SectionCard>

          <SectionCard title="Audit log" icon={Fingerprint}>
            {audit.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No audit events yet.</p>
            ) : (
              <ul className="divide-y divide-border">
                {audit.map((a) => (
                  <li key={a.id} className="flex items-center gap-3 py-2.5 text-sm">
                    <span className="w-40 shrink-0 whitespace-nowrap text-xs text-muted-foreground">{formatDateTime(a.at)}</span>
                    <span className="font-medium">{a.action.replace(/_/g, " ").toLowerCase()}</span>
                    <span className="text-muted-foreground">{a.entityType} {a.entityId}</span>
                    <span className="ml-auto text-xs text-muted-foreground">{a.actor.name}</span>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </div>
      )}
    </>
  );
}

function TabLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium ${active ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
    >
      {children}
    </Link>
  );
}

function KpiTile({ icon: Icon, label, value, sub }: { icon: typeof Bot; label: string; value: React.ReactNode; sub?: string }) {
  return (
    <Card className="p-4">
      <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="size-4" /> {label}
      </div>
      <div className="text-sm font-semibold">{value}</div>
      {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
    </Card>
  );
}

function MiniTile({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-md bg-muted/50 p-3">
      <div className="text-xl font-semibold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function Field({ icon: Icon, label, value }: { icon: typeof Bot; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div>
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="font-medium">{value}</dd>
      </div>
    </div>
  );
}
