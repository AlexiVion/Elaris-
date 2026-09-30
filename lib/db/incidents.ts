import { prisma } from "./prisma";
import { parseJson } from "@/lib/domain/json";

export async function getIncidentList() {
  const rows = await prisma.incident.findMany({
    include: { robot: true, deployment: true },
    orderBy: { occurredAt: "desc" },
  });
  return rows.map((i) => ({
    id: i.id,
    code: i.code,
    occurredAt: i.occurredAt,
    deploymentName: i.deployment.name,
    robotCode: i.robot.code,
    description: i.description,
    severity: i.severity,
    status: i.status,
    baselineIdAtTime: i.baselineIdAtTime,
    snapshotIdAtTime: i.snapshotIdAtTime,
    timeline: parseJson<{ at: string; note: string }[]>(i.timeline, []),
  }));
}

export async function getIncidentOptions() {
  const deployments = await prisma.deployment.findMany({
    include: { deploymentRobots: { include: { robot: true } } },
    orderBy: { code: "asc" },
  });
  return deployments.map((d) => ({
    code: d.code,
    name: d.name,
    robots: d.deploymentRobots.map((dr) => ({ id: dr.robot.id, code: dr.robot.code })),
  }));
}
