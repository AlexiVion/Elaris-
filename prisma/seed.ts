/**
 * Elaris seed (spec §9). Deterministic, self-consistent demo data.
 * Clients are fictional (Northgas Energy, Autoline Motors + Humandroid's own
 * lab), dates are in 2026, "Unitree" is spelled correctly. Every indicator in
 * the UI is COMPUTED from this data — nothing here is a pre-rounded metric.
 *
 * Coherence decision (documented in CLAUDE.md §Golden scenario):
 * DEP-0017 evidence/approvals are seeded exactly at the table §9.3 states.
 * The golden change CHG-0005 is preloaded as REVIEW_REQUIRED with the nine
 * ImpactItems the engine produces (all still open), WITHOUT pre-applying the
 * §6.3 confirm-mutations to evidence/approvals — this is the "registered,
 * awaiting resolution" starting point for demo flow B. The Phase-2 golden test
 * reproduces the same nine items from scratch with the engine.
 */
import { PrismaClient } from "@prisma/client";
import { hashSnapshot } from "../lib/engine/hash";
import { serializeSlots, serializeJson } from "../lib/domain/json";
import type { ConfigItemInput } from "../lib/domain/types";
import type { Slot } from "../lib/domain/enums";

const prisma = new PrismaClient();

/** Build ConfigItemInput[] from a slot→value map (vendor/version folded in value). */
function items(map: Partial<Record<Slot, string>>): ConfigItemInput[] {
  return (Object.entries(map) as [Slot, string][]).map(([slot, value]) => ({
    slot,
    value,
    vendor: null,
    version: null,
  }));
}

const d = (iso: string) => new Date(iso);

async function freezeSeedBaselineState(baselineId: string, deploymentId: string) {
  const [evidence, approvals] = await Promise.all([
    prisma.evidenceItem.findMany({ where: { deploymentId, archivedAt: null }, orderBy: { code: "asc" } }),
    prisma.approval.findMany({ where: { deploymentId, status: { not: "REVOKED" } }, orderBy: { title: "asc" } }),
  ]);
  await prisma.baseline.update({
    where: { id: baselineId },
    data: {
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
    },
  });
}

