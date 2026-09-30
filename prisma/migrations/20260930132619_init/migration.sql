-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Person" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "organizationName" TEXT NOT NULL,
    CONSTRAINT "Person_organizationName_fkey" FOREIGN KEY ("organizationName") REFERENCES "Organization" ("name") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Site" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "environmentType" TEXT NOT NULL,
    CONSTRAINT "Site_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Robot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "ConfigurationSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "robotId" TEXT NOT NULL,
    "parentSnapshotId" TEXT,
    "hash" TEXT NOT NULL,
    "note" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ConfigurationSnapshot_robotId_fkey" FOREIGN KEY ("robotId") REFERENCES "Robot" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ConfigurationSnapshot_parentSnapshotId_fkey" FOREIGN KEY ("parentSnapshotId") REFERENCES "ConfigurationSnapshot" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ConfigurationSnapshot_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Person" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ConfigItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "snapshotId" TEXT NOT NULL,
    "slot" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "vendor" TEXT,
    "version" TEXT,
    CONSTRAINT "ConfigItem_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "ConfigurationSnapshot" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "parameters" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Deployment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "lifecycle" TEXT NOT NULL,
    "operationalState" TEXT NOT NULL,
    "operatingMode" TEXT NOT NULL,
    "humanExposure" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "activeBaselineId" TEXT,
    CONSTRAINT "Deployment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Deployment_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Deployment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Deployment_activeBaselineId_fkey" FOREIGN KEY ("activeBaselineId") REFERENCES "Baseline" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DeploymentRobot" (
    "deploymentId" TEXT NOT NULL,
    "robotId" TEXT NOT NULL,

    PRIMARY KEY ("deploymentId", "robotId"),
    CONSTRAINT "DeploymentRobot_deploymentId_fkey" FOREIGN KEY ("deploymentId") REFERENCES "Deployment" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DeploymentRobot_robotId_fkey" FOREIGN KEY ("robotId") REFERENCES "Robot" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Baseline" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "deploymentId" TEXT NOT NULL,
    "snapshotId" TEXT NOT NULL,
    "taskSnapshot" TEXT NOT NULL,
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

-- CreateTable
CREATE TABLE "EvidenceItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "readinessCategory" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "deploymentId" TEXT NOT NULL,
    "scopeSlots" TEXT NOT NULL,
    "criticality" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL,
    "applicable" BOOLEAN NOT NULL,
    "ownerPersonId" TEXT NOT NULL,
    "uri" TEXT,
    "fileSha256" TEXT,
    "dueDate" DATETIME,
    "updatedAt" DATETIME NOT NULL,
    "archivedAt" DATETIME,
    CONSTRAINT "EvidenceItem_deploymentId_fkey" FOREIGN KEY ("deploymentId") REFERENCES "Deployment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "EvidenceItem_ownerPersonId_fkey" FOREIGN KEY ("ownerPersonId") REFERENCES "Person" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Approval" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "deploymentId" TEXT NOT NULL,
    "readinessCategory" TEXT NOT NULL,
    "approverPersonId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "scopeSlots" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "decidedAt" DATETIME,
    "baselineId" TEXT,
    "justification" TEXT,
    CONSTRAINT "Approval_deploymentId_fkey" FOREIGN KEY ("deploymentId") REFERENCES "Deployment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Approval_approverPersonId_fkey" FOREIGN KEY ("approverPersonId") REFERENCES "Person" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Change" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "deploymentId" TEXT NOT NULL,
    "robotId" TEXT NOT NULL,
    "beforeSnapshotId" TEXT NOT NULL,
    "afterSnapshotId" TEXT NOT NULL,
    "diff" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "approvedById" TEXT,
    "approvedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Change_deploymentId_fkey" FOREIGN KEY ("deploymentId") REFERENCES "Deployment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Change_robotId_fkey" FOREIGN KEY ("robotId") REFERENCES "Robot" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Change_beforeSnapshotId_fkey" FOREIGN KEY ("beforeSnapshotId") REFERENCES "ConfigurationSnapshot" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Change_afterSnapshotId_fkey" FOREIGN KEY ("afterSnapshotId") REFERENCES "ConfigurationSnapshot" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Change_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Person" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Change_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "Person" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ImpactItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "changeId" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT,
    "title" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "suggestedAction" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "assigneeId" TEXT,
    "resolutionNote" TEXT,
    "resolvedById" TEXT,
    "resolvedAt" DATETIME,
    "newEvidenceId" TEXT,
    CONSTRAINT "ImpactItem_changeId_fkey" FOREIGN KEY ("changeId") REFERENCES "Change" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ImpactItem_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "Person" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ImpactItem_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "Person" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ImpactItem_newEvidenceId_fkey" FOREIGN KEY ("newEvidenceId") REFERENCES "EvidenceItem" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Incident" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "occurredAt" DATETIME NOT NULL,
    "deploymentId" TEXT NOT NULL,
    "robotId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "baselineIdAtTime" TEXT,
    "snapshotIdAtTime" TEXT,
    "timeline" TEXT NOT NULL,
    CONSTRAINT "Incident_deploymentId_fkey" FOREIGN KEY ("deploymentId") REFERENCES "Deployment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Incident_robotId_fkey" FOREIGN KEY ("robotId") REFERENCES "Robot" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ShareLink" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tokenHash" TEXT NOT NULL,
    "view" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "audienceLabel" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "revokedAt" DATETIME,
    CONSTRAINT "ShareLink_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Person" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "before" TEXT NOT NULL,
    "after" TEXT NOT NULL,
    CONSTRAINT "AuditEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "Person" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Organization_code_key" ON "Organization"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_name_key" ON "Organization"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Person_email_key" ON "Person"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_code_key" ON "Customer"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Robot_code_key" ON "Robot"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ConfigurationSnapshot_code_key" ON "ConfigurationSnapshot"("code");

-- CreateIndex
CREATE INDEX "ConfigItem_snapshotId_idx" ON "ConfigItem"("snapshotId");

-- CreateIndex
CREATE UNIQUE INDEX "Deployment_code_key" ON "Deployment"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Baseline_code_key" ON "Baseline"("code");

-- CreateIndex
CREATE INDEX "Baseline_deploymentId_idx" ON "Baseline"("deploymentId");

-- CreateIndex
CREATE UNIQUE INDEX "EvidenceItem_code_key" ON "EvidenceItem"("code");

-- CreateIndex
CREATE INDEX "EvidenceItem_deploymentId_idx" ON "EvidenceItem"("deploymentId");

-- CreateIndex
CREATE INDEX "Approval_deploymentId_idx" ON "Approval"("deploymentId");

-- CreateIndex
CREATE UNIQUE INDEX "Change_code_key" ON "Change"("code");

-- CreateIndex
CREATE INDEX "Change_deploymentId_idx" ON "Change"("deploymentId");

-- CreateIndex
CREATE INDEX "ImpactItem_changeId_idx" ON "ImpactItem"("changeId");

-- CreateIndex
CREATE UNIQUE INDEX "Incident_code_key" ON "Incident"("code");

-- CreateIndex
CREATE INDEX "Incident_deploymentId_idx" ON "Incident"("deploymentId");

-- CreateIndex
CREATE UNIQUE INDEX "ShareLink_tokenHash_key" ON "ShareLink"("tokenHash");

-- CreateIndex
CREATE INDEX "AuditEvent_entityType_entityId_idx" ON "AuditEvent"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditEvent_at_idx" ON "AuditEvent"("at");
