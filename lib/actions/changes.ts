"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { getActor } from "./context";
import { writeAudit } from "@/lib/db/audit";
import { nextChangeCode, nextSnapshotCodeForRobot, nextBaselineCode } from "@/lib/db/codes";
import { hashSnapshot } from "@/lib/engine/hash";
import { diffSnapshots } from "@/lib/engine/diff";
import { computeImpact } from "@/lib/engine/impact";
import { toEvidenceInput, toApprovalInput, type EvidenceRow, type ApprovalRow } from "@/lib/db/metrics";
import { parseJson, serializeJson } from "@/lib/domain/json";
import {
  changeEditsSchema, resolveImpactSchema, waiveImpactSchema, assignImpactSchema,
  reviewImpactSchema, approveChangeSchema,
} from "@/lib/domain/schemas";
import type { ConfigItemInput, ImpactResult } from "@/lib/domain/types";
import type { HumanExposure } from "@/lib/domain/enums";

export type ActionResult<T = void> = { ok: true; data: T } | { ok: false; error: string };

const changeInclude = {
  deploymentRobots: { include: { robot: true } },
  activeBaseline: { include: { snapshot: { include: { items: true } } } },
  evidenceItems: true,
  approvals: true,
};

async function loadContext(deploymentCode: string) {
  const dep = await prisma.deployment.findUnique({ where: { code: deploymentCode }, include: changeInclude });
  if (!dep) return null;
  const robot = dep.deploymentRobots[0]?.robot ?? null;
  const before: ConfigItemInput[] = (dep.activeBaseline?.snapshot.items ?? []).map((i) => ({
    slot: i.slot as ConfigItemInput["slot"],
    value: i.value,
    vendor: null,
    version: null,
  }));
  return {
    dep,
    robot,
    before,
    evidence: (dep.evidenceItems as unknown as EvidenceRow[]).filter((e) => e.archivedAt === null).map(toEvidenceInput),
    approvals: (dep.approvals as unknown as ApprovalRow[]).map(toApprovalInput),
    humanExposure: dep.humanExposure as HumanExposure,
  };
}

function runEngine(
  before: ConfigItemInput[],
  after: ConfigItemInput[],
  ctx: { evidence: ReturnType<typeof toEvidenceInput>[]; approvals: ReturnType<typeof toApprovalInput>[]; humanExposure: HumanExposure }
) {
  const diff = diffSnapshots(before, after);
  const { items, counts } = computeImpact({ diff, evidence: ctx.evidence, approvals: ctx.approvals, humanExposure: ctx.humanExposure });
  return { diff, items, counts };
}

/** Preview only (no write): the diff + impact for a proposed edit (spec §7.4). */
export async function previewChange(raw: unknown): Promise<ActionResult<{
  diff: ReturnType<typeof diffSnapshots>;
  items: ImpactResult[];
  counts: ReturnType<typeof computeImpact>["counts"];
}>> {
  const parsed = changeEditsSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const ctx = await loadContext(parsed.data.deploymentCode);
  if (!ctx) return { ok: false, error: "Deployment not found" };

  const after: ConfigItemInput[] = parsed.data.edits.map((e) => ({ slot: e.slot, value: e.value, vendor: null, version: null }));
  const { diff, items, counts } = runEngine(ctx.before, after, ctx);
  if (diff.length === 0) return { ok: false, error: "No changes to preview" };
  return { ok: true, data: { diff, items, counts } };
}

