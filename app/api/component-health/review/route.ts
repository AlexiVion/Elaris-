import { NextResponse } from "next/server";
import { z } from "zod";
import { loadComponentHealthWorkbench } from "@/lib/component-health/workbench-v04";
import {
  COMPONENT_HEALTH_REVIEW_STATUSES,
  saveComponentHealthReview,
} from "@/lib/component-health/review-v041";

export const runtime = "nodejs";

const bodySchema = z.object({
  analysisId: z.string().min(1).max(128),
  status: z.enum(COMPONENT_HEALTH_REVIEW_STATUSES),
  summary: z.string().max(4000).nullable().optional(),
});

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid review payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const catalogue = await loadComponentHealthWorkbench();
  const artifact = catalogue.analyses.find(
    (candidate) => candidate.analysisId === parsed.data.analysisId
  );

  if (!artifact) {
    return NextResponse.json(
      { error: "Analysis ID is not present in the authorized private V0.3 catalogue." },
      { status: 404 }
    );
  }

  const review = await saveComponentHealthReview({
    analysisId: parsed.data.analysisId,
    status: parsed.data.status,
    summary: parsed.data.summary ?? null,
  });

  return NextResponse.json({
    review: {
      analysisId: review.analysisId,
      status: review.status,
      summary: review.summary,
      reviewedAt: review.reviewedAt?.toISOString() ?? null,
      updatedAt: review.updatedAt.toISOString(),
    },
    interpretation:
      "This records review workflow only. It is not a robot-health, safety, certification or data-release approval.",
  });
}
