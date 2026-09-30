import { prisma } from "./prisma";
import { deploymentReadiness, deploymentCoverage, type EvidenceRow, type ApprovalRow } from "./metrics";
import { parseJson } from "@/lib/domain/json";
import type { DiffEntry } from "@/lib/domain/types";

const deploymentInclude = {
  customer: true,
  site: true,
  task: true,
  deploymentRobots: { include: { robot: true } },
  activeBaseline: { include: { snapshot: { include: { items: true } } } },
  baselines: { include: { snapshot: true, frozenBy: true }, orderBy: { frozenAt: "desc" } },
  evidenceItems: { include: { owner: true } },
  approvals: { include: { approver: true } },
  changes: { include: { robot: true, impactItems: true, author: true }, orderBy: { createdAt: "desc" } },
  incidents: { include: { robot: true }, orderBy: { occurredAt: "desc" } },
} as const;

type DeploymentFull = Awaited<ReturnType<typeof fetchByCode>>;

async function fetchByCode(code: string) {
  return prisma.deployment.findUnique({ where: { code }, include: deploymentInclude });
}

/** Whether a deployment has a registered-but-unapproved change (config pending). */
function hasPendingChange(changes: { status: string }[]): boolean {
  return changes.some((c) => c.status === "DRAFT" || c.status === "REVIEW_REQUIRED");
}

function metricInputs(dep: NonNullable<DeploymentFull>) {
  const robots = dep.deploymentRobots.map((dr) => dr.robot);
  const hasSerial = robots.length > 0 && robots.every((r) => r.serialNumber.trim().length > 0);
  // Active baseline is frozen over its snapshot, so the identity hash matches by
  // construction (spec §6.5). A newer unapproved snapshot is a pending change.
  const activeHashMatchesBaseline = !!dep.activeBaseline;
  return {
    evidence: dep.evidenceItems as unknown as EvidenceRow[],
    approvals: dep.approvals as unknown as ApprovalRow[],
    hasSerial,
    activeHashMatchesBaseline,
    hasPendingChange: hasPendingChange(dep.changes),
  };
}

export interface DeploymentSummary {
  code: string;
  name: string;
  customerName: string;
  siteCity: string;
  siteCountry: string;
  lifecycle: string;
  operationalState: string;
  readinessPercent: number;
}

function toSummary(dep: NonNullable<DeploymentFull>): DeploymentSummary {
  const readiness = deploymentReadiness(metricInputs(dep));
  return {
    code: dep.code,
    name: dep.name,
    customerName: dep.customer.name,
    siteCity: dep.site.city,
    siteCountry: dep.site.country,
    lifecycle: dep.lifecycle,
    operationalState: dep.operationalState,
    readinessPercent: readiness.percent,
  };
}

export async function getDeploymentSummaries(): Promise<DeploymentSummary[]> {
  const deps = await prisma.deployment.findMany({ include: deploymentInclude, orderBy: { code: "asc" } });
  return deps.map(toSummary);
}

/** Active = operationalState not PLANNED and not ENDED (spec §6.7). */
export async function getActiveDeploymentSummaries(): Promise<DeploymentSummary[]> {
  return (await getDeploymentSummaries()).filter(
    (d) => d.operationalState !== "PLANNED" && d.operationalState !== "ENDED"
  );
}

export async function getDeploymentDetail(code: string) {
  const dep = await fetchByCode(code);
  if (!dep) return null;

  const readiness = deploymentReadiness(metricInputs(dep));
  const coverage = deploymentCoverage(dep.evidenceItems as unknown as EvidenceRow[]);

  const snapshot = dep.activeBaseline?.snapshot ?? null;
  const evidenceCount = dep.evidenceItems.filter((e) => e.category === "EVIDENCE").length;
  const testCount = dep.evidenceItems.filter((e) => e.kind === "TEST").length;
  const approvalCount = dep.approvals.filter((a) => a.status !== "REVOKED").length;

  // Audit trail for this deployment's entities (spec §6.8).
  const relatedCodes = [
    dep.code,
    ...dep.changes.map((c) => c.code),
    ...dep.baselines.map((b) => b.code),
    ...dep.evidenceItems.map((e) => e.code),
    ...dep.incidents.map((i) => i.code),
  ];
  const audit = await prisma.auditEvent.findMany({
    where: { entityId: { in: relatedCodes } },
    include: { actor: true },
    orderBy: { at: "desc" },
    take: 30,
  });

  return {
    dep,
    audit,
    readiness,
    coverage,
    snapshot,
    documents: evidenceCount,
    tests: testCount,
    approvals: approvalCount,
    recentChanges: dep.changes.slice(0, 5).map((c) => ({
      code: c.code,
      diff: parseJson<DiffEntry[]>(c.diff, []),
      createdAt: c.createdAt,
      authorName: c.author.name,
      status: c.status,
      maxSeverity: maxImpactSeverity(c.impactItems),
    })),
    incidents: dep.incidents,
  };
}

const SEV_RANK: Record<string, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };
export function maxImpactSeverity(items: { severity: string }[]): string | null {
  let best: string | null = null;
  for (const it of items) {
    if (best === null || (SEV_RANK[it.severity] ?? 0) > (SEV_RANK[best] ?? 0)) best = it.severity;
  }
  return best;
}
