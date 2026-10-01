import { prisma } from "./prisma";
import { parseJson, parseSlots } from "@/lib/domain/json";

type IncidentTimelineEntry = { at: string; note: string };
type ChangeDiffEntry = { slot: string; before: string | null; after: string | null; type: string };

const OPEN_ITEM_STATUSES = ["MISSING", "NOT_STARTED", "PENDING", "IN_REVIEW", "REVIEW_REQUIRED"];
const OPEN_APPROVAL_STATUSES = ["PENDING", "REQUIRED", "NOT_STARTED"];

export async function getHorizontalPlatformData() {
  const [
    deployment,
    portfolioDeployments,
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
    prisma.deployment.findMany({
      include: {
        customer: true,
        site: true,
        task: true,
        activeBaseline: { include: { snapshot: true } },
        deploymentRobots: { include: { robot: true } },
        evidenceItems: {
          where: { archivedAt: null },
          include: { owner: true },
          orderBy: { code: "asc" },
        },
        approvals: { include: { approver: true }, orderBy: { title: "asc" } },
        changes: {
          include: { impactItems: true, author: true },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { code: "asc" },
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
    OPEN_APPROVAL_STATUSES.includes(approval.status)
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

  const buyerPortfolio = portfolioDeployments.map((item) => {
    const robot = item.deploymentRobots[0]?.robot ?? null;
    const openRequirements = item.evidenceItems.filter((ev) =>
      ev.category === "REQUIREMENT" && ev.required && OPEN_ITEM_STATUSES.includes(ev.status)
    );
    const missingRequired = item.evidenceItems.filter((ev) => ev.required && ev.status === "MISSING");
    const pendingNamedApprovals = item.approvals.filter((approval) =>
      OPEN_APPROVAL_STATUSES.includes(approval.status)
    );
    const materialChanges = item.changes.filter((change) => change.status === "REVIEW_REQUIRED");
    const reviewItems = item.evidenceItems.filter((ev) =>
      ["IN_REVIEW", "REVIEW_REQUIRED", "NOT_STARTED"].includes(ev.status)
    );

    const readinessStatus =
      missingRequired.length > 0 || materialChanges.length > 0 || pendingNamedApprovals.length > 0
        ? "REVIEW REQUIRED"
        : reviewItems.length > 0
          ? "IN REVIEW"
          : "READY";

    return {
      code: item.code,
      name: item.name,
      customer: item.customer.name,
      country: item.customer.country,
      site: item.site.name,
      city: item.site.city,
      task: item.task.name,
      lifecycle: item.lifecycle,
      operationalState: item.operationalState,
      operatingMode: item.operatingMode,
      humanExposure: item.humanExposure,
      robot: robot ? `${robot.code} · ${robot.model}` : "—",
      baselineCode: item.activeBaseline?.code ?? "—",
      snapshotCode: item.activeBaseline?.snapshot.code ?? "—",
      readinessStatus,
      openRequirements: openRequirements.length,
      missingRequired: missingRequired.length,
      pendingApprovals: pendingNamedApprovals.length,
      openChanges: materialChanges.length,
    };
  });

  const reviewQueue = portfolioDeployments
    .flatMap((item) => {
      const evidenceRows = item.evidenceItems
        .filter((ev) => ev.required && OPEN_ITEM_STATUSES.includes(ev.status))
        .map((ev) => ({
          id: `evidence:${ev.code}`,
          type: ev.category === "REQUIREMENT" ? "Requirement" : "Evidence",
          code: ev.code,
          title: ev.title,
          deploymentCode: item.code,
          deploymentName: item.name,
          customer: item.customer.name,
          owner: ev.owner.name,
          status: ev.status,
          priority: ev.criticality,
          dueDate: ev.dueDate,
          detail: ev.readinessCategory.replaceAll("_", " "),
        }));

      const approvalRows = item.approvals
        .filter((approval) => OPEN_APPROVAL_STATUSES.includes(approval.status))
        .map((approval) => ({
          id: `approval:${item.code}:${approval.title}`,
          type: "Approval",
          code: "—",
          title: approval.title,
          deploymentCode: item.code,
          deploymentName: item.name,
          customer: item.customer.name,
          owner: approval.approver.name,
          status: approval.status,
          priority: "HIGH",
          dueDate: null as Date | null,
          detail: approval.readinessCategory.replaceAll("_", " "),
        }));

      const changeRows = item.changes
        .filter((change) => change.status === "REVIEW_REQUIRED")
        .map((change) => ({
          id: `change:${change.code}`,
          type: "Change",
          code: change.code,
          title: "Material configuration change",
          deploymentCode: item.code,
          deploymentName: item.name,
          customer: item.customer.name,
          owner: change.author.name,
          status: change.status,
          priority: change.impactItems.some((impact) => impact.severity === "HIGH" && ["PENDING", "IN_REVIEW"].includes(impact.status))
            ? "HIGH"
            : "MEDIUM",
          dueDate: null as Date | null,
          detail: `${change.impactItems.filter((impact) => ["PENDING", "IN_REVIEW"].includes(impact.status)).length} impact items open`,
        }));

      return [...evidenceRows, ...approvalRows, ...changeRows];
    })
    .sort((a, b) => {
      const priority = { HIGH: 0, MEDIUM: 1, LOW: 2 } as Record<string, number>;
      return (priority[a.priority] ?? 9) - (priority[b.priority] ?? 9) || a.deploymentCode.localeCompare(b.deploymentCode);
    });

  return {
    portfolio: {
      activeDeployments,
      activeRobots,
      openChanges,
      openIncidents,
      missingEvidence,
      reviewEvidence,
      deployments: buyerPortfolio,
      reviewQueue,
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
