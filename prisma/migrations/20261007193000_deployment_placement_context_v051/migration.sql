-- Deployment Control V0.5.1 — Placement Context Semantics
--
-- Generalizes the original commercial-only Deployment model so a real
-- institutional placement can exist without fictional Customer / Task facts.
-- Existing commercial rows are preserved and backfilled as COMMERCIAL_DEPLOYMENT.

PRAGMA foreign_keys=OFF;
PRAGMA defer_foreign_keys=ON;

-- Site: commercial customer becomes optional; institutional host is explicit;
-- environment type may remain unknown until evidenced.
CREATE TABLE "new_Site" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerId" TEXT,
    "hostOrganizationId" TEXT,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "environmentType" TEXT,
    CONSTRAINT "Site_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Site_hostOrganizationId_fkey" FOREIGN KEY ("hostOrganizationId") REFERENCES "Organization" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Site" ("id","customerId","name","city","country","environmentType")
SELECT "id","customerId","name","city","country","environmentType" FROM "Site";
DROP TABLE "Site";
ALTER TABLE "new_Site" RENAME TO "Site";
CREATE INDEX "Site_hostOrganizationId_idx" ON "Site"("hostOrganizationId");

-- Robot: unknown serial is represented as NULL instead of fabricated text.
CREATE TABLE "new_Robot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "serialNumber" TEXT,
    "status" TEXT NOT NULL
);
INSERT INTO "new_Robot" ("id","code","model","serialNumber","status")
SELECT "id","code","model","serialNumber","status" FROM "Robot";
DROP TABLE "Robot";
ALTER TABLE "new_Robot" RENAME TO "Robot";
CREATE UNIQUE INDEX "Robot_code_key" ON "Robot"("code");

-- Deployment: commercial/task/operational fields are optional when they do
-- not apply. contextKind makes placement semantics explicit.
CREATE TABLE "new_Deployment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contextKind" TEXT NOT NULL DEFAULT 'COMMERCIAL_DEPLOYMENT',
    "providerOrganizationId" TEXT,
    "customerId" TEXT,
    "siteId" TEXT NOT NULL,
    "taskId" TEXT,
    "lifecycle" TEXT,
    "operationalState" TEXT NOT NULL,
    "operatingMode" TEXT,
    "humanExposure" TEXT,
    "description" TEXT NOT NULL,
    "activeBaselineId" TEXT,
    CONSTRAINT "Deployment_providerOrganizationId_fkey" FOREIGN KEY ("providerOrganizationId") REFERENCES "Organization" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Deployment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Deployment_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Deployment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Deployment_activeBaselineId_fkey" FOREIGN KEY ("activeBaselineId") REFERENCES "Baseline" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Deployment" (
    "id","code","name","contextKind","customerId","siteId","taskId","lifecycle",
    "operationalState","operatingMode","humanExposure","description","activeBaselineId"
)
SELECT
    "id","code","name",'COMMERCIAL_DEPLOYMENT',"customerId","siteId","taskId","lifecycle",
    "operationalState","operatingMode","humanExposure","description","activeBaselineId"
FROM "Deployment";
DROP TABLE "Deployment";
ALTER TABLE "new_Deployment" RENAME TO "Deployment";
CREATE UNIQUE INDEX "Deployment_code_key" ON "Deployment"("code");
CREATE INDEX "Deployment_providerOrganizationId_idx" ON "Deployment"("providerOrganizationId");

-- Baseline: no task snapshot is required when a placement has no assigned task.
CREATE TABLE "new_Baseline" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "deploymentId" TEXT NOT NULL,
    "snapshotId" TEXT NOT NULL,
    "taskSnapshot" TEXT,
    "environmentSnapshot" TEXT NOT NULL,
    "evidenceState" TEXT NOT NULL,
    "approvalState" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "frozenById" TEXT NOT NULL,
    "frozenAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Baseline_deploymentId_fkey" FOREIGN KEY ("deploymentId") REFERENCES "Deployment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Baseline_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "ConfigurationSnapshot" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Baseline_frozenById_fkey" FOREIGN KEY ("frozenById") REFERENCES "Person" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Baseline" (
    "id","code","deploymentId","snapshotId","taskSnapshot","environmentSnapshot",
    "evidenceState","approvalState","hash","frozenById","frozenAt"
)
SELECT
    "id","code","deploymentId","snapshotId","taskSnapshot","environmentSnapshot",
    "evidenceState","approvalState","hash","frozenById","frozenAt"
FROM "Baseline";
DROP TABLE "Baseline";
ALTER TABLE "new_Baseline" RENAME TO "Baseline";
CREATE UNIQUE INDEX "Baseline_code_key" ON "Baseline"("code");
CREATE INDEX "Baseline_deploymentId_idx" ON "Baseline"("deploymentId");

PRAGMA defer_foreign_keys=OFF;
PRAGMA foreign_keys=ON;
