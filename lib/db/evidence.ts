import { prisma } from "./prisma";
import { parseSlots } from "@/lib/domain/json";
import type { EvidenceCategory } from "@/lib/domain/enums";

export interface EvidenceFilters {
  deploymentCode?: string;
  status?: string;
  criticality?: string;
  kind?: string;
}

export async function getEvidenceList(category: EvidenceCategory, filters: EvidenceFilters) {
  const dep = filters.deploymentCode
    ? await prisma.deployment.findUnique({ where: { code: filters.deploymentCode }, select: { id: true } })
    : null;

  const rows = await prisma.evidenceItem.findMany({
    where: {
      category,
      archivedAt: null,
      ...(dep ? { deploymentId: dep.id } : {}),
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.criticality ? { criticality: filters.criticality } : {}),
      ...(filters.kind ? { kind: filters.kind } : {}),
    },
    include: { owner: true, deployment: true },
    orderBy: { code: "asc" },
  });

  return rows.map((r) => ({
    id: r.id,
    code: r.code,
    title: r.title,
    category: r.category,
    kind: r.kind,
    readinessCategory: r.readinessCategory,
    source: r.source,
    deploymentCode: r.deployment.code,
    deploymentName: r.deployment.name,
    scopeSlots: parseSlots(r.scopeSlots),
    criticality: r.criticality,
    status: r.status,
    required: r.required,
    applicable: r.applicable,
    ownerPersonId: r.ownerPersonId,
    ownerName: r.owner.name,
    uri: r.uri ?? "",
    fileSha256: r.fileSha256 ?? "",
    dueDate: r.dueDate ? r.dueDate.toISOString().slice(0, 10) : "",
  }));
}

export async function getFormOptions() {
  const [deployments, persons] = await Promise.all([
    prisma.deployment.findMany({ select: { code: true, name: true }, orderBy: { code: "asc" } }),
    prisma.person.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);
  return { deployments, persons };
}
