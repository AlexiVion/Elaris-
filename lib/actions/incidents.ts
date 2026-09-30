"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { getActor } from "./context";
import { writeAudit } from "@/lib/db/audit";
import { incidentSchema } from "@/lib/domain/schemas";
import { nextIncidentCode } from "@/lib/db/codes";
import { serializeJson } from "@/lib/domain/json";
import type { ActionResult } from "./changes";

/** Create an incident (spec §7.7): the active baseline + snapshot are linked automatically. */
export async function createIncident(raw: unknown): Promise<ActionResult<{ code: string }>> {
  const parsed = incidentSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const v = parsed.data;
  const actor = await getActor();

  const dep = await prisma.deployment.findUnique({
    where: { code: v.deploymentCode },
    include: { activeBaseline: true },
  });
  if (!dep) return { ok: false, error: "Deployment not found" };

  const occurredAt = new Date(v.occurredAt);
  const year = occurredAt.getUTCFullYear();
  const code = await nextIncidentCode(Number.isFinite(year) ? year : new Date().getUTCFullYear());

  await prisma.$transaction(async (tx) => {
    await tx.incident.create({
      data: {
        code, occurredAt, deploymentId: dep.id, robotId: v.robotId, description: v.description,
        severity: v.severity, status: "OPEN",
        baselineIdAtTime: dep.activeBaselineId ?? null,
        snapshotIdAtTime: dep.activeBaseline?.snapshotId ?? null,
        timeline: serializeJson(v.timeline),
      },
    });
    await writeAudit(tx, { actorId: actor.id, action: "INCIDENT_LOGGED", entityType: "Incident", entityId: code, after: { severity: v.severity } });
  });

  revalidatePath("/incidents");
  revalidatePath("/");
  revalidatePath(`/deployments/${v.deploymentCode}`);
  return { ok: true, data: { code } };
}