/** Confirm a change: create snapshot + Change + ImpactItems, flip affected evidence (spec §6.3). */
export async function createChange(raw: unknown): Promise<ActionResult<{ code: string }>> {
  const parsed = changeEditsSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const actor = await getActor();
  const ctx = await loadContext(parsed.data.deploymentCode);
  if (!ctx || !ctx.robot || !ctx.dep.activeBaseline) return { ok: false, error: "Deployment not ready for changes" };

  const after: ConfigItemInput[] = parsed.data.edits.map((e) => ({ slot: e.slot, value: e.value, vendor: null, version: null }));
  const { diff, items } = runEngine(ctx.before, after, ctx);
  if (diff.length === 0) return { ok: false, error: "No changes to confirm" };

  const [snapshotCode, changeCode] = await Promise.all([
    nextSnapshotCodeForRobot(ctx.robot.id),
    nextChangeCode(),
  ]);

  // Map impact results → persisted rows. Approvals matched by title.
  const evByCode = new Map(ctx.dep.evidenceItems.map((e) => [e.code, e]));
  const apByTitle = new Map(ctx.dep.approvals.map((a) => [a.title, a]));

  const created = await prisma.$transaction(async (tx) => {
    const snap = await tx.configurationSnapshot.create({
      data: {
        code: snapshotCode, robotId: ctx.robot!.id, parentSnapshotId: ctx.dep.activeBaseline!.snapshotId,
        hash: hashSnapshot(after), createdById: actor.id, note: parsed.data.note || "Proposed change",
        items: { create: after.map((i) => ({ slot: i.slot, value: i.value })) },
      },
    });

    const change = await tx.change.create({
      data: {
        code: changeCode, deploymentId: ctx.dep.id, robotId: ctx.robot!.id,
        beforeSnapshotId: ctx.dep.activeBaseline!.snapshotId, afterSnapshotId: snap.id,
        diff: serializeJson(diff), authorId: actor.id, status: "REVIEW_REQUIRED",
      },
    });

    for (const it of items) {
      const targetId =
        it.targetType === "APPROVAL" ? apByTitle.get(it.title)?.id ?? null
        : it.targetCode ? evByCode.get(it.targetCode)?.id ?? null
        : null;
      await tx.impactItem.create({
        data: {
          changeId: change.id, targetType: it.targetType, targetId, title: it.title, reason: it.reason,
          suggestedAction: it.suggestedAction, severity: it.severity, status: "PENDING",
        },
      });
    }

    // §6.3: each affected EvidenceItem that was VALID → REVIEW_REQUIRED. Items
    // already in a non-valid state (MISSING/NOT_STARTED/…) keep their state.
    const affectedCodes = items.filter((i) => i.targetType !== "APPROVAL" && i.targetType !== "CHECK" && i.targetCode).map((i) => i.targetCode!);
    if (affectedCodes.length) {
      await tx.evidenceItem.updateMany({
        where: { deploymentId: ctx.dep.id, code: { in: affectedCodes }, status: "VALID" },
        data: { status: "REVIEW_REQUIRED" },
      });
    }

    await writeAudit(tx, {
      actorId: actor.id, action: "CHANGE_CREATED", entityType: "Change", entityId: change.code,
      after: { diff, impactCount: items.length },
    });
    return change;
  });

  revalidatePath("/");
  revalidatePath("/changes");
  revalidatePath(`/deployments/${parsed.data.deploymentCode}`);
  return { ok: true, data: { code: created.code } };
}

async function loadImpactItem(itemId: string) {
  return prisma.impactItem.findUnique({ where: { id: itemId }, include: { change: true } });
}

function revalidateChange(code: string, deploymentId?: string) {
  revalidatePath(`/changes/${code}`);
  revalidatePath("/changes");
  revalidatePath("/");
  if (deploymentId) revalidatePath(`/deployments`);
}

export async function reviewImpact(raw: unknown): Promise<ActionResult> {
  const parsed = reviewImpactSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Invalid input" };
  const actor = await getActor();
  const item = await loadImpactItem(parsed.data.itemId);
  if (!item) return { ok: false, error: "Item not found" };

  await prisma.$transaction(async (tx) => {
    await tx.impactItem.update({ where: { id: item.id }, data: { status: "IN_REVIEW" } });
    await writeAudit(tx, { actorId: actor.id, action: "IMPACT_IN_REVIEW", entityType: "ImpactItem", entityId: item.id, before: { status: item.status }, after: { status: "IN_REVIEW" } });
  });
  revalidateChange(item.change.code);
  return { ok: true, data: undefined };
}

export async function assignImpact(raw: unknown): Promise<ActionResult> {
  const parsed = assignImpactSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Invalid input" };
  const actor = await getActor();
  const item = await loadImpactItem(parsed.data.itemId);
  if (!item) return { ok: false, error: "Item not found" };

  await prisma.$transaction(async (tx) => {
    await tx.impactItem.update({ where: { id: item.id }, data: { assigneeId: parsed.data.assigneeId } });
    await writeAudit(tx, { actorId: actor.id, action: "IMPACT_ASSIGNED", entityType: "ImpactItem", entityId: item.id, after: { assigneeId: parsed.data.assigneeId } });
  });
  revalidateChange(item.change.code);
  return { ok: true, data: undefined };
}

