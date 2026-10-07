/**
 * Integration tests for the write flows (Server Actions) against a throwaway
 * copy of the seeded SQLite DB. next/headers (the "Viewing as" cookie) and
 * next/cache are mocked; everything else is the real action code + Prisma.
 *
 * Covers acceptance §10: approval gating (SAFETY_LEAD only, blocked on HIGH
 * pending), waiver needs justification, approving creates a new baseline while
 * the old stays in history, every mutation writes an AuditEvent, and creating a
 * change flips affected evidence.
 */
import { describe, it, expect, beforeAll, vi } from "vitest";
import { copyFileSync } from "node:fs";
import { resolve } from "node:path";

vi.mock("next/cache", () => ({ revalidatePath: () => {}, revalidateTag: () => {} }));
vi.mock("next/headers", () => ({
  cookies: () => ({ get: () => ({ value: (globalThis as Record<string, unknown>).__ELARIS_TEST_VIEWER }) }),
}));

// Point Prisma at a fresh copy of the seeded DB before anything imports it.
process.env.DATABASE_URL = "file:./test-actions.db";
copyFileSync(resolve("prisma/dev.db"), resolve("prisma/test-actions.db"));

type Actions = typeof import("@/lib/actions/changes");
type Reports = typeof import("@/lib/db/reports");
type Prisma = typeof import("@/lib/db/prisma")["prisma"];

let actions: Actions;
let reports: Reports;
let prisma: Prisma;
let sarahId: string;
let juanId: string;
let jamesId: string;

const as = (id: string) => ((globalThis as Record<string, unknown>).__ELARIS_TEST_VIEWER = id);

beforeAll(async () => {
  ({ prisma } = await import("@/lib/db/prisma"));
  actions = await import("@/lib/actions/changes");
  reports = await import("@/lib/db/reports");
  const sarah = await prisma.person.findFirst({ where: { role: "SAFETY_LEAD" } });
  const juan = await prisma.person.findFirst({ where: { role: "ENGINEER" } });
  const james = await prisma.person.findFirst({ where: { role: "CUSTOMER_ENGINEER" } });
  sarahId = sarah!.id;
  juanId = juan!.id;
  jamesId = james!.id;
});

describe("Deployment Control V0.5.1 — institutional placement semantics", () => {
  it("represents the Humandroid G1 at Siglo 21 without invented customer, task or serial", async () => {
    const dep = await prisma.deployment.findUnique({
      where: { code: "DEP-S21-001" },
      include: {
        providerOrganization: true,
        customer: true,
        task: true,
        site: { include: { hostOrganization: true } },
        deploymentRobots: { include: { robot: true } },
        activeBaseline: true,
      },
    });

    expect(dep).not.toBeNull();
    expect(dep).toMatchObject({
      contextKind: "INSTITUTIONAL_PLACEMENT",
      operationalState: "PRESENT",
      customerId: null,
      taskId: null,
      lifecycle: null,
      operatingMode: null,
      humanExposure: null,
    });
    expect(dep!.providerOrganization?.name).toBe("Humandroid");
    expect(dep!.site.hostOrganization?.name).toBe("Universidad Siglo 21");
    expect(dep!.site.customerId).toBeNull();
    expect(dep!.site.environmentType).toBeNull();
    expect(dep!.deploymentRobots[0]?.robot.serialNumber).toBeNull();
    expect(dep!.activeBaseline?.taskSnapshot).toBeNull();

    const frozen = JSON.parse(dep!.activeBaseline!.environmentSnapshot) as {
      contextKind: string;
      providerOrganization: { name: string } | null;
      hostOrganization: { name: string } | null;
      customer: unknown;
      lifecycle: unknown;
      operatingMode: unknown;
      humanExposure: unknown;
    };
    expect(frozen.contextKind).toBe("INSTITUTIONAL_PLACEMENT");
    expect(frozen.providerOrganization?.name).toBe("Humandroid");
    expect(frozen.hostOrganization?.name).toBe("Universidad Siglo 21");
    expect(frozen.customer).toBeNull();
    expect(frozen.lifecycle).toBeNull();
    expect(frozen.operatingMode).toBeNull();
    expect(frozen.humanExposure).toBeNull();
  });

  it("keeps non-applicable customer and insurance readiness categories out of the denominator", async () => {
    const report = await reports.getReadinessPack("DEP-S21-001");
    expect(report).not.toBeNull();

    expect(report!.deployment).toMatchObject({
      contextKind: "INSTITUTIONAL_PLACEMENT",
      provider: "Humandroid",
      host: "Universidad Siglo 21",
      customer: null,
      task: null,
      lifecycle: null,
      operatingMode: null,
      humanExposure: null,
    });

    const categories = Object.fromEntries(
      report!.readiness.categories.map((item) => [item.category, item.status])
    );
    expect(categories.CUSTOMER_REQUIREMENTS).toBe("NOT_REQUESTED");
    expect(categories.INSURANCE).toBe("NOT_REQUESTED");
    expect(categories.SYSTEM_IDENTITY).toBe("REVIEW_REQUIRED");
    expect(report!.readiness.requiredTotal).toBe(0);
  });

  it("fails closed on change-impact analysis while human exposure is unknown", async () => {
    const result = await actions.previewChange({
      deploymentCode: "DEP-S21-001",
      edits: [{ slot: "CHASSIS", value: "Unitree G1 — changed test value" }],
      note: "test only",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/Human exposure context is required/i);
    }
  });

  it("preserves the existing commercial deployment semantics", async () => {
    const dep = await prisma.deployment.findUnique({
      where: { code: "DEP-0017" },
      include: { customer: true, task: true },
    });
    expect(dep?.contextKind).toBe("COMMERCIAL_DEPLOYMENT");
    expect(dep?.customer?.name).toBe("Northgas Energy");
    expect(dep?.task?.name).toBe("Valve manipulation");
    expect(dep?.lifecycle).toBe("PILOT");
    expect(dep?.humanExposure).toBe("SHARED_AREA");
  });
});

