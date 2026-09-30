import { prisma } from "./prisma";

/**
 * Global search (spec §7.1): robots, deployments, evidence/requirements and
 * changes by code or title. SQLite LIKE is case-insensitive for ASCII.
 */
export async function search(q: string) {
  const term = q.trim();
  if (!term) return { robots: [], deployments: [], evidence: [], changes: [], total: 0 };

  const [robots, deployments, evidence, changes] = await Promise.all([
    prisma.robot.findMany({
      where: { OR: [{ code: { contains: term } }, { model: { contains: term } }, { serialNumber: { contains: term } }] },
      take: 10,
    }),
    prisma.deployment.findMany({
      where: { OR: [{ code: { contains: term } }, { name: { contains: term } }] },
      include: { customer: true },
      take: 10,
    }),
    prisma.evidenceItem.findMany({
      where: { archivedAt: null, OR: [{ code: { contains: term } }, { title: { contains: term } }] },
      include: { deployment: true },
      take: 10,
    }),
    prisma.change.findMany({
      where: { code: { contains: term } },
      include: { deployment: true, robot: true },
      take: 10,
    }),
  ]);

  return {
    robots: robots.map((r) => ({ code: r.code, model: r.model, status: r.status })),
    deployments: deployments.map((d) => ({ code: d.code, name: d.name, customer: d.customer.name })),
    evidence: evidence.map((e) => ({ code: e.code, title: e.title, category: e.category, deployment: e.deployment.name })),
    changes: changes.map((c) => ({ code: c.code, deployment: c.deployment.name, robot: c.robot.code, status: c.status })),
    total: robots.length + deployments.length + evidence.length + changes.length,
  };
}
