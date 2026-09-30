"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { hashToken } from "@/lib/db/share";
import { getActor } from "./context";
import { writeAudit } from "@/lib/db/audit";
import { SHARE_VIEWS } from "@/lib/domain/enums";
import { z } from "zod";
import type { ActionResult } from "./changes";

const createSchema = z.object({
  view: z.enum(SHARE_VIEWS),
  targetId: z.string().min(1),
  audienceLabel: z.string().trim().min(1, "Audience label is required").max(80),
  expiresInDays: z.coerce.number().int().min(1).max(365).default(30),
});

/** Create a read-only Share link (spec §7.8). The raw token is returned once. */
export async function createShareLink(raw: unknown): Promise<ActionResult<{ token: string }>> {
  const parsed = createSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const actor = await getActor();

  const token = randomBytes(24).toString("base64url");
  const expiresAt = new Date(Date.now() + parsed.data.expiresInDays * 86400_000);

  await prisma.$transaction(async (tx) => {
    const link = await tx.shareLink.create({
      data: {
        tokenHash: hashToken(token), view: parsed.data.view, targetId: parsed.data.targetId,
        audienceLabel: parsed.data.audienceLabel, createdById: actor.id, expiresAt,
      },
    });
    await writeAudit(tx, { actorId: actor.id, action: "SHARE_CREATED", entityType: "ShareLink", entityId: link.id, after: { view: parsed.data.view, audience: parsed.data.audienceLabel, expiresAt } });
  });

  revalidatePath("/reports");
  return { ok: true, data: { token } };
}

export async function revokeShareLink(id: string): Promise<ActionResult> {
  const actor = await getActor();
  const link = await prisma.shareLink.findUnique({ where: { id } });
  if (!link) return { ok: false, error: "Link not found" };
  await prisma.$transaction(async (tx) => {
    await tx.shareLink.update({ where: { id }, data: { revokedAt: new Date() } });
    await writeAudit(tx, { actorId: actor.id, action: "SHARE_REVOKED", entityType: "ShareLink", entityId: id });
  });
  revalidatePath("/reports");
  return { ok: true, data: undefined };
}
