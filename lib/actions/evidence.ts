"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { getActor } from "./context";
import { writeAudit } from "@/lib/db/audit";
import { evidenceSchema } from "@/lib/domain/schemas";
import { serializeSlots } from "@/lib/domain/json";
import type { ActionResult } from "./changes";

function revalidateEvidence(deploymentCode?: string) {
  revalidatePath("/evidence");
  revalidatePath("/requirements");
  revalidatePath("/");
  if (deploymentCode) revalidatePath(`/deployments/${deploymentCode}`);
}

export async function saveEvidence(raw: unknown): Promise<ActionResult<{ code: string }>> {
  const parsed = evidenceSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const v = parsed.data;
  const actor = await getActor();

  const dep = await prisma.deployment.findUnique({ where: { code: v.deploymentCode } });
  if (!dep) return { ok: false, error: "Deployment not found" };

  const data = {
    title: v.title, category: v.category, kind: v.kind, readinessCategory: v.readinessCategory, source: v.source,
    deploymentId: dep.id, scopeSlots: serializeSlots(v.scopeSlots), criticality: v.criticality, status: v.status,
    required: v.required, applicable: v.applicable, ownerPersonId: v.ownerPersonId,
    uri: v.uri ?? null, fileSha256: v.fileSha256 ?? null,
    dueDate: v.dueDate ? new Date(v.dueDate) : null,
  };

  try {
    if (v.id) {
      const before = await prisma.evidenceItem.findUnique({ where: { id: v.id } });
      if (!before) return { ok: false, error: "Item not found" };
      await prisma.$transaction(async (tx) => {
        await tx.evidenceItem.update({ where: { id: v.id }, data });
        await writeAudit(tx, { actorId: actor.id, action: "EVIDENCE_UPDATED", entityType: "EvidenceItem", entityId: before.code, before: { status: before.status }, after: { status: v.status } });
      });
      revalidateEvidence(v.deploymentCode);
      return { ok: true, data: { code: before.code } };
    }

    const exists = await prisma.evidenceItem.findUnique({ where: { code: v.code } });
    if (exists) return { ok: false, error: `Code ${v.code} already exists` };
    await prisma.$transaction(async (tx) => {
      await tx.evidenceItem.create({ data: { code: v.code, ...data } });
      await writeAudit(tx, { actorId: actor.id, action: "EVIDENCE_ADDED", entityType: "EvidenceItem", entityId: v.code, after: { status: v.status } });
    });
    revalidateEvidence(v.deploymentCode);
    return { ok: true, data: { code: v.code } };
  } catch {
    return { ok: false, error: "Could not save the item" };
  }
}

/** Nothing is deleted — items are archived (spec §1.1). */
export async function archiveEvidence(id: string): Promise<ActionResult> {
  const actor = await getActor();
  const ev = await prisma.evidenceItem.findUnique({ where: { id }, include: { deployment: true } });
  if (!ev) return { ok: false, error: "Item not found" };
  await prisma.$transaction(async (tx) => {
    await tx.evidenceItem.update({ where: { id }, data: { archivedAt: new Date() } });
    await writeAudit(tx, { actorId: actor.id, action: "EVIDENCE_ARCHIVED", entityType: "EvidenceItem", entityId: ev.code });
  });
  revalidateEvidence(ev.deployment.code);
  return { ok: true, data: undefined };
}
