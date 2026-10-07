import { prisma } from "./prisma";
import { parseJson, parseSlots } from "@/lib/domain/json";
import { deploymentReadiness, deploymentCoverage, type EvidenceRow, type ApprovalRow } from "./metrics";
import type { DiffEntry } from "@/lib/domain/types";

export const REPORT_FOOTER =
  "Elaris does not certify or approve; approvals are recorded by the named persons.";

/** System Passport (spec §7.8): robot, active snapshot + hash, changes, deployments. */
export async function getPassport(code: string) {
  const robot = await prisma.robot.findUnique({
    where: { code },
    include: {
      deploymentRobots: {
        include: {
          deployment: {
            include: {
              providerOrganization: true,
              customer: true,
              site: { include: { hostOrganization: true } },
              activeBaseline: { include: { snapshot: { include: { items: true } } } },
            },
          },
        },
      },
      changes: { orderBy: { createdAt: "desc" } },
      snapshots: { orderBy: { createdAt: "desc" }, take: 1, include: { items: true } },
    },
  });
  if (!robot) return null;

  const activeFromDeployment = robot.deploymentRobots
    .map((dr) => dr.deployment.activeBaseline?.snapshot)
    .find((s) => s && s.robotId === robot.id);
  const activeSnapshot = activeFromDeployment ?? robot.snapshots[0] ?? null;

  return {
    type: "System Passport" as const,
    generatedAt: new Date().toISOString(),
    robot: { code: robot.code, model: robot.model, serialNumber: robot.serialNumber, status: robot.status },
    activeSnapshot: activeSnapshot
      ? { code: activeSnapshot.code, hash: activeSnapshot.hash, items: activeSnapshot.items.map((i) => ({ slot: i.slot, value: i.value })) }
      : null,
    changes: robot.changes.map((c) => ({ code: c.code, createdAt: c.createdAt.toISOString(), status: c.status, diff: parseJson<DiffEntry[]>(c.diff, []) })),
    deployments: robot.deploymentRobots.map((dr) => ({
      code: dr.deployment.code,
      name: dr.deployment.name,
      contextKind: dr.deployment.contextKind,
      provider: dr.deployment.providerOrganization?.name ?? null,
      host: dr.deployment.site.hostOrganization?.name ?? null,
      customer: dr.deployment.customer?.name ?? null,
      site: dr.deployment.site.name,
    })),
    footer: REPORT_FOOTER,
  };
}

/** Deployment Readiness Pack (spec §7.8): overview, readiness, evidence, approvals, baseline hash. */
export async function getReadinessPack(code: string) {
  const dep = await prisma.deployment.findUnique({
    where: { code },
    include: {
      providerOrganization: true,
      customer: true,
      site: { include: { hostOrganization: true } },
      task: true,
      deploymentRobots: { include: { robot: true } },
      activeBaseline: { include: { snapshot: true } },
      evidenceItems: { include: { owner: true } },
      approvals: { include: { approver: true } },
      changes: { select: { status: true } },
    },
  });
  if (!dep) return null;

  const hasPendingChange = dep.changes.some((c) => c.status === "DRAFT" || c.status === "REVIEW_REQUIRED");
  const readiness = deploymentReadiness({
    evidence: dep.evidenceItems as unknown as EvidenceRow[],
    approvals: dep.approvals as unknown as ApprovalRow[],
    hasSerial: dep.deploymentRobots.every(
      (dr) => typeof dr.robot.serialNumber === "string" && dr.robot.serialNumber.trim().length > 0
    ),
    activeHashMatchesBaseline: !!dep.activeBaseline,
    hasPendingChange,
  });
  const coverage = deploymentCoverage(dep.evidenceItems as unknown as EvidenceRow[]);

  return {
    type: "Deployment Readiness Pack" as const,
    generatedAt: new Date().toISOString(),
    deployment: {
      code: dep.code,
      name: dep.name,
      contextKind: dep.contextKind,
      provider: dep.providerOrganization?.name ?? null,
      host: dep.site.hostOrganization?.name ?? null,
      customer: dep.customer?.name ?? null,
      site: dep.site.name,
      siteLocation: `${dep.site.city}, ${dep.site.country}`,
      environmentType: dep.site.environmentType,
      lifecycle: dep.lifecycle,
      operationalState: dep.operationalState,
      operatingMode: dep.operatingMode,
      humanExposure: dep.humanExposure,
      task: dep.task?.name ?? null,
      description: dep.description,
    },
    activeBaseline: dep.activeBaseline ? { code: dep.activeBaseline.code, hash: dep.activeBaseline.hash, snapshotCode: dep.activeBaseline.snapshot.code } : null,
    readiness: { percent: readiness.percent, categories: readiness.categories },
    coverage,
    evidence: dep.evidenceItems.filter((e) => e.archivedAt === null).map((e) => ({
      code: e.code, title: e.title, category: e.category, kind: e.kind, status: e.status,
      criticality: e.criticality, required: e.required, scopeSlots: parseSlots(e.scopeSlots), owner: e.owner.name,
    })),
    approvals: dep.approvals.filter((a) => a.status !== "REVOKED").map((a) => ({
      title: a.title, person: a.approver.name, role: a.role, status: a.status, decidedAt: a.decidedAt?.toISOString() ?? null,
    })),
    footer: REPORT_FOOTER,
  };
}

/** Change Impact Report (spec §7.8): diff, affected items, actions, affected approvals. */
export async function getImpactReport(code: string) {
  const change = await prisma.change.findUnique({
    where: { code },
    include: {
      deployment: true, robot: true, author: true, approvedBy: true,
      impactItems: true,
    },
  });
  if (!change) return null;

  const approvalIds = change.impactItems.filter((i) => i.targetType === "APPROVAL" && i.targetId).map((i) => i.targetId!);
  const approvals = approvalIds.length ? await prisma.approval.findMany({ where: { id: { in: approvalIds } }, include: { approver: true } }) : [];
  const apById = new Map(approvals.map((a) => [a.id, a]));

  return {
    type: "Change Impact Report" as const,
    generatedAt: new Date().toISOString(),
    change: {
      code: change.code, deployment: change.deployment.name, robot: change.robot.code, status: change.status,
      createdAt: change.createdAt.toISOString(), author: change.author.name,
      approvedBy: change.approvedBy?.name ?? null, approvedAt: change.approvedAt?.toISOString() ?? null,
    },
    diff: parseJson<DiffEntry[]>(change.diff, []),
    items: change.impactItems.map((i) => ({
      title: i.title, type: i.targetType, reason: i.reason, action: i.suggestedAction, severity: i.severity,
      status: i.status, resolutionNote: i.resolutionNote,
    })),
    approvals: change.impactItems.filter((i) => i.targetType === "APPROVAL").map((i) => {
      const ap = i.targetId ? apById.get(i.targetId) : undefined;
      return {
        title: ap?.title ?? i.title,
        person: ap?.approver.name ?? "—",
        role: ap?.role ?? "",
        reason: i.reason,
        originalStatus: ap?.status ?? "REQUIRED",
        reviewStatus: i.status,
      };
    }),
    footer: REPORT_FOOTER,
  };
}
