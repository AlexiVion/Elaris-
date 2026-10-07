import { NextResponse } from "next/server";
import { z } from "zod";
import {
  loadComponentHealthWorkbench,
} from "@/lib/component-health/workbench-v04";
import {
  buildComponentHealthReviewQueue,
  COMPONENT_HEALTH_REVIEW_DISPOSITIONS,
  saveComponentHealthReviewItem,
} from "@/lib/component-health/review-v041";

export const runtime = "nodejs";

const bodySchema = z.object({
  analysisId: z.string().min(1).max(128),
  scopeKey: z.string().min(1).max(128),
  disposition: z.enum(COMPONENT_HEALTH_REVIEW_DISPOSITIONS),
  note: z.string().max(4000).nullable().optional(),
});

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid review-item payload", details: parsed.error.flatten() },
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

  const recommended = buildComponentHealthReviewQueue(artifact.report).find(
    (item) => item.scopeKey === parsed.data.scopeKey
  );
  if (!recommended) {
    return NextResponse.json(
      { error: "Review item is not present in the current evidence artifact." },
      { status: 404 }
    );
  }

  const item = await saveComponentHealthReviewItem({
    analysisId: parsed.data.analysisId,
    item: recommended,
    disposition: parsed.data.disposition,
    note: parsed.data.note ?? null,
  });

  return NextResponse.json({
    item: {
      scopeType: item.scopeType,
      scopeKey: item.scopeKey,
      disposition: item.disposition,
      priority: item.priority,
      recommendedAction: item.recommendedAction,
      note: item.note,
      updatedAt: item.updatedAt.toISOString(),
    },
    interpretation:
      "This records how a review question is being handled. It does not assert component health or approve external release.",
  });
}
