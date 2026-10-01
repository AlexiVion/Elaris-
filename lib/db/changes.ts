import { prisma } from "./prisma";
import { parseJson } from "@/lib/domain/json";
import type { DiffEntry, ImpactCounts } from "@/lib/domain/types";
import { maxImpactSeverity } from "./deployments";

const changeInclude = {
  deployment: true,
  robot: true,
  author: true,
  beforeSnapshot: { include: { items: true } },
  afterSnapshot: { include: { items: true } },
  impactItems: { include: { assignee: true } },
} as const;

/** Counters for the Potential Impact panel — computed from the impact items. */
function counts(items: { targetType: string }[]): ImpactCounts {
  return {
    evidence: items.filter((i) => i.targetType === "EVIDENCE").length,
    requirements: items.filter((i) => i.targetType === "REQUIREMENT").length,
    approvals: items.filter((i) => i.targetType === "APPROVAL").length,
    deployments: 1,
  };
}

const SEV_RANK: Record<string, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };

export async function getChangeDetail(code: string) {
  const change = await prisma.change.findUnique({ where: { code }, include: changeInclude });
  if (!change) return null;

  const diff = parseJson<DiffEntry[]>(change.diff, []);
  const items = [...change.impactItems].sort((a, b) => {
    const s = (SEV_RANK[a.severity] ?? 9) - (SEV_RANK[b.severity] ?? 9);
    if (s !== 0) return s;
    const aCoded = a.targetType !== "APPROVAL" && a.targetType !== "CHECK";
    const bCoded = b.targetType !== "APPROVAL" && b.targetType !== "CHECK";
    if (aCoded !== bCoded) return aCoded ? -1 : 1;
    return a.title.localeCompare(b.title);
  });

  // Resolve the approvals referenced by APPROVAL impact items.
  const approvalIds = items.filter((i) => i.targetType === "APPROVAL" && i.targetId).map((i) => i.targetId!);
  const approvals = approvalIds.length
    ? await prisma.approval.findMany({ where: { id: { in: approvalIds } }, include: { approver: true } })
    : [];
  const approvalsById = new Map(approvals.map((a) => [a.id, a]));

  const affectedApprovals = items
    .filter((i) => i.targetType === "APPROVAL")
    .map((i) => {
      const ap = i.targetId ? approvalsById.get(i.targetId) : undefined;
      return {
        title: ap?.title ?? i.title,
        personName: ap?.approver.name ?? "—",
        role: ap?.role ?? "",
        reason: i.reason,
        originalStatus: ap?.status ?? "REQUIRED",
        reviewStatus: i.status,
        severity: i.severity,
      };
    });

  return {
    change,
    diff,
    items,
    counts: counts(items),
    affectedApprovals,
    primarySlot: diff[0] ?? null,
  };
}

export async function getChangeList() {
  const changes = await prisma.change.findMany({
    include: { robot: true, author: true, deployment: true, impactItems: true },
    orderBy: { createdAt: "desc" },
  });
  return changes.map((c) => ({
    code: c.code,
    robotCode: c.robot.code,
    deploymentName: c.deployment.name,
    diff: parseJson<DiffEntry[]>(c.diff, []),
    authorName: c.author.name,
    createdAt: c.createdAt,
    status: c.status,
    maxSeverity: maxImpactSeverity(c.impactItems),
  }));
}
