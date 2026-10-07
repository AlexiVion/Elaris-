import type { ComponentHealthEvidenceV03, QualityFindingV03 } from "@/lib/component-health/evidence-engine-v03";
import {
  summarizeQualityFindings,
  type QualityFindingGroup,
} from "@/lib/component-health/workbench-v04";
import { prisma } from "@/lib/db/prisma";

export const COMPONENT_HEALTH_REVIEW_STATUSES = [
  "AWAITING_TECHNICAL_REVIEW",
  "IN_REVIEW",
  "REVIEWED_FOR_COMPLETENESS",
  "BLOCKED",
] as const;

export type ComponentHealthReviewStatus =
  (typeof COMPONENT_HEALTH_REVIEW_STATUSES)[number];

export const COMPONENT_HEALTH_REVIEW_DISPOSITIONS = [
  "OPEN",
  "ACKNOWLEDGED",
  "NEEDS_FOLLOWUP",
  "DATA_LIMITATION",
] as const;

export type ComponentHealthReviewDisposition =
  (typeof COMPONENT_HEALTH_REVIEW_DISPOSITIONS)[number];

export type RecommendedReviewItem = {
  scopeType: "QUALITY_GROUP";
  scopeKey: string;
  code: QualityFindingV03["code"];
  severity: QualityFindingV03["severity"];
  evidenceCount: number;
  phaseCount: number;
  componentCount: number;
  priority: "HIGH" | "MEDIUM" | "LOW";
  recommendedAction: string;
  plainLanguage: string;
  whyItMatters: string;
};

export function buildComponentHealthReviewQueue(
  report: ComponentHealthEvidenceV03
): RecommendedReviewItem[] {
  return summarizeQualityFindings(report.quality.findings)
    .map(recommendationForGroup)
    .sort(
      (a, b) =>
        priorityRank(a.priority) - priorityRank(b.priority) ||
        b.evidenceCount - a.evidenceCount ||
        a.code.localeCompare(b.code)
    );
}

export async function getPersistedComponentHealthReview(analysisId: string) {
  return prisma.componentHealthReview.findUnique({
    where: { analysisId },
    include: {
      reviewer: true,
      items: {
        include: { author: true },
        orderBy: [{ priority: "asc" }, { scopeKey: "asc" }],
      },
    },
  });
}

export async function saveComponentHealthReview(input: {
  analysisId: string;
  status: ComponentHealthReviewStatus;
  summary: string | null;
}) {
  const reviewedAt =
    input.status === "REVIEWED_FOR_COMPLETENESS" ? new Date() : null;

  return prisma.componentHealthReview.upsert({
    where: { analysisId: input.analysisId },
    create: {
      analysisId: input.analysisId,
      status: input.status,
      summary: cleanNote(input.summary),
      reviewedAt,
    },
    update: {
      status: input.status,
      summary: cleanNote(input.summary),
      reviewedAt,
    },
  });
}

export async function saveComponentHealthReviewItem(input: {
  analysisId: string;
  item: RecommendedReviewItem;
  disposition: ComponentHealthReviewDisposition;
  note: string | null;
}) {
  const review = await prisma.componentHealthReview.upsert({
    where: { analysisId: input.analysisId },
    create: {
      analysisId: input.analysisId,
      status: "IN_REVIEW",
    },
    update: {},
  });

  return prisma.componentHealthReviewItem.upsert({
    where: {
      reviewId_scopeType_scopeKey: {
        reviewId: review.id,
        scopeType: input.item.scopeType,
        scopeKey: input.item.scopeKey,
      },
    },
    create: {
      reviewId: review.id,
      scopeType: input.item.scopeType,
      scopeKey: input.item.scopeKey,
      disposition: input.disposition,
      recommendedAction: input.item.recommendedAction,
      priority: input.item.priority,
      note: cleanNote(input.note),
    },
    update: {
      disposition: input.disposition,
      recommendedAction: input.item.recommendedAction,
      priority: input.item.priority,
      note: cleanNote(input.note),
    },
  });
}

export function reviewStatusExplanation(status: ComponentHealthReviewStatus) {
  switch (status) {
    case "AWAITING_TECHNICAL_REVIEW":
      return "Evidence is ready, but nobody has documented a technical review yet.";
    case "IN_REVIEW":
      return "Someone has started reviewing evidence quality and unresolved questions.";
    case "REVIEWED_FOR_COMPLETENESS":
      return "Evidence completeness was reviewed. This is not a health, safety, certification or release approval.";
    case "BLOCKED":
      return "Review cannot be completed until a specific evidence or semantics question is resolved.";
  }
}

