import { Card } from "@/components/ui/card";
import { EnumPill } from "@/components/elaris/EnumPill";
import { copy } from "@/lib/copy/en";
import {
  evidenceStatusPill, approvalStatusPill, severityPill, impactStatusPill, changeStatusPill,
  readinessStatusPill, slotLabel, readinessCategoryLabel, categoryLabel, suggestedActionLabel,
  kindLabel, roleLabel, humanExposureLabel, operatingModeLabel,
} from "@/lib/copy/labels";
import { formatDate } from "@/lib/format";
import type { getPassport, getReadinessPack, getImpactReport } from "@/lib/db/reports";

type Passport = NonNullable<Awaited<ReturnType<typeof getPassport>>>;
type Readiness = NonNullable<Awaited<ReturnType<typeof getReadinessPack>>>;
type Impact = NonNullable<Awaited<ReturnType<typeof getImpactReport>>>;
export type AnyReport = Passport | Readiness | Impact;

const th = "px-3 py-2 text-left text-xs font-medium text-muted-foreground";
const td = "px-3 py-2 align-top";

export function ReportView({ report }: { report: AnyReport }) {
  return (
    <Card className="print-page mx-auto max-w-4xl p-8">
      <header className="mb-6 border-b border-border pb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-primary">Elaris · {report.type}</div>
            <h1 className="mt-1 text-2xl font-semibold">{reportTitle(report)}</h1>
          </div>
          <div className="text-right text-xs text-muted-foreground">Generated {formatDate(report.generatedAt)}</div>
        </div>
      </header>

      {report.type === "System Passport" && <PassportBody r={report} />}
      {report.type === "Deployment Readiness Pack" && <ReadinessBody r={report} />}
      {report.type === "Change Impact Report" && <ImpactBody r={report} />}

      <footer className="mt-8 border-t border-border pt-4 text-xs text-muted-foreground">
        {copy.reportFooter.replace("{date}", formatDate(report.generatedAt))}
      </footer>
    </Card>
  );
}

function reportTitle(r: AnyReport): string {
  if (r.type === "System Passport") return r.robot.code;
  if (r.type === "Deployment Readiness Pack") return r.deployment.name;
  return `${r.change.code} — ${r.change.deployment}`;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</h2>
      {children}
    </section>
  );
}

