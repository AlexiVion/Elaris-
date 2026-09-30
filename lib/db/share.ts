import { createHash } from "node:crypto";
import { prisma } from "./prisma";

/** Share tokens are stored hashed (spec §7.8) — the raw token lives only in the URL. */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function getShareLinks(view: string, targetId: string) {
  const rows = await prisma.shareLink.findMany({
    where: { view, targetId },
    include: { createdBy: true },
    orderBy: { expiresAt: "desc" },
  });
  const now = new Date();
  return rows.map((s) => ({
    id: s.id,
    view: s.view,
    audienceLabel: s.audienceLabel,
    createdBy: s.createdBy.name,
    expiresAt: s.expiresAt,
    revokedAt: s.revokedAt,
    active: !s.revokedAt && s.expiresAt > now,
  }));
}

/** Resolve a raw token to a share link, enforcing revocation + expiry. */
export async function resolveShareToken(token: string) {
  const link = await prisma.shareLink.findUnique({ where: { tokenHash: hashToken(token) } });
  if (!link) return { status: "not_found" as const };
  if (link.revokedAt) return { status: "revoked" as const };
  if (link.expiresAt <= new Date()) return { status: "expired" as const };
  return { status: "ok" as const, link };
}
