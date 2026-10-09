/**
 * Integration tests for Share View (spec §7.8, acceptance flow D): a read-only
 * link with a hashed token, expiry and revocation. Runs against a throwaway
 * copy of the seeded DB.
 */
import { describe, it, expect, beforeAll, vi } from "vitest";
import { copyFileSync } from "node:fs";
import { resolve } from "node:path";

vi.mock("next/cache", () => ({ revalidatePath: () => {}, revalidateTag: () => {} }));
vi.mock("next/headers", () => ({
  cookies: () => ({ get: () => ({ value: (globalThis as Record<string, unknown>).__ELARIS_TEST_VIEWER }) }),
}));

// Use a separately named throwaway copy of the seeded DB. The isolated
// Evidence Pack gate supplies both variables so it never touches dev.db.
// Defaults preserve the existing local test workflow.
const seededDb = process.env.ELARIS_TEST_SEEDED_DB ?? "prisma/dev.db";
const testDbName = process.env.ELARIS_TEST_SHARE_DB_NAME ?? "test-share.db";
if (!/^[A-Za-z0-9._-]+\.db$/.test(testDbName) || testDbName.includes("..")) {
  throw new Error("Invalid share test-only SQLite filename");
}
process.env.DATABASE_URL = `file:./${testDbName}`;
copyFileSync(resolve(seededDb), resolve("prisma", testDbName));

let shareActions: typeof import("@/lib/actions/share");
let shareDb: typeof import("@/lib/db/share");
let prisma: typeof import("@/lib/db/prisma")["prisma"];

beforeAll(async () => {
  ({ prisma } = await import("@/lib/db/prisma"));
  shareActions = await import("@/lib/actions/share");
  shareDb = await import("@/lib/db/share");
  const person = await prisma.person.findFirst();
  (globalThis as Record<string, unknown>).__ELARIS_TEST_VIEWER = person!.id;
});

describe("Share View (spec §7.8)", () => {
  it("requires an audience label", async () => {
    const r = await shareActions.createShareLink({ view: "READINESS_PACK", targetId: "DEP-0017", audienceLabel: "", expiresInDays: 30 });
    expect(r.ok).toBe(false);
  });

  it("creates a link that resolves read-only, then revokes it", async () => {
    const r = await shareActions.createShareLink({ view: "READINESS_PACK", targetId: "DEP-0017", audienceLabel: "Customer", expiresInDays: 30 });
    expect(r.ok).toBe(true);
    if (!r.ok) return;

    const resolved = await shareDb.resolveShareToken(r.data.token);
    expect(resolved.status).toBe("ok");
    if (resolved.status !== "ok") return;
    expect(resolved.link.view).toBe("READINESS_PACK");
    expect(resolved.link.targetId).toBe("DEP-0017");

    // The raw token is NOT stored — only its hash.
    const stored = await prisma.shareLink.findUnique({ where: { id: resolved.link.id } });
    expect(stored!.tokenHash).toBe(shareDb.hashToken(r.data.token));
    expect(stored!.tokenHash).not.toBe(r.data.token);

    // Audit trail.
    const audit = await prisma.auditEvent.findFirst({ where: { action: "SHARE_CREATED", entityId: resolved.link.id } });
    expect(audit).not.toBeNull();

    // Revoke → the link stops working.
    const rev = await shareActions.revokeShareLink(resolved.link.id);
    expect(rev.ok).toBe(true);
    const after = await shareDb.resolveShareToken(r.data.token);
    expect(after.status).toBe("revoked");
  });

  it("rejects an expired link", async () => {
    const token = "expired-token-fixture";
    const person = await prisma.person.findFirst();
    await prisma.shareLink.create({
      data: {
        tokenHash: shareDb.hashToken(token), view: "CHANGE_IMPACT", targetId: "CHG-0005",
        audienceLabel: "Safety", createdById: person!.id, expiresAt: new Date(Date.now() - 86400_000),
      },
    });
    const resolved = await shareDb.resolveShareToken(token);
    expect(resolved.status).toBe("expired");
  });

  it("returns not_found for an unknown token", async () => {
    const resolved = await shareDb.resolveShareToken("does-not-exist");
    expect(resolved.status).toBe("not_found");
  });
});
