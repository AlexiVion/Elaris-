import { prisma } from "./prisma";

/**
 * Attention Required count (spec §7.1 bell + §7.2). Real, computed count of:
 * changes in REVIEW_REQUIRED + approvals pending/required + impact items still
 * open after a change. Never hardcoded.
 */
export async function getAttentionCount(): Promise<number> {
  const [changes, approvals, impacts] = await Promise.all([
    prisma.change.count({ where: { status: "REVIEW_REQUIRED" } }),
    prisma.approval.count({ where: { status: { in: ["PENDING", "REQUIRED"] } } }),
    prisma.impactItem.count({ where: { status: { in: ["PENDING", "IN_REVIEW"] } } }),
  ]);
  return changes + approvals + impacts;
}