export async function resolveImpact(raw: unknown): Promise<ActionResult> {
  const parsed = resolveImpactSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const actor = await getActor();
  const item = await loadImpactItem(parsed.data.itemId);
  if (!item) return { ok: false, error: "Item not found" };

  // §6.4: a RE_RUN resolution requires a linked new evidence OR test date+result.
  if (item.suggestedAction === "RE_RUN") {
    const hasEvidence = !!parsed.data.newEvidenceId;
    const hasTest = !!parsed.data.testDate && !!parsed.data.testResult;
    if (!hasEvidence && !hasTest) {
      return { ok: false, error: "Re-run needs a linked new evidence item, or a test date and result." };
    }
  }

  let approvalForReReview: { approverPersonId: string; approver: { name: string } } | null = null;
  if (item.targetType === "APPROVAL") {
    if (!item.targetId) return { ok: false, error: "Affected approval reference is missing." };
    approvalForReReview = await prisma.approval.findUnique({
      where: { id: item.targetId },
      include: { approver: true },
    });
    if (!approvalForReReview) return { ok: false, error: "Affected approval not found." };
    if (approvalForReReview.approverPersonId !== actor.id) {
      return { ok: false, error: `Only ${approvalForReReview.approver.name} can record this re-approval.` };
    }
  }

  const note = parsed.data.note ||
    (parsed.data.testDate ? `New test on ${parsed.data.testDate}: ${parsed.data.testResult ?? ""}`.trim() : "") ||
    (item.targetType === "APPROVAL" ? `Re-approved by ${actor.name}` : "");

  await prisma.$transaction(async (tx) => {
    await tx.impactItem.update({
      where: { id: item.id },
      data: { status: "RESOLVED", resolutionNote: note || null, resolvedById: actor.id, resolvedAt: new Date(), newEvidenceId: parsed.data.newEvidenceId ?? null },
    });
    // Resolving an evidence/requirement item returns that item to VALID (spec §6.3/§6.4).
    if (item.targetType !== "APPROVAL" && item.targetType !== "CHECK" && item.targetId) {
      const ev = await tx.evidenceItem.findUnique({ where: { id: item.targetId } });
      if (ev && ev.status !== "MISSING") {
        await tx.evidenceItem.update({ where: { id: ev.id }, data: { status: "VALID" } });
      }
    }
    await writeAudit(tx, { actorId: actor.id, action: "IMPACT_RESOLVED", entityType: "ImpactItem", entityId: item.id, before: { status: item.status }, after: { status: "RESOLVED", note } });
  });
  revalidateChange(item.change.code);
  return { ok: true, data: undefined };
}

export async function waiveImpact(raw: unknown): Promise<ActionResult> {
  const parsed = waiveImpactSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "A written justification is required" };
  const actor = await getActor();
  const item = await loadImpactItem(parsed.data.itemId);
  if (!item) return { ok: false, error: "Item not found" };
  if (item.targetType === "APPROVAL") {
    return { ok: false, error: "Affected approvals cannot be waived; the named approver must review them." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.impactItem.update({
      where: { id: item.id },
      data: { status: "WAIVED", resolutionNote: parsed.data.justification, resolvedById: actor.id, resolvedAt: new Date() },
    });
    await writeAudit(tx, { actorId: actor.id, action: "IMPACT_WAIVED", entityType: "ImpactItem", entityId: item.id, before: { status: item.status }, after: { status: "WAIVED", justification: parsed.data.justification } });
  });
  revalidateChange(item.change.code);
  return { ok: true, data: undefined };
}

