-- Component Health V0.4.1 — minimal persisted human review state.
-- This migration intentionally does not persist raw telemetry or V0.3 artifacts.

CREATE TABLE "ComponentHealthReview" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "analysisId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AWAITING_TECHNICAL_REVIEW',
    "summary" TEXT,
    "reviewerPersonId" TEXT,
    "reviewedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ComponentHealthReview_reviewerPersonId_fkey"
      FOREIGN KEY ("reviewerPersonId") REFERENCES "Person" ("id")
      ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "ComponentHealthReview_analysisId_key"
ON "ComponentHealthReview"("analysisId");

CREATE INDEX "ComponentHealthReview_status_idx"
ON "ComponentHealthReview"("status");

CREATE TABLE "ComponentHealthReviewItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reviewId" TEXT NOT NULL,
    "scopeType" TEXT NOT NULL,
    "scopeKey" TEXT NOT NULL,
    "disposition" TEXT NOT NULL DEFAULT 'OPEN',
    "recommendedAction" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "note" TEXT,
    "authorPersonId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ComponentHealthReviewItem_reviewId_fkey"
      FOREIGN KEY ("reviewId") REFERENCES "ComponentHealthReview" ("id")
      ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ComponentHealthReviewItem_authorPersonId_fkey"
      FOREIGN KEY ("authorPersonId") REFERENCES "Person" ("id")
      ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "ComponentHealthReviewItem_reviewId_scopeType_scopeKey_key"
ON "ComponentHealthReviewItem"("reviewId", "scopeType", "scopeKey");

CREATE INDEX "ComponentHealthReviewItem_reviewId_idx"
ON "ComponentHealthReviewItem"("reviewId");