async function main() {
  // ---------------------------------------------------------------- reset
  // migrate reset already drops data; be defensive if run via db:seed alone.
  await prisma.$transaction([
    prisma.componentHealthReviewItem.deleteMany(),
    prisma.componentHealthReview.deleteMany(),
    prisma.auditEvent.deleteMany(),
    prisma.shareLink.deleteMany(),
    prisma.incident.deleteMany(),
    prisma.impactItem.deleteMany(),
    prisma.change.deleteMany(),
    prisma.approval.deleteMany(),
    prisma.evidenceItem.deleteMany(),
    prisma.deploymentRobot.deleteMany(),
  ]);
  await prisma.deployment.updateMany({ data: { activeBaselineId: null } }).catch(() => {});
  await prisma.$transaction([
    prisma.baseline.deleteMany(),
    prisma.deployment.deleteMany(),
    prisma.task.deleteMany(),
    prisma.configItem.deleteMany(),
    prisma.configurationSnapshot.deleteMany(),
    prisma.robot.deleteMany(),
    prisma.site.deleteMany(),
    prisma.customer.deleteMany(),
    prisma.person.deleteMany(),
    prisma.organization.deleteMany(),
  ]);

  // -------------------------------------------------------- organization
  const humandroid = await prisma.organization.create({
    data: { code: "ORG-001", name: "Humandroid" },
  });
  const siglo21 = await prisma.organization.create({
    data: { code: "ORG-S21", name: "Universidad Siglo 21" },
  });

  // ------------------------------------------------------------- persons
  const juan = await prisma.person.create({
    data: { name: "Juan D.", email: "juan@humandroid.example", role: "ENGINEER", organizationName: humandroid.name },
  });
  const mira = await prisma.person.create({
    data: { name: "Mira K.", email: "mira@humandroid.example", role: "ENGINEER", organizationName: humandroid.name },
  });
  const sarah = await prisma.person.create({
    data: { name: "Sarah Chen", email: "sarah@humandroid.example", role: "SAFETY_LEAD", organizationName: humandroid.name },
  });
  const james = await prisma.person.create({
    data: { name: "James Patel", email: "james@northgas.example", role: "CUSTOMER_ENGINEER", organizationName: humandroid.name },
  });

  // ----------------------------------------------------------- customers
  const northgas = await prisma.customer.create({
    data: { code: "CUS-001", name: "Northgas Energy", country: "Norway" },
  });
  const autoline = await prisma.customer.create({
    data: { code: "CUS-002", name: "Autoline Motors", country: "Germany" },
  });
  const lab = await prisma.customer.create({
    data: { code: "CUS-003", name: "Humandroid", country: "Argentina" },
  });

  const northSite = await prisma.site.create({
    data: { customerId: northgas.id, name: "North gas facility", city: "Bergen", country: "Norway", environmentType: "GAS_FACILITY" },
  });
  const autoSite = await prisma.site.create({
    data: { customerId: autoline.id, name: "Autoline Plant 1", city: "Stuttgart", country: "Germany", environmentType: "INDOOR_INDUSTRIAL" },
  });
  const labSite = await prisma.site.create({
    data: { customerId: lab.id, hostOrganizationId: humandroid.id, name: "Humandroid Lab", city: "Buenos Aires", country: "Argentina", environmentType: "LAB" },
  });
  const siglo21Site = await prisma.site.create({
    data: {
      customerId: null,
      hostOrganizationId: siglo21.id,
      name: "Universidad Siglo 21",
      city: "Córdoba",
      country: "Argentina",
      environmentType: null,
    },
  });

  // -------------------------------------------------------------- robots
  const robotDefs = [
    { code: "G1 #012", serial: "UT-G1-2026-012", status: "ACTIVE" },
    { code: "G1 #013", serial: "UT-G1-2026-013", status: "ACTIVE" },
    { code: "G1 #014", serial: "UT-G1-2026-014", status: "INACTIVE" }, // at least one inactive (§9.1)
    { code: "G1 #015", serial: "UT-G1-2026-015", status: "ACTIVE" },
    { code: "G1 #016", serial: "UT-G1-2026-016", status: "ACTIVE" },
    { code: "G1 #017", serial: "UT-G1-2026-017", status: "ACTIVE" },
  ];
  const robots: Record<string, { id: string }> = {};
  for (const r of robotDefs) {
    robots[r.code] = await prisma.robot.create({
      data: { code: r.code, model: "Unitree G1", serialNumber: r.serial, status: r.status },
    });
  }
  const r017 = robots["G1 #017"]!;
  const r012 = robots["G1 #012"]!;
  const r016 = robots["G1 #016"]!;
  const rSiglo21 = await prisma.robot.create({
    data: {
      code: "G1-S21",
      model: "Unitree G1",
      serialNumber: null,
      status: "ACTIVE",
    },
  });

  // --------------------------------------------------------- snapshots (G1 #017)
  // Chain: C003 (firmware 1.4.1) --CHG-0003 approved--> C004 (active, baseline B-0017-01)
  //        C004 --CHG-0005 (golden, review required)--> C005
  const base017 = {
    CHASSIS: "Unitree G1",
    HANDS: "BrainCo Revo2",
    FIRMWARE: "1.4.2",
    CONTROL_STACK: "Humandroid Control v2.3",
    SKILL: "Valve Manipulation v4",
    AI_MODEL: "VLA-HM-12",
    NETWORK_PROFILE: "Plant Profile A",
    OPERATING_LIMITS: "Max speed 0.5 m/s in shared zone",
  } satisfies Partial<Record<Slot, string>>;

  const c003Items = items({ ...base017, FIRMWARE: "1.4.1" });
  const c004Items = items(base017);
  const c005Items = items({ ...base017, HANDS: "Inspire RH56DFX", CONTROL_STACK: "Humandroid Control v2.4" });

  const c003 = await prisma.configurationSnapshot.create({
    data: {
      code: "C003", robotId: r017.id, hash: hashSnapshot(c003Items), createdById: juan.id,
      note: "Pre-firmware-update baseline", createdAt: d("2026-07-10T09:00:00Z"),
      items: { create: c003Items.map((i) => ({ slot: i.slot, value: i.value })) },
    },
  });
  const c004 = await prisma.configurationSnapshot.create({
    data: {
      code: "C004", robotId: r017.id, parentSnapshotId: c003.id, hash: hashSnapshot(c004Items), createdById: juan.id,
      note: "Firmware updated to 1.4.2", createdAt: d("2026-08-05T11:30:00Z"),
      items: { create: c004Items.map((i) => ({ slot: i.slot, value: i.value })) },
    },
  });
  const c005 = await prisma.configurationSnapshot.create({
    data: {
      code: "C005", robotId: r017.id, parentSnapshotId: c004.id, hash: hashSnapshot(c005Items), createdById: mira.id,
      note: "Hand + control stack change (proposed)", createdAt: d("2026-09-29T14:20:00Z"),
      items: { create: c005Items.map((i) => ({ slot: i.slot, value: i.value })) },
    },
  });

  // ------------------------------------------------------ snapshots (other robots)
  const c100Items = items({ CHASSIS: "Unitree G1", HANDS: "Inspire RH56DFX", FIRMWARE: "1.4.2", CONTROL_STACK: "Humandroid Control v2.4", SKILL: "Assembly Pick v2", AI_MODEL: "VLA-HM-12", NETWORK_PROFILE: "Plant Profile B", OPERATING_LIMITS: "Max speed 0.8 m/s separated zone" });
  const c100 = await prisma.configurationSnapshot.create({
    data: { code: "C100", robotId: r012.id, hash: hashSnapshot(c100Items), createdById: mira.id, note: "Assembly line config", createdAt: d("2026-08-20T10:00:00Z"), items: { create: c100Items.map((i) => ({ slot: i.slot, value: i.value })) } },
  });
  const c200Items = items({ CHASSIS: "Unitree G1", HANDS: "BrainCo Revo2", FIRMWARE: "1.4.2", CONTROL_STACK: "Humandroid Control v2.3", SKILL: "Warehouse Pick v1", AI_MODEL: "VLA-HM-11", NETWORK_PROFILE: "Lab Profile", OPERATING_LIMITS: "Max speed 1.0 m/s test zone" });
  const c200 = await prisma.configurationSnapshot.create({
    data: { code: "C200", robotId: r016.id, hash: hashSnapshot(c200Items), createdById: juan.id, note: "Warehouse demo config", createdAt: d("2026-09-01T09:00:00Z"), items: { create: c200Items.map((i) => ({ slot: i.slot, value: i.value })) } },
  });

  // Real-context-safe Siglo 21 fixture. Only user-confirmed/public-safe facts
  // are materialized here; serial, firmware, task and operating semantics stay unknown.
  const cSiglo21Items = items({ CHASSIS: "Unitree G1" });
  const cSiglo21 = await prisma.configurationSnapshot.create({
    data: {
      code: "C-S21-001",
      robotId: rSiglo21.id,
      hash: hashSnapshot(cSiglo21Items),
      createdById: juan.id,
      note: "Institutional placement reference; configuration intentionally incomplete",
      createdAt: d("2026-10-07T12:00:00Z"),
      items: { create: cSiglo21Items.map((i) => ({ slot: i.slot, value: i.value })) },
    },
  });

  // --------------------------------------------------------------- tasks
  const valveTask = await prisma.task.create({
    data: { name: "Valve manipulation", description: "Inspect and manipulate valves in a live gas facility.", parameters: serializeJson({ torqueLimitNm: 12, approachSpeed: "slow" }) },
  });
  const assemblyTask = await prisma.task.create({
    data: { name: "Assembly component handling", description: "Pick and place assembly components on the line.", parameters: serializeJson({ cycleTimeS: 30 }) },
  });
  const warehouseTask = await prisma.task.create({
    data: { name: "Warehouse manipulation", description: "Picking sequence demo in the lab.", parameters: serializeJson({ binHeightCm: 80 }) },
  });

  // ------------------------------------- real institutional placement DEP-S21-001
  const depSiglo21 = await prisma.deployment.create({
    data: {
      code: "DEP-S21-001",
      name: "Siglo 21 Institutional Placement",
      contextKind: "INSTITUTIONAL_PLACEMENT",
      providerOrganizationId: humandroid.id,
      customerId: null,
      siteId: siglo21Site.id,
      taskId: null,
      lifecycle: null,
      operationalState: "PRESENT",
      operatingMode: null,
      humanExposure: null,
      description:
        "Humandroid Unitree G1 physically hosted at Universidad Siglo 21 under an institutional agreement. No commercial customer or task-specific production assignment is inferred.",
      deploymentRobots: { create: [{ robotId: rSiglo21.id }] },
    },
  });

  const blSiglo21 = await prisma.baseline.create({
    data: {
      code: "B-S21-001",
      deploymentId: depSiglo21.id,
      snapshotId: cSiglo21.id,
      taskSnapshot: null,
      environmentSnapshot: serializeJson({
        contextKind: "INSTITUTIONAL_PLACEMENT",
        providerOrganization: { code: humandroid.code, name: humandroid.name },
        hostOrganization: { code: siglo21.code, name: siglo21.name },
        customer: null,
        site: {
          name: siglo21Site.name,
          city: siglo21Site.city,
          country: siglo21Site.country,
          environmentType: null,
        },
        lifecycle: null,
        operationalState: "PRESENT",
        operatingMode: null,
        humanExposure: null,
      }),
      evidenceState: serializeJson([]),
      approvalState: serializeJson([]),
      hash: hashSnapshot(cSiglo21Items),
      frozenById: juan.id,
      frozenAt: d("2026-10-07T12:00:00Z"),
    },
  });
  await prisma.deployment.update({
    where: { id: depSiglo21.id },
    data: { activeBaselineId: blSiglo21.id },
  });

  // --------------------------------------------------- deployment DEP-0017
  const dep17 = await prisma.deployment.create({
    data: {
      code: "DEP-0017", name: "Valve Inspection Pilot", contextKind: "COMMERCIAL_DEPLOYMENT", providerOrganizationId: humandroid.id, customerId: northgas.id, siteId: northSite.id, taskId: valveTask.id,
      lifecycle: "PILOT", operationalState: "LIVE", operatingMode: "SUPERVISED", humanExposure: "SHARED_AREA",
      description:
        "Pilot deployment of the Unitree G1 for valve inspection and manipulation tasks at the Northgas Energy North gas facility. The deployment validates end-to-end operation in a live gas facility with human workers in shared areas, under supervised operation.",
      deploymentRobots: { create: [{ robotId: r017.id }] },
    },
  });

  // Prior baseline over C003, then active baseline over C004 (§9.4 history).
  const bl017_00 = await prisma.baseline.create({
    data: {
      code: "B-0017-00", deploymentId: dep17.id, snapshotId: c003.id,
      taskSnapshot: serializeJson({ name: valveTask.name, description: valveTask.description, parameters: JSON.parse(valveTask.parameters) }),
      environmentSnapshot: serializeJson({
        customer: { code: northgas.code, name: northgas.name, country: northgas.country },
        site: { name: northSite.name, city: northSite.city, country: northSite.country, environmentType: northSite.environmentType },
        lifecycle: "PILOT", operatingMode: "SUPERVISED", humanExposure: "SHARED_AREA",
      }),
      evidenceState: serializeJson([]), approvalState: serializeJson([]),
      hash: hashSnapshot(c003Items), frozenById: sarah.id, frozenAt: d("2026-07-12T16:00:00Z"),
    },
  });
  const bl017_01 = await prisma.baseline.create({
    data: {
      code: "B-0017-01", deploymentId: dep17.id, snapshotId: c004.id,
      taskSnapshot: serializeJson({ name: valveTask.name, description: valveTask.description, parameters: JSON.parse(valveTask.parameters) }),
      environmentSnapshot: serializeJson({
        customer: { code: northgas.code, name: northgas.name, country: northgas.country },
        site: { name: northSite.name, city: northSite.city, country: northSite.country, environmentType: northSite.environmentType },
        lifecycle: "PILOT", operatingMode: "SUPERVISED", humanExposure: "SHARED_AREA",
      }),
      evidenceState: serializeJson([]), approvalState: serializeJson([]),
      hash: hashSnapshot(c004Items), frozenById: sarah.id, frozenAt: d("2026-08-06T16:00:00Z"),
    },
  });
  await prisma.deployment.update({ where: { id: dep17.id }, data: { activeBaselineId: bl017_01.id } });

  // ---- Evidence & requirements of DEP-0017 (verbatim table §9.3) ----
  type Ev = {
    code: string; title: string; category: "EVIDENCE" | "REQUIREMENT"; kind: string; readiness: string;
    source: string; scope: Slot[]; crit: "HIGH" | "MEDIUM" | "LOW"; required: boolean; status: string; owner: string; uri?: string | null;
  };
  const owners: Record<string, string> = { juan: juan.id, mira: mira.id, sarah: sarah.id, james: james.id };
  const evidence17: Ev[] = [
    { code: "INT-042", title: "Integration test", category: "EVIDENCE", kind: "TEST", readiness: "SAFETY_EVIDENCE", source: "INTERNAL", scope: ["HANDS", "CONTROL_STACK"], crit: "HIGH", required: true, status: "VALID", owner: "juan", uri: "https://docs.humandroid.example/int-042" },
    { code: "SAF-017", title: "Safety assessment", category: "REQUIREMENT", kind: "RISK_ASSESSMENT", readiness: "SAFETY_EVIDENCE", source: "INTERNAL", scope: ["HANDS", "SKILL", "OPERATING_LIMITS"], crit: "HIGH", required: true, status: "VALID", owner: "sarah", uri: "https://docs.humandroid.example/saf-017" },
    { code: "CTD-009", title: "Customer technical dossier", category: "EVIDENCE", kind: "TECHNICAL_DOSSIER", readiness: "CUSTOMER_REQUIREMENTS", source: "CUSTOMER", scope: ["HANDS", "FIRMWARE", "CONTROL_STACK"], crit: "MEDIUM", required: true, status: "VALID", owner: "james", uri: "https://docs.humandroid.example/ctd-009" },
    { code: "INS-003", title: "Insurance appendix", category: "REQUIREMENT", kind: "INSURANCE_APPENDIX", readiness: "INSURANCE", source: "INSURER", scope: ["HANDS"], crit: "MEDIUM", required: false, status: "VALID", owner: "mira", uri: "https://docs.humandroid.example/ins-003" },
    { code: "CAL-021", title: "Calibration record", category: "EVIDENCE", kind: "CALIBRATION", readiness: "SAFETY_EVIDENCE", source: "INTERNAL", scope: ["HANDS"], crit: "LOW", required: true, status: "VALID", owner: "juan", uri: "https://docs.humandroid.example/cal-021" },
    { code: "SZL-004", title: "Shared-zone operating limits", category: "REQUIREMENT", kind: "OPERATING_LIMIT", readiness: "SAFETY_EVIDENCE", source: "REGULATION", scope: ["HANDS", "OPERATING_LIMITS"], crit: "LOW", required: true, status: "VALID", owner: "sarah", uri: "https://docs.humandroid.example/szl-004" },
    { code: "ESV-001", title: "Emergency stop validation", category: "EVIDENCE", kind: "TEST", readiness: "SAFETY_EVIDENCE", source: "INTERNAL", scope: ["CHASSIS", "FIRMWARE"], crit: "HIGH", required: true, status: "VALID", owner: "juan", uri: null /* valid but not yet linked in Elaris → coverage < 100% */ },
    { code: "SZR-002", title: "Shared-zone risk assessment", category: "REQUIREMENT", kind: "RISK_ASSESSMENT", readiness: "SAFETY_EVIDENCE", source: "INTERNAL", scope: ["SAFETY_ZONE", "TASK_PARAMETERS"], crit: "MEDIUM", required: true, status: "IN_REVIEW", owner: "sarah" },
    { code: "NET-002", title: "Network access review", category: "REQUIREMENT", kind: "PROCEDURE", readiness: "CONFIGURATION", source: "CUSTOMER", scope: ["NETWORK_PROFILE"], crit: "MEDIUM", required: true, status: "NOT_STARTED", owner: "james" },
    { code: "OPT-005", title: "Operator training record", category: "REQUIREMENT", kind: "PROCEDURE", readiness: "CUSTOMER_REQUIREMENTS", source: "CUSTOMER", scope: ["TASK_PARAMETERS"], crit: "MEDIUM", required: true, status: "MISSING", owner: "james" },
    { code: "SAT-006", title: "Site acceptance test", category: "REQUIREMENT", kind: "TEST", readiness: "CUSTOMER_REQUIREMENTS", source: "CUSTOMER", scope: ["SAFETY_ZONE"], crit: "MEDIUM", required: true, status: "MISSING", owner: "james" },
    { code: "MNT-001", title: "Maintenance plan", category: "EVIDENCE", kind: "MAINTENANCE_PLAN", readiness: "MAINTENANCE", source: "INTERNAL", scope: ["CHASSIS"], crit: "LOW", required: true, status: "VALID", owner: "mira", uri: "https://docs.humandroid.example/mnt-001" },
  ];
  const evId: Record<string, string> = {};
  for (const e of evidence17) {
    const created = await prisma.evidenceItem.create({
      data: {
        code: e.code, title: e.title, category: e.category, kind: e.kind, readinessCategory: e.readiness, source: e.source,
        deploymentId: dep17.id, scopeSlots: serializeSlots(e.scope), criticality: e.crit, status: e.status,
        required: e.required, applicable: true, ownerPersonId: owners[e.owner]!, uri: e.uri ?? null,
        dueDate: e.status === "MISSING" ? d("2026-10-10T00:00:00Z") : null,
      },
    });
    evId[e.code] = created.id;
  }

  // ---- Approvals of DEP-0017 (table §9.3) ----
  const apSafety = await prisma.approval.create({
    data: { title: "Safety approval", deploymentId: dep17.id, readinessCategory: "SAFETY_EVIDENCE", approverPersonId: sarah.id, role: "SAFETY_LEAD", scopeSlots: serializeSlots(["HANDS", "SKILL", "OPERATING_LIMITS"]), status: "APPROVED", decidedAt: d("2026-08-06T15:00:00Z"), baselineId: bl017_01.id },
  });
  const apCustEng = await prisma.approval.create({
    data: { title: "Customer engineering approval", deploymentId: dep17.id, readinessCategory: "CUSTOMER_REQUIREMENTS", approverPersonId: james.id, role: "CUSTOMER_ENGINEER", scopeSlots: serializeSlots(["HANDS", "CHASSIS"]), status: "APPROVED", decidedAt: d("2026-08-06T15:30:00Z"), baselineId: bl017_01.id },
  });
  await prisma.approval.create({
    data: { title: "Customer technical approval", deploymentId: dep17.id, readinessCategory: "CUSTOMER_REQUIREMENTS", approverPersonId: james.id, role: "CUSTOMER_ENGINEER", scopeSlots: serializeSlots(["TASK_PARAMETERS", "SAFETY_ZONE"]), status: "PENDING" },
  });

  // The active demo baseline must be reconstructable from frozen state. The
  // older B-0017-00 fixture intentionally lacks historical evidence data that
  // was never modeled; do not fabricate it.
  await freezeSeedBaselineState(bl017_01.id, dep17.id);

  // ---- Prior approved change CHG-0003 (firmware 1.4.1 → 1.4.2) ----
  await prisma.change.create({
    data: {
      code: "CHG-0003", deploymentId: dep17.id, robotId: r017.id, beforeSnapshotId: c003.id, afterSnapshotId: c004.id,
      diff: serializeJson([{ slot: "FIRMWARE", before: "1.4.1", after: "1.4.2", type: "CHANGED" }]),
      authorId: juan.id, status: "APPROVED", approvedById: sarah.id, approvedAt: d("2026-08-05T15:00:00Z"), createdAt: d("2026-08-04T10:00:00Z"),
    },
  });

  // ---- Golden change CHG-0005 (C004 → C005), REVIEW_REQUIRED ----
  const chg5 = await prisma.change.create({
    data: {
      code: "CHG-0005", deploymentId: dep17.id, robotId: r017.id, beforeSnapshotId: c004.id, afterSnapshotId: c005.id,
      diff: serializeJson([
        { slot: "HANDS", before: "BrainCo Revo2", after: "Inspire RH56DFX", type: "CHANGED" },
        { slot: "CONTROL_STACK", before: "Humandroid Control v2.3", after: "Humandroid Control v2.4", type: "CHANGED" },
      ]),
      authorId: mira.id, status: "REVIEW_REQUIRED", createdAt: d("2026-09-29T14:22:00Z"),
    },
  });

  // The nine ImpactItems the engine produces (spec §9.3 expected table).
  // Order: severity HIGH→LOW, then code (approvals/checks after coded items).
  const impact = [
    { targetType: "EVIDENCE", code: "INT-042", title: "Integration test (INT-042)", reason: "Hand interface changed", action: "RE_RUN", severity: "HIGH", status: "PENDING" },
    { targetType: "REQUIREMENT", code: "SAF-017", title: "Safety assessment (SAF-017)", reason: "New hand requires safety assessment update", action: "REVIEW", severity: "HIGH", status: "IN_REVIEW" },
    { targetType: "APPROVAL", code: null, title: "Safety approval", reason: "Hardware change requires safety re-approval", action: "RE_APPROVE", severity: "HIGH", status: "PENDING", refApprovalId: apSafety.id },
    { targetType: "EVIDENCE", code: "CTD-009", title: "Customer technical dossier (CTD-009)", reason: "Hardware change affects technical specification", action: "UPDATE", severity: "MEDIUM", status: "PENDING" },
    { targetType: "REQUIREMENT", code: "INS-003", title: "Insurance appendix (INS-003)", reason: "Hardware change may affect insurance terms", action: "REVIEW", severity: "MEDIUM", status: "PENDING" },
    { targetType: "APPROVAL", code: null, title: "Customer engineering approval", reason: "Customer must approve new hand hardware", action: "RE_APPROVE", severity: "MEDIUM", status: "PENDING", refApprovalId: apCustEng.id },
    { targetType: "EVIDENCE", code: "CAL-021", title: "Calibration record (CAL-021)", reason: "New hand requires calibration record", action: "RE_RUN", severity: "LOW", status: "PENDING" },
    { targetType: "REQUIREMENT", code: "SZL-004", title: "Shared-zone operating limits (SZL-004)", reason: "Grasp characteristics may affect operating limits", action: "CONFIRM", severity: "LOW", status: "PENDING" },
    { targetType: "CHECK", code: null, title: "Confirm no cyber impact", reason: "Firmware/control-stack/network change requires a cyber-impact confirmation", action: "CONFIRM", severity: "LOW", status: "PENDING" },
  ] as const;

  for (const it of impact) {
    const targetId =
      it.targetType === "APPROVAL" ? (it as { refApprovalId?: string }).refApprovalId ?? null
      : it.code ? evId[it.code] ?? null
      : null;
    await prisma.impactItem.create({
      data: {
        changeId: chg5.id, targetType: it.targetType, targetId, title: it.title, reason: it.reason,
        suggestedAction: it.action, severity: it.severity, status: it.status,
      },
    });
  }

  // -------------------------------------------- deployment DEP-0021 (Autoline)
  const dep21 = await prisma.deployment.create({
    data: {
      code: "DEP-0021", name: "Assembly Line Pilot", customerId: autoline.id, siteId: autoSite.id, taskId: assemblyTask.id,
      lifecycle: "LIMITED", operationalState: "LIVE", operatingMode: "AUTONOMOUS_ZONED", humanExposure: "SEPARATED",
      description: "Limited production pilot handling assembly components on the Autoline Motors line under zoned autonomous operation.",
      deploymentRobots: { create: [{ robotId: r012.id }] },
    },
  });
  const bl21 = await prisma.baseline.create({
    data: {
      code: "B-0021-01", deploymentId: dep21.id, snapshotId: c100.id,
      taskSnapshot: serializeJson({ name: assemblyTask.name, description: assemblyTask.description, parameters: JSON.parse(assemblyTask.parameters) }),
      environmentSnapshot: serializeJson({
        customer: { code: autoline.code, name: autoline.name, country: autoline.country },
        site: { name: autoSite.name, city: autoSite.city, country: autoSite.country, environmentType: autoSite.environmentType },
        lifecycle: "LIMITED", operatingMode: "AUTONOMOUS_ZONED", humanExposure: "SEPARATED",
      }),
      evidenceState: serializeJson([]), approvalState: serializeJson([]), hash: hashSnapshot(c100Items), frozenById: sarah.id, frozenAt: d("2026-08-21T12:00:00Z"),
    },
  });
  await prisma.deployment.update({ where: { id: dep21.id }, data: { activeBaselineId: bl21.id } });
  const ev21: Ev[] = [
    { code: "INT-051", title: "Integration test", category: "EVIDENCE", kind: "TEST", readiness: "SAFETY_EVIDENCE", source: "INTERNAL", scope: ["HANDS", "CONTROL_STACK"], crit: "HIGH", required: true, status: "VALID", owner: "mira", uri: "https://docs.humandroid.example/int-051" },
    { code: "SAF-030", title: "Safety assessment", category: "REQUIREMENT", kind: "RISK_ASSESSMENT", readiness: "SAFETY_EVIDENCE", source: "INTERNAL", scope: ["HANDS", "SKILL"], crit: "HIGH", required: true, status: "VALID", owner: "sarah", uri: "https://docs.humandroid.example/saf-030" },
    { code: "MNT-010", title: "Maintenance plan", category: "EVIDENCE", kind: "MAINTENANCE_PLAN", readiness: "MAINTENANCE", source: "INTERNAL", scope: ["CHASSIS"], crit: "LOW", required: true, status: "VALID", owner: "mira", uri: "https://docs.humandroid.example/mnt-010" },
    { code: "SAT-014", title: "Site acceptance test", category: "REQUIREMENT", kind: "TEST", readiness: "CUSTOMER_REQUIREMENTS", source: "CUSTOMER", scope: ["SAFETY_ZONE"], crit: "MEDIUM", required: true, status: "REVIEW_REQUIRED", owner: "james" },
  ];
  for (const e of ev21) {
    await prisma.evidenceItem.create({ data: { code: e.code, title: e.title, category: e.category, kind: e.kind, readinessCategory: e.readiness, source: e.source, deploymentId: dep21.id, scopeSlots: serializeSlots(e.scope), criticality: e.crit, status: e.status, required: e.required, applicable: true, ownerPersonId: owners[e.owner]!, uri: e.uri ?? null } });
  }
  await prisma.approval.create({ data: { title: "Safety approval", deploymentId: dep21.id, readinessCategory: "SAFETY_EVIDENCE", approverPersonId: sarah.id, role: "SAFETY_LEAD", scopeSlots: serializeSlots(["HANDS", "SKILL"]), status: "APPROVED", decidedAt: d("2026-08-21T11:00:00Z"), baselineId: bl21.id } });
  await freezeSeedBaselineState(bl21.id, dep21.id);

  // ------------------------------------------ deployment DEP-0009 (Humandroid lab)
  const dep09 = await prisma.deployment.create({
    data: {
      code: "DEP-0009", name: "Warehouse Manipulation Demo", customerId: lab.id, siteId: labSite.id, taskId: warehouseTask.id,
      lifecycle: "TEST", operationalState: "LIVE", operatingMode: "TELEOPERATED", humanExposure: "NONE",
      description: "Internal test deployment demonstrating a warehouse picking sequence in the Humandroid lab.",
      deploymentRobots: { create: [{ robotId: r016.id }] },
    },
  });
  const bl09 = await prisma.baseline.create({
    data: {
      code: "B-0009-01", deploymentId: dep09.id, snapshotId: c200.id,
      taskSnapshot: serializeJson({ name: warehouseTask.name, description: warehouseTask.description, parameters: JSON.parse(warehouseTask.parameters) }),
      environmentSnapshot: serializeJson({
        customer: { code: lab.code, name: lab.name, country: lab.country },
        site: { name: labSite.name, city: labSite.city, country: labSite.country, environmentType: labSite.environmentType },
        lifecycle: "TEST", operatingMode: "TELEOPERATED", humanExposure: "NONE",
      }),
      evidenceState: serializeJson([]), approvalState: serializeJson([]), hash: hashSnapshot(c200Items), frozenById: sarah.id, frozenAt: d("2026-09-02T12:00:00Z"),
    },
  });
  await prisma.deployment.update({ where: { id: dep09.id }, data: { activeBaselineId: bl09.id } });
  const ev09: Ev[] = [
    { code: "INT-060", title: "Integration test", category: "EVIDENCE", kind: "TEST", readiness: "SAFETY_EVIDENCE", source: "INTERNAL", scope: ["HANDS", "CONTROL_STACK"], crit: "MEDIUM", required: true, status: "VALID", owner: "juan", uri: "https://docs.humandroid.example/int-060" },
    { code: "CAL-030", title: "Calibration record", category: "EVIDENCE", kind: "CALIBRATION", readiness: "SAFETY_EVIDENCE", source: "INTERNAL", scope: ["HANDS"], crit: "LOW", required: true, status: "NOT_STARTED", owner: "juan" },
    { code: "MNT-020", title: "Maintenance plan", category: "EVIDENCE", kind: "MAINTENANCE_PLAN", readiness: "MAINTENANCE", source: "INTERNAL", scope: ["CHASSIS"], crit: "LOW", required: false, status: "VALID", owner: "mira", uri: "https://docs.humandroid.example/mnt-020" },
  ];
  for (const e of ev09) {
    await prisma.evidenceItem.create({ data: { code: e.code, title: e.title, category: e.category, kind: e.kind, readinessCategory: e.readiness, source: e.source, deploymentId: dep09.id, scopeSlots: serializeSlots(e.scope), criticality: e.crit, status: e.status, required: e.required, applicable: true, ownerPersonId: owners[e.owner]!, uri: e.uri ?? null } });
  }
  await freezeSeedBaselineState(bl09.id, dep09.id);

  // ------------------------------------------------------------ incidents
  await prisma.incident.create({
    data: { code: "INC-2026-001", occurredAt: d("2026-09-20T10:14:00Z"), deploymentId: dep17.id, robotId: r017.id, description: "Near miss: person entered restricted area", severity: "MEDIUM", status: "INVESTIGATING", baselineIdAtTime: bl017_01.id, snapshotIdAtTime: c004.id, timeline: serializeJson([{ at: "10:14:01", note: "Person detected in restricted zone" }, { at: "10:14:03", note: "Robot paused, safe state entered" }, { at: "10:14:20", note: "Operator acknowledged, area cleared" }]) },
  });
  await prisma.incident.create({
    data: { code: "INC-2026-002", occurredAt: d("2026-09-05T15:03:00Z"), deploymentId: dep09.id, robotId: r016.id, description: "Grasp failure during picking sequence", severity: "LOW", status: "CLOSED", baselineIdAtTime: bl09.id, snapshotIdAtTime: c200.id, timeline: serializeJson([{ at: "15:03:10", note: "Object slipped from grasp" }, { at: "15:03:12", note: "Retry succeeded" }]) },
  });

  // ---------------------------------------------------- historical audit
  // Backdated events so Home's "vs last 30 days" deltas are reconstructable
  // from real history (spec §6.7 decision (a)) instead of invented.
  const audit = [
    { at: "2026-08-04T10:00:00Z", actor: juan.id, action: "CHANGE_CREATED", entityType: "Change", entityId: "CHG-0003" },
    { at: "2026-08-05T15:00:00Z", actor: sarah.id, action: "CHANGE_APPROVED", entityType: "Change", entityId: "CHG-0003" },
    { at: "2026-08-06T16:00:00Z", actor: sarah.id, action: "BASELINE_FROZEN", entityType: "Baseline", entityId: "B-0017-01" },
    { at: "2026-09-10T09:00:00Z", actor: james.id, action: "EVIDENCE_ADDED", entityType: "EvidenceItem", entityId: "OPT-005" },
    { at: "2026-09-20T10:20:00Z", actor: sarah.id, action: "INCIDENT_LOGGED", entityType: "Incident", entityId: "INC-2026-001" },
    { at: "2026-09-29T14:22:00Z", actor: mira.id, action: "CHANGE_CREATED", entityType: "Change", entityId: "CHG-0005" },
  ];
  for (const a of audit) {
    await prisma.auditEvent.create({ data: { at: d(a.at), actorId: a.actor, action: a.action, entityType: a.entityType, entityId: a.entityId, before: serializeJson(null), after: serializeJson(null) } });
  }

  console.log("Seed complete: 1 org, 4 persons, 3 customers, 6 robots, 3 deployments, golden change CHG-0005 preloaded.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
