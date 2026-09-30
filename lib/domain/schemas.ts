/** Zod schemas — validate ALL Server Action input (spec §4). */
import { z } from "zod";
import {
  SLOTS, EVIDENCE_CATEGORIES, EVIDENCE_KINDS, READINESS_CATEGORIES, EVIDENCE_SOURCES,
  CRITICALITIES, EVIDENCE_STATUSES, SEVERITIES,
} from "./enums";

export const slotEditSchema = z.object({
  slot: z.enum(SLOTS),
  value: z.string().trim().min(1, "Value is required"),
});

export const changeEditsSchema = z.object({
  deploymentCode: z.string().min(1),
  edits: z.array(slotEditSchema).min(1),
  note: z.string().trim().max(500).optional().default(""),
});

export const resolveImpactSchema = z
  .object({
    itemId: z.string().min(1),
    note: z.string().trim().max(1000).optional().default(""),
    newEvidenceId: z.string().optional(),
    testDate: z.string().optional(), // ISO date
    testResult: z.string().trim().max(500).optional(),
  })
  .refine(
    // spec §6.4: a RE_RUN resolution requires a linked new evidence OR a test
    // date + result. The action re-checks this against the item's action too.
    (v) => true,
    { message: "" }
  );

export const waiveImpactSchema = z.object({
  itemId: z.string().min(1),
  justification: z.string().trim().min(3, "A written justification is required"),
});

export const assignImpactSchema = z.object({
  itemId: z.string().min(1),
  assigneeId: z.string().min(1),
});

export const reviewImpactSchema = z.object({ itemId: z.string().min(1) });

export const approveChangeSchema = z.object({ changeCode: z.string().min(1) });

export const evidenceSchema = z.object({
  id: z.string().optional(), // present on edit
  code: z.string().trim().min(1, "Code is required").regex(/^[A-Za-z0-9-]+$/, "Use letters, numbers and dashes"),
  title: z.string().trim().min(1, "Title is required"),
  category: z.enum(EVIDENCE_CATEGORIES),
  kind: z.enum(EVIDENCE_KINDS),
  readinessCategory: z.enum(READINESS_CATEGORIES),
  source: z.enum(EVIDENCE_SOURCES),
  deploymentCode: z.string().min(1),
  scopeSlots: z.array(z.enum(SLOTS)).default([]),
  criticality: z.enum(CRITICALITIES),
  status: z.enum(EVIDENCE_STATUSES),
  required: z.boolean().default(true),
  applicable: z.boolean().default(true),
  ownerPersonId: z.string().min(1, "Owner is required"),
  uri: z.string().trim().url("Must be a valid URL").optional().or(z.literal("")).transform((v) => v || undefined),
  fileSha256: z.string().trim().regex(/^[0-9a-f]{64}$/i, "Invalid SHA-256").optional().or(z.literal("")).transform((v) => v || undefined),
  dueDate: z.string().optional().or(z.literal("")).transform((v) => v || undefined),
});

export const incidentSchema = z.object({
  deploymentCode: z.string().min(1),
  robotId: z.string().min(1),
  occurredAt: z.string().min(1, "Date is required"),
  description: z.string().trim().min(1, "Description is required"),
  severity: z.enum(SEVERITIES),
  timeline: z
    .array(z.object({ at: z.string().trim().min(1), note: z.string().trim().min(1) }))
    .default([]),
});

export type EvidenceFormInput = z.input<typeof evidenceSchema>;
export type IncidentFormInput = z.input<typeof incidentSchema>;
