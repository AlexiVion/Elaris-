import { prisma } from "./prisma";
import { parseJson } from "@/lib/domain/json";
import type { DiffEntry } from "@/lib/domain/types";
import { slotLabel } from "@/lib/copy/labels";
import { getActiveDeploymentSummaries } from "./deployments";

export async function getHomeData() {
  const [
    activeDeploymentSummaries,
    robotsActive,
    openGaps,
    evReviewRequired,
    changesReviewRequired,
    reviewChanges,
    pendingApprovals,
    recentChangesRaw,
    missingEvidenceRaw,
    upcomingReviewsRaw,
    incidentsRaw,
    incidentsTotal,
  ] = await Promise.all([
    getActiveDeploymentSummaries(),
    prisma.robot.count({ where: { status: "ACTIVE" } }),
    prisma.evidenceItem.count({ where: { required: true, status: "MISSING", archivedAt: null } }),
    prisma.evidenceItem.count({ where: { status: "REVIEW_REQUIRED", archivedAt: null } }),
    prisma.change.count({ where: { status: "REVIEW_REQUIRED" } }),
    prisma.change.findMany({
      where: { status: "REVIEW_REQUIRED" },
      include: { robot: true, impactItems: true, deployment: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.approval.findMany({
      where: { status: { in: ["PENDING", "REQUIRED"] } },
      include: { deployment: true, approver: true },
    }),
    prisma.change.findMany({
      include: { robot: true, author: true, deployment: true, impactItems: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.evidenceItem.findMany({
      where: { required: true, status: "MISSING", archivedAt: null },
      include: { deployment: true },
      take: 5,
    }),
    prisma.evidenceItem.findMany({
      where: { dueDate: { not: null }, archivedAt: null },
      include: { deployment: true },
      orderBy: { dueDate: "asc" },
      take: 5,
    }),
    prisma.incident.findMany({ include: { robot: true }, orderBy: { occurredAt: "desc" }, take: 5 }),
    prisma.incident.count(),
  ]);

  const changesTotal = await prisma.change.count();
  const missingTotal = openGaps;
  const upcomingTotal = await prisma.evidenceItem.count({ where: { dueDate: { not: null }, archivedAt: null } });

  // Attention Required (spec §7.2): review-required changes + pending approvals,
  // most recent first. Uses real timestamps (approvals have none → sorted last).
  const attention = [
    ...reviewChanges.map((c) => {
      const diff = parseJson<DiffEntry[]>(c.diff, []);
      const first = diff[0];
      const open = c.impactItems.filter((i) => i.status === "PENDING" || i.status === "IN_REVIEW").length;
      return {
        kind: "change" as const,
        title: `${c.robot.code} — ${first ? `${slotLabel[first.slot]} changed` : "configuration change"}`,
        subtitle: `${open} ${open === 1 ? "item" : "items"} may require review`,
        at: c.createdAt as Date | null,
        href: `/changes/${c.code}`,
      };
    }),
    ...pendingApprovals.map((a) => ({
      kind: "approval" as const,
      title: a.deployment.name,
      subtitle: `${a.title} pending`,
      at: null as Date | null,
      href: `/deployments/${a.deployment.code}`,
    })),
  ].sort((x, y) => (y.at?.getTime() ?? -1) - (x.at?.getTime() ?? -1));

  return {
    kpis: {
      activeDeployments: activeDeploymentSummaries.length,
      robots: robotsActive,
      openGaps,
      reviewRequired: evReviewRequired + changesReviewRequired,
    },
    attention,
    attentionTotal: attention.length,
    activeDeployments: activeDeploymentSummaries.slice(0, 3),
    activeDeploymentsTotal: activeDeploymentSummaries.length,
    recentChanges: recentChangesRaw.map((c) => ({
      code: c.code,
      robotCode: c.robot.code,
      diff: parseJson<DiffEntry[]>(c.diff, []),
      createdAt: c.createdAt,
      status: c.status,
      maxSeverity: maxSeverity(c.impactItems),
    })),
    recentChangesTotal: changesTotal,
    missingEvidence: missingEvidenceRaw.map((e) => ({
      code: e.code,
      title: e.title,
      deploymentName: e.deployment.name,
      kind: e.kind,
    })),
    missingEvidenceTotal: missingTotal,
    upcomingReviews: upcomingReviewsRaw.map((e) => ({
      code: e.code,
      title: e.title,
      deploymentName: e.deployment.name,
      dueDate: e.dueDate,
      status: e.status,
    })),
    upcomingReviewsTotal: upcomingTotal,
    incidents: incidentsRaw.map((i) => ({
      code: i.code,
      occurredAt: i.occurredAt,
      robotCode: i.robot.code,
      description: i.description,
      severity: i.severity,
      status: i.status,
    })),
    incidentsTotal,
  };
}

const SEV_RANK: Record<string, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };
function maxSeverity(items: { severity: string }[]): string | null {
  let best: string | null = null;
  for (const it of items) {
    if (best === null || (SEV_RANK[it.severity] ?? 0) > (SEV_RANK[best] ?? 0)) best = it.severity;
  }
  return best;
}