function recommendationForGroup(
  group: QualityFindingGroup
): RecommendedReviewItem {
  const base = {
    scopeType: "QUALITY_GROUP" as const,
    scopeKey: group.code,
    code: group.code,
    severity: group.severity,
    evidenceCount: group.count,
    phaseCount: group.phaseCount,
    componentCount: group.componentCount,
  };

  switch (group.code) {
    case "UNRESOLVED_COMPONENT_SLOT":
      return {
        ...base,
        priority: "HIGH",
        recommendedAction:
          "Verify the component mapping and whether the physical channels are expected to be unavailable for this OEM slot.",
        plainLanguage:
          "One component slot does not provide enough physical telemetry to interpret it reliably.",
        whyItMatters:
          "Until this is resolved, Elaris should show the slot as unknown rather than healthy or failed.",
      };
    case "PHASE_NO_OBSERVED_TELEMETRY":
      return {
        ...base,
        priority: "HIGH",
        recommendedAction:
          "Repeat or recover the phase capture before relying on this phase in an audit.",
        plainLanguage:
          "A declared operating phase has no usable observed telemetry.",
        whyItMatters:
          "There is no evidence basis for a component comparison during that phase.",
      };
    case "MISSING_COMPONENT_SLOTS":
      return {
        ...base,
        priority: "HIGH",
        recommendedAction:
          "Confirm why component slots are missing and repeat capture if the omission was not intentional.",
        plainLanguage:
          "One or more expected component slots are missing from a phase.",
        whyItMatters:
          "The audit is incomplete for those slots in that operating context.",
      };
    case "PHASE_OBSERVATION_ENDS_BEFORE_DECLARED_END":
      return {
        ...base,
        priority: "MEDIUM",
        recommendedAction:
          "Reconcile the human-declared phase boundary with the last observed telemetry timestamp.",
        plainLanguage:
          "The operator said the phase continued after telemetry had already stopped.",
        whyItMatters:
          "Elaris must distinguish what happened physically from what was actually recorded.",
      };
    case "PHASE_OBSERVATION_STARTS_AFTER_DECLARED_START":
      return {
        ...base,
        priority: "MEDIUM",
        recommendedAction:
          "Reconcile the declared phase start with the first observed telemetry timestamp.",
        plainLanguage:
          "Telemetry begins after the declared phase start.",
        whyItMatters:
          "Part of the declared operating context may not be represented in the evidence.",
      };
    case "OEM_SEMANTICS_UNCONFIRMED":
      return {
        ...base,
        priority: "MEDIUM",
        recommendedAction:
          "Validate signal units and state-code meanings against authoritative OEM documentation or an OEM-confirmed mapping.",
        plainLanguage:
          "Elaris can read these channels, but their exact OEM meaning is not yet independently confirmed.",
        whyItMatters:
          "The values can be preserved as observations, but should not drive engineering conclusions until their semantics are validated.",
      };
    case "DUPLICATE_SIGNAL_TIMESTAMP":
      return {
        ...base,
        priority: "MEDIUM",
        recommendedAction:
          "Confirm whether duplicate timestamp samples are expected from the source stream and preserve deduplication rules in the evidence contract.",
        plainLanguage:
          "Some signals contain more than one sample with the same timestamp.",
        whyItMatters:
          "Coverage is already protected from inflation, but the source behavior should be understood before scaling the pipeline.",
      };
    case "TELEMETRY_FRAME_GAP":
      return {
        ...base,
        priority: "MEDIUM",
        recommendedAction:
          "Review capture continuity and determine whether the frame gap is transport behavior or missing evidence.",
        plainLanguage:
          "A phase contains a larger-than-usual gap between observed telemetry frames.",
        whyItMatters:
          "Long gaps can hide part of the operating event even when aggregate coverage looks high.",
      };
    case "LOW_SIGNAL_COVERAGE":
      return {
        ...base,
        priority: "MEDIUM",
        recommendedAction:
          "Review missingness and repeat capture if the signal is expected to be present continuously.",
        plainLanguage:
          "A signal was present for less than 95% of the phase frame timestamps.",
        whyItMatters:
          "Comparisons made from incomplete observations need an explicit evidence-quality caveat.",
      };
    case "CONSTANT_ZERO_SIGNAL":
      return {
        ...base,
        priority: "LOW",
        recommendedAction:
          "Classify whether the zero channel is expected, unsupported, unavailable or genuinely observed at zero before using it analytically.",
        plainLanguage:
          "A signal stayed at zero for an entire observed phase.",
        whyItMatters:
          "Zero can mean a true value, an unsupported channel or missing instrumentation; Elaris must not guess.",
      };
    default:
      return exhaustiveRecommendation(group);
  }
}

function exhaustiveRecommendation(group: never): RecommendedReviewItem {
  throw new Error(`Unhandled Component Health quality finding: ${JSON.stringify(group)}`);
}

function priorityRank(priority: RecommendedReviewItem["priority"]) {
  if (priority === "HIGH") return 0;
  if (priority === "MEDIUM") return 1;
  return 2;
}

function cleanNote(value: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed.slice(0, 4000) : null;
}
