import { prisma } from "./prisma";
import { parseJson, parseSlots } from "@/lib/domain/json";

type IncidentTimelineEntry = { at: string; note: string };
type ChangeDiffEntry = { slot: string; before: string | null; after: string | null; type: string };

export async function getHorizontalPlatformData() {
  const [
    deployment,
    activeDeployments,
    activeRobots,
    openChanges,
    openIncidents,
    missingEvidence,
    reviewEvidence,
    incidentQueue,
    baselines,
    snapshots,
  ] = await Promise.all([
    prisma.deployment.findUnique({
      where: { code: "DEP-0017" },
      include: {
        customer: true,
        site: true,
        task: true,
        activeBaseline: { include: { snapshot: { include: { items: true } } } },
        deploymentRobots: { include: { robot: true } },
        evidenceItems: {
          where: { archivedAt: null },
          include: { owner: true },
          orderBy: { code: "asc" },
        },
        approvals: { include: { approver: true }, orderBy: { title: "asc" } },
        changes: {
          include: {
            impactItems: true,
            beforeSnapshot: { include: { items: true } },
            afterSnapshot: { include: { items: true } },
            author: true,
          },
          orderBy: { createdAt: "desc" },
          take: 3,
        },
        incidents: { orderBy: { occurredAt: "desc" }, take: 3 },
      },
    }),
    prisma.deployment.count({ where: { operationalState: "LIVE" } }),
    prisma.robot.count({ where: { status: "ACTIVE" } }),
    prisma.change.count({ where: { status: "REVIEW_REQUIRED" } }),
    prisma.incident.count({ where: { status: { not: "CLOSED" } } }),
    prisma.evidenceItem.count({ where: { required: true, status: "MISSING", archivedAt: null } }),
    prisma.evidenceItem.count({ where: { status: "REVIEW_REQUIRED", archivedAt: null } }),
    prisma.incident.findMany({
      include: {
        deployment: true,
        robot: true,
      },
      orderBy: { occurredAt: "desc" },
    }),
    prisma.baseline.findMany({ select: { id: true, code: true, snapshotId: true } }),
    prisma.configurationSnapshot.findMany({ select: { id: true, code: true } }),
  ]);

  if (!deployment) throw new Error("Horizontal platform prototype requires demo deployment DEP-0017.");

  const evidence = deployment.evidenceItems.filter((item) => item.category === "EVIDENCE");
  const requirements = deployment.evidenceItems.filter((item) => item.category === "REQUIREMENT");
  const pendingApprovals = deployment.approvals.filter((approval) =>
    ["PENDING", "REQUIRED", "NOT_STARTED"].includes(approval.status)
  );
  const activeRobot = deployment.deploymentRobots[0]?.robot ?? null;
  const latestChange = deployment.changes[0] ?? null;
  const latestIncident = deployment.incidents[0] ?? null;
  const baselineCodeById = new Map(baselines.map((baseline) => [baseline.id, baseline.code]));
  const snapshotCodeById = new Map(snapshots.map((snapshot) => [snapshot.id, snapshot.code]));

  const mapEvidenceItem = (item: (typeof deployment.evidenceItems)[number]) => ({
    code: item.code,
    title: item.title,
    category: item.category,
    kind: item.kind,
    readinessCategory: item.readinessCategory,
    source: item.source,
    scopeSlots: parseSlots(item.scopeSlots),
    criticality: item.criticality,
    status: item.status,
    required: item.required,
    applicable: item.applicable,
    owner: item.owner.name,
    uri: item.uri,
    dueDate: item.dueDate,
    updatedAt: item.updatedAt,
  });

  return {
    portfolio: {
      activeDeployments,
      activeRobots,
      openChanges,
      openIncidents,
      missingEvidence,
      reviewEvidence,
    },
    deployment: {
      code: deployment.code,
      name: deployment.name,
      description: deployment.description,
      lifecycle: deployment.lifecycle,
      operationalState: deployment.operationalState,
      operatingMode: deployment.operatingMode,
      humanExposure: deployment.humanExposure,
      customer: deployment.customer.name,
      site: deployment.site.name,
      city: deployment.site.city,
      country: deployment.site.country,
      environmentType: deployment.site.environmentType,
      task: deployment.task.name,
      taskDescription: deployment.task.description,
      robot: activeRobot ? `${activeRobot.code} · ${activeRobot.model}` : "—",
      robotCode: activeRobot?.code ?? "—",
      robotModel: activeRobot?.model ?? "—",
      robotSerial: activeRobot?.serialNumber ?? "—",
      baselineCode: deployment.activeBaseline?.code ?? "—",
      snapshotCode: deployment.activeBaseline?.snapshot.code ?? "—",
      snapshotHash: deployment.activeBaseline?.snapshot.hash ?? "—",
      configurationItems:
        deployment.activeBaseline?.snapshot.items
          .slice()
          .sort((a, b) => a.slot.localeCompare(b.slot))
          .map((item) => ({ slot: item.slot, value: item.value })) ?? [],
      evidenceCount: evidence.length,
      requirementCount: requirements.length,
      missingCount: deployment.evidenceItems.filter((item) => item.status === "MISSING").length,
      reviewCount: deployment.evidenceItems.filter((item) =>
        ["REVIEW_REQUIRED", "IN_REVIEW"].includes(item.status)
      ).length,
      pendingApprovalCount: pendingApprovals.length,
      evidence: evidence.map(mapEvidenceItem),
      requirements: requirements.map(mapEvidenceItem),
      approvals: deployment.approvals.map((approval) => ({
        title: approval.title,
        role: approval.role,
        approver: approval.approver.name,
        status: approval.status,
        decidedAt: approval.decidedAt,
      })),
      latestChange: latestChange
        ? {
            code: latestChange.code,
            status: latestChange.status,
            author: latestChange.author.name,
            createdAt: latestChange.createdAt,
            beforeSnapshotCode: latestChange.beforeSnapshot.code,
            afterSnapshotCode: latestChange.afterSnapshot.code,
            diff: parseJson<ChangeDiffEntry[]>(latestChange.diff, []),
            openImpactItems: latestChange.impactItems.filter((item) =>
              ["PENDING", "IN_REVIEW"].includes(item.status)
            ).length,
            impactItems: latestChange.impactItems
              .slice()
              .sort((a, b) => {
                const severity = { HIGH: 0, MEDIUM: 1, LOW: 2 } as Record<string, number>;
                return (severity[a.severity] ?? 9) - (severity[b.severity] ?? 9);
              })
              .map((item) => ({
                targetType: item.targetType,
                title: item.title,
                reason: item.reason,
                suggestedAction: item.suggestedAction,
                severity: item.severity,
                status: item.status,
              })),
          }
        : null,
      latestIncident: latestIncident
        ? {
            code: latestIncident.code,
            status: latestIncident.status,
            severity: latestIncident.severity,
            description: latestIncident.description,
            occurredAt: latestIncident.occurredAt,
            baselineIdAtTime: latestIncident.baselineIdAtTime,
            snapshotIdAtTime: latestIncident.snapshotIdAtTime,
          }
        : null,
    },
    incidents: incidentQueue.map((incident) => ({
      code: incident.code,
      occurredAt: incident.occurredAt,
      deploymentCode: incident.deployment.code,
      deploymentName: incident.deployment.name,
      robotCode: incident.robot.code,
      robotModel: incident.robot.model,
      description: incident.description,
      severity: incident.severity,
      status: incident.status,
      baselineCode: incident.baselineIdAtTime
        ? baselineCodeById.get(incident.baselineIdAtTime) ?? "Unknown"
        : "Unknown",
      snapshotCode: incident.snapshotIdAtTime
        ? snapshotCodeById.get(incident.snapshotIdAtTime) ?? "Unknown"
        : "Unknown",
      timeline: parseJson<IncidentTimelineEntry[]>(incident.timeline, []),
    })),
  };
}
