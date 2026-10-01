import { prisma } from "./prisma";

export async function getHorizontalPlatformData() {
  const [deployment, activeDeployments, activeRobots, openChanges, openIncidents, missingEvidence, reviewEvidence] =
    await Promise.all([
      prisma.deployment.findUnique({
        where: { code: "DEP-0017" },
        include: {
          customer: true,
          site: true,
          task: true,
          activeBaseline: { include: { snapshot: true } },
          deploymentRobots: { include: { robot: true } },
          evidenceItems: { where: { archivedAt: null }, orderBy: { code: "asc" } },
          approvals: { include: { approver: true }, orderBy: { title: "asc" } },
          changes: {
            include: { impactItems: true },
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
      lifecycle: deployment.lifecycle,
      operationalState: deployment.operationalState,
      operatingMode: deployment.operatingMode,
      humanExposure: deployment.humanExposure,
      customer: deployment.customer.name,
      site: deployment.site.name,
      city: deployment.site.city,
      country: deployment.site.country,
      task: deployment.task.name,
      robot: activeRobot ? `${activeRobot.code} · ${activeRobot.model}` : "—",
      baselineCode: deployment.activeBaseline?.code ?? "—",
      snapshotCode: deployment.activeBaseline?.snapshot.code ?? "—",
      evidenceCount: evidence.length,
      requirementCount: requirements.length,
      missingCount: deployment.evidenceItems.filter((item) => item.status === "MISSING").length,
      reviewCount: deployment.evidenceItems.filter((item) => item.status === "REVIEW_REQUIRED").length,
      pendingApprovalCount: pendingApprovals.length,
      approvals: deployment.approvals.map((approval) => ({
        title: approval.title,
        role: approval.role,
        approver: approval.approver.name,
        status: approval.status,
      })),
      latestChange: latestChange
        ? {
            code: latestChange.code,
            status: latestChange.status,
            openImpactItems: latestChange.impactItems.filter((item) =>
              ["PENDING", "IN_REVIEW"].includes(item.status)
            ).length,
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
  };
}