function KV({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

function PassportBody({ r }: { r: Passport }) {
  return (
    <>
      <Section title="Robot">
        <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <KV label="Code" value={r.robot.code} />
          <KV label="Model" value={r.robot.model} />
          <KV label="Serial" value={<span className="font-mono text-xs">{r.robot.serialNumber}</span>} />
          <KV label="Status" value={r.robot.status} />
        </dl>
      </Section>
      {r.activeSnapshot && (
        <Section title={`Active snapshot — ${r.activeSnapshot.code}`}>
          <p className="mb-2 font-mono text-xs text-muted-foreground">hash {r.activeSnapshot.hash}</p>
          <table className="w-full text-sm">
            <tbody>
              {r.activeSnapshot.items.map((i) => (
                <tr key={i.slot} className="border-t border-border first:border-0">
                  <td className={`${td} text-muted-foreground`}>{slotLabel[i.slot] ?? i.slot}</td>
                  <td className={`${td} text-right font-medium`}>{i.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      )}
      <Section title="Change history">
        <table className="w-full text-sm">
          <thead><tr><th className={th}>Change</th><th className={th}>Date</th><th className={th}>Slots</th><th className={th}>Status</th></tr></thead>
          <tbody>
            {r.changes.map((c) => (
              <tr key={c.code} className="border-t border-border">
                <td className={`${td} font-medium`}>{c.code}</td>
                <td className={td}>{formatDate(c.createdAt)}</td>
                <td className={td}>{c.diff.map((d) => slotLabel[d.slot]).join(", ") || "—"}</td>
                <td className={td}><EnumPill value={c.status} map={changeStatusPill} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>
      <Section title="Deployments">
        <ul className="text-sm">{r.deployments.map((d) => <li key={d.code}>{d.name} · {d.customer}</li>)}</ul>
      </Section>
    </>
  );
}

function ReadinessBody({ r }: { r: Readiness }) {
  return (
    <>
      <Section title="Overview">
        <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
          <KV label="Customer" value={r.deployment.customer} />
          <KV label="Site" value={r.deployment.site} />
          <KV label="Task" value={r.deployment.task} />
          <KV label="Operating mode" value={operatingModeLabel[r.deployment.operatingMode] ?? r.deployment.operatingMode} />
          <KV label="Human exposure" value={humanExposureLabel[r.deployment.humanExposure] ?? r.deployment.humanExposure} />
          <KV label="Reference" value={r.deployment.code} />
        </dl>
        <p className="mt-3 text-sm text-foreground/90">{r.deployment.description}</p>
      </Section>

      <Section title={`Readiness — ${r.readiness.percent}%`}>
        <ul className="divide-y divide-border text-sm">
          {r.readiness.categories.map((c) => (
            <li key={c.category} className="flex items-center justify-between py-2">
              <span><span className="font-medium">{readinessCategoryLabel[c.category]}</span> <span className="text-muted-foreground">— {c.description}</span></span>
              <EnumPill value={c.status} map={readinessStatusPill} />
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Evidence coverage">
        <p className="text-sm">{copy.coverage.linked(r.coverage.linked, r.coverage.applicable)} ({r.coverage.percent}%)</p>
      </Section>

      <Section title="Evidence & requirements">
        <table className="w-full text-sm">
          <thead><tr><th className={th}>Code</th><th className={th}>Title</th><th className={th}>Type</th><th className={th}>Criticality</th><th className={th}>Status</th></tr></thead>
          <tbody>
            {r.evidence.map((e) => (
              <tr key={e.code} className="border-t border-border">
                <td className={`${td} font-medium`}>{e.code}</td>
                <td className={td}>{e.title}</td>
                <td className={td}>{kindLabel[e.kind] ?? e.kind}</td>
                <td className={td}><EnumPill value={e.criticality} map={severityPill} /></td>
                <td className={td}><EnumPill value={e.status} map={evidenceStatusPill} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section title="Approvals">
        <table className="w-full text-sm">
          <tbody>
            {r.approvals.map((a, i) => (
              <tr key={i} className="border-t border-border first:border-0">
                <td className={`${td} font-medium`}>{a.title}</td>
                <td className={td}>{a.person}</td>
                <td className={`${td} text-muted-foreground`}>{roleLabel[a.role] ?? a.role}</td>
                <td className={td}><EnumPill value={a.status} map={approvalStatusPill} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      {r.activeBaseline && (
        <Section title="Active baseline">
          <p className="text-sm">{r.activeBaseline.code} · snapshot {r.activeBaseline.snapshotCode}</p>
          <p className="font-mono text-xs text-muted-foreground">hash {r.activeBaseline.hash}</p>
        </Section>
      )}
    </>
  );
}

function ImpactBody({ r }: { r: Impact }) {
  return (
    <>
      <Section title="Change">
        <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <KV label="Deployment" value={r.change.deployment} />
          <KV label="Robot" value={r.change.robot} />
          <KV label="Status" value={<EnumPill value={r.change.status} map={changeStatusPill} />} />
          <KV label="Created" value={formatDate(r.change.createdAt)} />
          {r.change.approvedBy && <KV label="Approved by" value={`${r.change.approvedBy}${r.change.approvedAt ? `, ${formatDate(r.change.approvedAt)}` : ""}`} />}
        </dl>
      </Section>
      <Section title="Diff">
        <table className="w-full text-sm">
          <tbody>
            {r.diff.map((d) => (
              <tr key={d.slot} className="border-t border-border first:border-0">
                <td className={`${td} text-muted-foreground`}>{slotLabel[d.slot] ?? d.slot}</td>
                <td className={`${td} text-red-600`}>{d.before ?? "—"}</td>
                <td className={td}>→</td>
                <td className={`${td} text-emerald-600`}>{d.after ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>
      <Section title="Affected items">
        <table className="w-full text-sm">
          <thead><tr><th className={th}>Item</th><th className={th}>Category</th><th className={th}>Reason</th><th className={th}>Action</th><th className={th}>Impact</th><th className={th}>Status</th></tr></thead>
          <tbody>
            {r.items.map((i, idx) => (
              <tr key={idx} className="border-t border-border">
                <td className={`${td} font-medium`}>{i.title}</td>
                <td className={td}>{categoryLabel[i.type] ?? i.type.toLowerCase()}</td>
                <td className={`${td} text-muted-foreground`}>{i.reason}</td>
                <td className={td}>{suggestedActionLabel[i.action] ?? i.action}</td>
                <td className={td}><EnumPill value={i.severity} map={severityPill} /></td>
                <td className={td}><EnumPill value={i.status} map={impactStatusPill} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>
      {r.approvals.length > 0 && (
        <Section title="Approvals affected">
          <table className="w-full text-sm">
            <tbody>
              {r.approvals.map((a, i) => (
                <tr key={i} className="border-t border-border first:border-0">
                  <td className={`${td} font-medium`}>{a.title}</td>
                  <td className={td}>{a.person}</td>
                  <td className={`${td} text-muted-foreground`}>{roleLabel[a.role] ?? a.role}</td>
                  <td className={td}>
                    <span className="mr-2 text-xs text-muted-foreground">Original</span>
                    <EnumPill value={a.originalStatus} map={approvalStatusPill} />
                  </td>
                  <td className={td}>
                    <span className="mr-2 text-xs text-muted-foreground">Re-approval</span>
                    <EnumPill value={a.reviewStatus} map={impactStatusPill} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      )}
    </>
  );
}