/** Approve a change (spec §6.4): SAFETY_LEAD only, blocked on HIGH open items. */
export async function approveChange(raw: unknown): Promise<ActionResult<{ baselineCode: string }>> {
  const parsed = approveChangeSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Invalid input" };
  const actor = await getActor();
  if (actor.role !== "SAFETY_LEAD") return { ok: false, error: "Only a Safety Lead can approve a change." };

  const change = await prisma.change.findUnique({
    where: { code: parsed.data.changeCode },
    include: { impactItems: true, afterSnapshot: { include: { items: true } }, deployment: { include: { task: true, site: true, customer: true } } },
  });
  if (!change) return { ok: false, error: "Change not found" };
  if (change.status === "APPROVED") return { ok: false, error: "Change already approved." };

  const isOpen = (status: string) => status === "PENDING" || status === "IN_REVIEW";
  const highOpen = change.impactItems.some((i) => i.severity === "HIGH" && isOpen(i.status));
  const approvalOpen = change.impactItems.some((i) => i.targetType === "APPROVAL" && isOpen(i.status));
  if (highOpen || approvalOpen) {
    return { ok: false, error: "Resolve all high-impact items and all affected re-approvals before approving the change." };
  }

  const baselineCode = await nextBaselineCode(change.deployment.code);
  const afterItems: ConfigItemInput[] = change.afterSnapshot.items.map((i) => ({ slot: i.slot as ConfigItemInput["slot"], value: i.value, vendor: null, version: null }));

  await prisma.$transaction(async (tx) => {
    const evidence = await tx.evidenceItem.findMany({ where: { deploymentId: change.deploymentId, archivedAt: null } });
    const approvals = await tx.approval.findMany({ where: { deploymentId: change.deploymentId, status: { not: "REVOKED" } } });

    const baseline = await tx.baseline.create({
      data: {
        code: baselineCode, deploymentId: change.deploymentId, snapshotId: change.afterSnapshotId,
        taskSnapshot: serializeJson({
          id: change.deployment.task.id,
          name: change.deployment.task.name,
          description: change.deployment.task.description,
          parameters: parseJson(change.deployment.task.parameters, {}),
        }),
        environmentSnapshot: serializeJson({
          customer: {
            id: change.deployment.customer.id,
            code: change.deployment.customer.code,
            name: change.deployment.customer.name,
            country: change.deployment.customer.country,
          },
          site: {
            id: change.deployment.site.id,
            name: change.deployment.site.name,
            city: change.deployment.site.city,
            country: change.deployment.site.country,
            environmentType: change.deployment.site.environmentType,
          },
          lifecycle: change.deployment.lifecycle,
          operatingMode: change.deployment.operatingMode,
          humanExposure: change.deployment.humanExposure,
        }),
        evidenceState: serializeJson(evidence.map((e) => ({
          id: e.id,
          code: e.code,
          title: e.title,
          category: e.category,
          kind: e.kind,
          readinessCategory: e.readinessCategory,
          status: e.status,
          required: e.required,
          applicable: e.applicable,
          ownerPersonId: e.ownerPersonId,
          uri: e.uri,
          fileSha256: e.fileSha256,
          dueDate: e.dueDate?.toISOString() ?? null,
          updatedAt: e.updatedAt.toISOString(),
        }))),
        approvalState: serializeJson(approvals.map((a) => ({
          id: a.id,
          title: a.title,
          readinessCategory: a.readinessCategory,
          approverPersonId: a.approverPersonId,
          role: a.role,
          status: a.status,
          decidedAt: a.decidedAt?.toISOString() ?? null,
          baselineId: a.baselineId,
          justification: a.justification,
        }))),
        hash: hashSnapshot(afterItems), frozenById: actor.id,
      },
    });
    await tx.deployment.update({ where: { id: change.deploymentId }, data: { activeBaselineId: baseline.id } });
    await tx.change.update({ where: { id: change.id }, data: { status: "APPROVED", approvedById: actor.id, approvedAt: new Date() } });

    await writeAudit(tx, { actorId: actor.id, action: "CHANGE_APPROVED", entityType: "Change", entityId: change.code, after: { baseline: baselineCode, by: actor.name } });
    await writeAudit(tx, { actorId: actor.id, action: "BASELINE_FROZEN", entityType: "Baseline", entityId: baselineCode });
  });

  revalidatePath("/");
  revalidatePath("/changes");
  revalidatePath(`/changes/${change.code}`);
  revalidatePath(`/deployments/${change.deployment.code}`);
  return { ok: true, data: { baselineCode } };
}
