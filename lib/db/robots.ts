import { prisma } from "./prisma";
import { parseJson } from "@/lib/domain/json";
import { diffSnapshots } from "@/lib/engine/diff";
import type { ConfigItemInput, DiffEntry } from "@/lib/domain/types";
import type { Slot } from "@/lib/domain/enums";

function toConfigItems(items: { slot: string; value: string }[]): ConfigItemInput[] {
  return items.map((i) => ({ slot: i.slot as Slot, value: i.value, vendor: null, version: null }));
}

export async function getRobotList() {
  const robots = await prisma.robot.findMany({
    include: {
      deploymentRobots: { include: { deployment: { include: { activeBaseline: { include: { snapshot: true } } } } } },
      snapshots: { orderBy: { createdAt: "desc" }, take: 1 },
      changes: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { code: "asc" },
  });

  return robots.map((r) => {
    const dep = r.deploymentRobots[0]?.deployment ?? null;
    return {
      code: r.code,
      model: r.model,
      serialNumber: r.serialNumber,
      status: r.status,
      deploymentName: dep?.name ?? null,
      deploymentCode: dep?.code ?? null,
      activeSnapshotCode: dep?.activeBaseline?.snapshot.code ?? r.snapshots[0]?.code ?? "—",
      lastChangeCode: r.changes[0]?.code ?? null,
      lastChangeAt: r.changes[0]?.createdAt ?? null,
    };
  });
}

export async function getRobotDetail(code: string) {
  const robot = await prisma.robot.findUnique({
    where: { code },
    include: {
      deploymentRobots: { include: { deployment: { include: { activeBaseline: { include: { snapshot: true } }, customer: true, evidenceItems: { include: { owner: true } } } } } },
      snapshots: { include: { items: true, parentSnapshot: { include: { items: true } }, createdBy: true }, orderBy: { createdAt: "desc" } },
      changes: { include: { author: true }, orderBy: { createdAt: "desc" } },
      incidents: { include: { deployment: true }, orderBy: { occurredAt: "desc" } },
    },
  });
  if (!robot) return null;

  const deployments = robot.deploymentRobots.map((dr) => dr.deployment);
  const activeSnapshot =
    deployments.find((d) => d.activeBaseline?.snapshot.robotId === robot.id)?.activeBaseline?.snapshot ??
    robot.snapshots[0] ??
    null;
  const activeSnapshotItems = activeSnapshot
    ? (await prisma.configurationSnapshot.findUnique({ where: { id: activeSnapshot.id }, include: { items: true } }))?.items ?? []
    : [];

  const history = robot.snapshots.map((s) => {
    const diff: DiffEntry[] = s.parentSnapshot
      ? diffSnapshots(toConfigItems(s.parentSnapshot.items), toConfigItems(s.items))
      : [];
    return { code: s.code, createdAt: s.createdAt, note: s.note, author: s.createdBy.name, diff };
  });

  const evidence = deployments.flatMap((d) =>
    d.evidenceItems.filter((e) => e.archivedAt === null).map((e) => ({ code: e.code, title: e.title, deploymentName: d.name, status: e.status, criticality: e.criticality }))
  );

  return {
    robot,
    deployments: deployments.map((d) => ({ code: d.code, name: d.name, customerName: d.customer.name })),
    activeSnapshotCode: activeSnapshot?.code ?? "—",
    activeSnapshotItems,
    history,
    changes: robot.changes.map((c) => ({ code: c.code, diff: parseJson<DiffEntry[]>(c.diff, []), createdAt: c.createdAt, status: c.status, author: c.author.name })),
    evidence,
    incidents: robot.incidents.map((i) => ({ code: i.code, occurredAt: i.occurredAt, description: i.description, severity: i.severity, status: i.status, deploymentName: i.deployment.name })),
  };
}