describe("approval gating & waiver (spec §6.4)", () => {
  it("an Engineer cannot approve", async () => {
    as(juanId);
    const r = await actions.approveChange({ changeCode: "CHG-0005" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/Safety Lead/i);
  });

  it("a Safety Lead is blocked while HIGH items are open", async () => {
    as(sarahId);
    const r = await actions.approveChange({ changeCode: "CHG-0005" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/high-impact/i);
  });

  it("a waiver requires a written justification", async () => {
    as(sarahId);
    const item = await prisma.impactItem.findFirst({ where: { change: { code: "CHG-0005" }, severity: "LOW" } });
    const r = await actions.waiveImpact({ itemId: item!.id, justification: "" });
    expect(r.ok).toBe(false);
  });

  it("re-run resolution requires evidence or a test result", async () => {
    as(sarahId);
    const item = await prisma.impactItem.findFirst({ where: { change: { code: "CHG-0005" }, suggestedAction: "RE_RUN", severity: "HIGH" } });
    const r = await actions.resolveImpact({ itemId: item!.id, note: "just a note" });
    expect(r.ok).toBe(false);
  });

  it("a Safety Lead cannot satisfy a Customer Engineer re-approval", async () => {
    as(sarahId);
    const item = await prisma.impactItem.findFirst({
      where: { change: { code: "CHG-0005" }, targetType: "APPROVAL", severity: "MEDIUM" },
    });
    const r = await actions.resolveImpact({ itemId: item!.id, note: "Reviewed by Safety" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/Only .* can record this re-approval/i);
  });

  it("affected approvals cannot be waived", async () => {
    as(sarahId);
    const item = await prisma.impactItem.findFirst({
      where: { change: { code: "CHG-0005" }, targetType: "APPROVAL" },
    });
    const r = await actions.waiveImpact({ itemId: item!.id, justification: "skip" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/cannot be waived/i);
  });
});

describe("create change flips affected evidence (spec §6.3)", () => {
  it("creates a snapshot + change + impact items and flips VALID evidence", async () => {
    as(juanId);
    const dep = await prisma.deployment.findUnique({
      where: { code: "DEP-0009" },
      include: { activeBaseline: { include: { snapshot: { include: { items: true } } } } },
    });
    const edits = dep!.activeBaseline!.snapshot.items.map((i) => ({
      slot: i.slot,
      value: i.slot === "HANDS" ? "Inspire RH56DFX" : i.value,
    }));

    const r = await actions.createChange({ deploymentCode: "DEP-0009", edits, note: "hand swap" });
    expect(r.ok).toBe(true);
    if (!r.ok) return;

    const change = await prisma.change.findUnique({ where: { code: r.data.code }, include: { impactItems: true } });
    expect(change!.status).toBe("REVIEW_REQUIRED");
    expect(change!.impactItems.length).toBeGreaterThan(0);

    // INT-060 (scope HANDS) was VALID → now REVIEW_REQUIRED.
    const int060 = await prisma.evidenceItem.findUnique({ where: { code: "INT-060" } });
    expect(int060!.status).toBe("REVIEW_REQUIRED");

    const audit = await prisma.auditEvent.findFirst({ where: { entityId: r.data.code, action: "CHANGE_CREATED" } });
    expect(audit).not.toBeNull();
  });
});

describe("full resolve + approve flow → new baseline (spec §6.4, §10)", () => {
  it("resolves HIGH items, approves as Safety Lead, freezes a new baseline", async () => {
    as(sarahId);
    const change = await prisma.change.findUnique({ where: { code: "CHG-0005" }, include: { impactItems: true } });
    const high = change!.impactItems.filter((i) => i.severity === "HIGH");
    expect(high.length).toBe(3);

    for (const it of high) {
      const r = it.suggestedAction === "RE_RUN"
        ? await actions.resolveImpact({ itemId: it.id, testDate: "2026-09-30", testResult: "Pass" })
        : await actions.resolveImpact({ itemId: it.id, note: "Reviewed / re-approved by Safety Lead" });
      expect(r.ok).toBe(true);
    }

    const blocked = await actions.approveChange({ changeCode: "CHG-0005" });
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) expect(blocked.error).toMatch(/re-approvals/i);

    const customerApprovalImpact = await prisma.impactItem.findFirst({
      where: { change: { code: "CHG-0005" }, targetType: "APPROVAL", severity: "MEDIUM" },
    });
    as(jamesId);
    const reapproved = await actions.resolveImpact({
      itemId: customerApprovalImpact!.id,
      note: "Customer engineering reviewed the hand change",
    });
    expect(reapproved.ok).toBe(true);

    as(sarahId);
    const r = await actions.approveChange({ changeCode: "CHG-0005" });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.data.baselineCode).toBe("B-0017-02");

    const dep = await prisma.deployment.findUnique({ where: { code: "DEP-0017" }, include: { baselines: true } });
    const active = await prisma.baseline.findUnique({ where: { id: dep!.activeBaselineId! } });
    expect(active!.code).toBe("B-0017-02");

    // A baseline freezes the full deployment context needed to reconstruct
    // what was approved, rather than placeholder deployment IDs / empty JSON.
    const taskState = JSON.parse(active!.taskSnapshot!) as { name: string; parameters: Record<string, unknown> };
    expect(taskState.name).toBe("Valve manipulation");
    expect(taskState.parameters).toMatchObject({ torqueLimitNm: 12 });

    const environmentState = JSON.parse(active!.environmentSnapshot) as {
      customer: { name: string };
      site: { name: string; environmentType: string };
      operatingMode: string;
      humanExposure: string;
    };
    expect(environmentState.customer.name).toBe("Northgas Energy");
    expect(environmentState.site.name).toBe("North gas facility");
    expect(environmentState.site.environmentType).toBe("GAS_FACILITY");
    expect(environmentState.operatingMode).toBe("SUPERVISED");
    expect(environmentState.humanExposure).toBe("SHARED_AREA");

    const evidenceState = JSON.parse(active!.evidenceState) as Array<{ code: string; status: string; ownerPersonId: string }>;
    expect(evidenceState.some((e) => e.code === "INT-042" && e.status === "VALID" && !!e.ownerPersonId)).toBe(true);

    const approvalState = JSON.parse(active!.approvalState) as Array<{ title: string; role: string; status: string }>;
    expect(approvalState.some((a) => a.title === "Safety approval" && a.role === "SAFETY_LEAD")).toBe(true);

    // The previous baseline is still in history (spec §10).
    expect(dep!.baselines.some((b) => b.code === "B-0017-01")).toBe(true);

    const approved = await prisma.change.findUnique({ where: { code: "CHG-0005" } });
    expect(approved!.status).toBe("APPROVED");
    expect(approved!.approvedById).toBe(sarahId);

    const audit = await prisma.auditEvent.findMany({ where: { entityId: "CHG-0005", action: "CHANGE_APPROVED" } });
    expect(audit.length).toBeGreaterThan(0);

    // INT-042 was resolved via re-run → back to VALID.
    const int042 = await prisma.evidenceItem.findUnique({ where: { code: "INT-042" } });
    expect(int042!.status).toBe("VALID");
  });

  it("cannot approve an already-approved change", async () => {
    as(sarahId);
    const r = await actions.approveChange({ changeCode: "CHG-0005" });
    expect(r.ok).toBe(false);
  });
});
