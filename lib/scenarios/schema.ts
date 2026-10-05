import { z } from "zod";
import {
  EVIDENCE_CLASSES,
  EVIDENCE_SOURCE_KINDS,
  SCENARIO_USE_APPROVALS,
} from "./evidence-class";
import { SCENARIO_CAPABILITIES } from "./types";

const nonEmpty = z.string().trim().min(1);
const isoDateTime = z.string().datetime({ offset: true });
const sha256 = z.string().regex(/^[0-9a-f]{64}$/i, "Invalid SHA-256");

export const evidenceClassSchema = z.enum(EVIDENCE_CLASSES);

export const evidenceProvenanceSchema = z.object({
  ref: nonEmpty,
  evidenceClass: evidenceClassSchema,
  sourceKind: z.enum(EVIDENCE_SOURCE_KINDS),
  scenarioUseApproval: z.enum(SCENARIO_USE_APPROVALS),
  sourceSha256: sha256.nullish(),
  note: z.string().trim().min(1).nullish(),
}).strict();

export const scenarioSpecSchema = z.object({
  scenarioId: nonEmpty,
  title: nonEmpty,
  purpose: nonEmpty,
  robotRef: nonEmpty,
  configurationRef: nonEmpty,
  baselineRef: nonEmpty,
  deploymentRef: nonEmpty,
  taskRef: nonEmpty,
  environmentRef: nonEmpty,
  componentRefs: z.array(nonEmpty),
  executionContextRef: nonEmpty.nullish(),
  observedEvidenceRefs: z.array(nonEmpty),
  assumptions: z.array(nonEmpty),
  disturbances: z.array(nonEmpty),
  failureHypotheses: z.array(nonEmpty),
  humanExposure: nonEmpty.nullish(),
  requestedCapabilities: z.array(z.enum(SCENARIO_CAPABILITIES)).min(1),
  createdBy: nonEmpty,
  createdAt: isoDateTime,
}).strict();

export const scenarioRunSchema = z.object({
  runId: nonEmpty,
  scenarioId: nonEmpty,
  scenarioHash: sha256,
  provider: nonEmpty,
  providerVersion: nonEmpty,
  model: nonEmpty,
  modelVersion: nonEmpty,
  runtime: nonEmpty,
  seed: z.union([z.string().min(1), z.number().finite()]).nullable(),
  parameters: z.record(z.unknown()),
  inputArtifactRefs: z.array(nonEmpty),
  startedAt: isoDateTime,
  completedAt: isoDateTime.nullish(),
  status: z.enum(["PENDING", "RUNNING", "SUCCEEDED", "FAILED", "CANCELLED"]),
}).strict();

export const scenarioArtifactSchema = z.object({
  artifactId: nonEmpty,
  runId: nonEmpty,
  kind: z.enum([
    "TEXT_REASONING",
    "IMAGE",
    "VIDEO",
    "ACTION_TRAJECTORY",
    "PHYSICS_TRACE",
    "METRIC",
  ]),
  uri: nonEmpty.nullish(),
  localPath: nonEmpty.nullish(),
  sha256,
  sensitivity: z.enum(["PUBLIC", "INTERNAL", "SENSITIVE", "RESTRICTED"]),
  evidenceClass: evidenceClassSchema,
}).strict().refine(
  (artifact) => Boolean(artifact.uri || artifact.localPath),
  "ScenarioArtifact requires uri or localPath"
);

export const scenarioFindingSchema = z.object({
  findingId: nonEmpty,
  runId: nonEmpty,
  claim: nonEmpty,
  evidenceRefs: z.array(nonEmpty),
  evidenceClass: z.enum(["INFERRED", "HYPOTHESIS", "HUMAN_CONFIRMED"]),
  confidenceDescriptor: z.string().trim().min(1).max(500).nullish(),
  limitations: z.array(nonEmpty),
  humanReviewStatus: z.enum([
    "PENDING",
    "CONFIRMED",
    "REJECTED",
    "NEEDS_REVISION",
  ]),
}).strict();

export const scenarioEvaluationSchema = z.object({
  evaluationId: nonEmpty,
  runId: nonEmpty,
  evaluator: nonEmpty,
  checks: z.array(z.object({
    checkId: nonEmpty,
    label: nonEmpty,
    status: z.enum(["PASS", "FAIL", "NOT_APPLICABLE"]),
    detail: z.string().trim().min(1).nullish(),
  }).strict()),
  result: z.enum(["PASS", "FAIL", "REVIEW_REQUIRED"]),
  limitations: z.array(nonEmpty),
}).strict();
