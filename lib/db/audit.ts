import type { Prisma, PrismaClient } from "@prisma/client";
import { serializeJson } from "@/lib/domain/json";

type Db = PrismaClient | Prisma.TransactionClient;

/**
 * Append-only audit (spec §1.1, §6.8). Every mutation records actor, action and
 * before/after state. Nothing is ever deleted. Call within the same transaction
 * as the mutation when possible.
 */
export async function writeAudit(
  db: Db,
  event: {
    actorId: string;
    action: string;
    entityType: string;
    entityId: string;
    before?: unknown;
    after?: unknown;
  }
) {
  await db.auditEvent.create({
    data: {
      actorId: event.actorId,
      action: event.action,
      entityType: event.entityType,
      entityId: event.entityId,
      before: serializeJson(event.before ?? null),
      after: serializeJson(event.after ?? null),
    },
  });
}
