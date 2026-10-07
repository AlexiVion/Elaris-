import { createHash } from "node:crypto";
import {
  mkdir,
  mkdtemp,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import type { ComponentHealthEvidenceV03 } from "@/lib/component-health/evidence-engine-v03";
import {
  componentSlug,
  findComponentBySlug,
  loadComponentHealthWorkbench,
  summarizeQualityFindings,
} from "@/lib/component-health/workbench-v04";

const cleanup: string[] = [];
const envBackup = {
  report: process.env.ELARIS_COMPONENT_HEALTH_V03_REPORT,
  root: process.env.ELARIS_COMPONENT_HEALTH_V03_ROOT,
  active: process.env.ELARIS_COMPONENT_HEALTH_ACTIVE_ANALYSIS_ID,
};

afterEach(async () => {
  while (cleanup.length > 0) {
    const path = cleanup.pop();
    if (path) await rm(path, { recursive: true, force: true });
  }

  restoreEnv("ELARIS_COMPONENT_HEALTH_V03_REPORT", envBackup.report);
  restoreEnv("ELARIS_COMPONENT_HEALTH_V03_ROOT", envBackup.root);
  restoreEnv("ELARIS_COMPONENT_HEALTH_ACTIVE_ANALYSIS_ID", envBackup.active);
});

describe("Component Health Audit Workbench V0.4", () => {
  it("discovers and deduplicates byte-identical private V0.3 artifacts", async () => {
    const root = await privateRoot();
    const report = fixtureReport("CH-A03-AAA");

    await writeReport(join(root, "run-a"), report);
    await writeReport(join(root, "run-b"), report);

    process.env.ELARIS_COMPONENT_HEALTH_V03_ROOT = root;
    delete process.env.ELARIS_COMPONENT_HEALTH_V03_REPORT;
    delete process.env.ELARIS_COMPONENT_HEALTH_ACTIVE_ANALYSIS_ID;

    const catalogue = await loadComponentHealthWorkbench();

    expect(catalogue.analyses).toHaveLength(1);
    expect(catalogue.activeAnalysisId).toBe("CH-A03-AAA");
    expect(catalogue.analyses[0]).toMatchObject({
      analysisId: "CH-A03-AAA",
      duplicateCopies: 2,
      inputFingerprintPrefix: "aaaaaaaaaaaaaaaa",
    });
    expect(catalogue.analyses[0]).not.toHaveProperty("path");
  });

  it("fails closed when the same Analysis ID resolves to conflicting report bytes", async () => {
    const root = await privateRoot();
    const first = fixtureReport("CH-A03-CONFLICT");
    const second = fixtureReport("CH-A03-CONFLICT");
    second.quality.findings.push({
      code: "MISSING_COMPONENT_SLOTS",
      severity: "WARNING",
      phaseId: "IDLE_BASELINE",
      message: "conflicting copy",
    });

    await writeReport(join(root, "run-a"), first);
    await writeReport(join(root, "run-b"), second);

    process.env.ELARIS_COMPONENT_HEALTH_V03_ROOT = root;
    delete process.env.ELARIS_COMPONENT_HEALTH_V03_REPORT;

    await expect(loadComponentHealthWorkbench()).rejects.toThrow(
      "Conflicting private V0.3 artifacts"
    );
  });

  it("rejects a V0.3 output pack if the evidence JSON changes after checksum sealing", async () => {
    const root = await privateRoot();
    const directory = join(root, "tampered");
    const report = fixtureReport("CH-A03-TAMPER");
    await writeReport(directory, report);

    await writeFile(
      join(directory, "field-evidence-v03.json"),
      JSON.stringify({ ...report, assessment: "DESCRIPTIVE_OPERATIONAL_EVIDENCE", limitations: ["tampered after sealing"] }, null, 2) + "\n",
      "utf8"
    );

    process.env.ELARIS_COMPONENT_HEALTH_V03_ROOT = root;
    delete process.env.ELARIS_COMPONENT_HEALTH_V03_REPORT;

    await expect(loadComponentHealthWorkbench()).rejects.toThrow(
      "V0.3 output integrity mismatch"
    );
  });

  it("uses the explicitly requested Analysis ID when multiple valid runs exist", async () => {
    const root = await privateRoot();
    await writeReport(join(root, "one"), fixtureReport("CH-A03-ONE"));
    await writeReport(join(root, "two"), fixtureReport("CH-A03-TWO"));

    process.env.ELARIS_COMPONENT_HEALTH_V03_ROOT = root;
    process.env.ELARIS_COMPONENT_HEALTH_ACTIVE_ANALYSIS_ID = "CH-A03-ONE";
    delete process.env.ELARIS_COMPONENT_HEALTH_V03_REPORT;

    const catalogue = await loadComponentHealthWorkbench();
    expect(catalogue.activeAnalysisId).toBe("CH-A03-ONE");
  });

  it("groups repeated quality records without interpreting them as robot failures", () => {
    const groups = summarizeQualityFindings([
      {
        code: "OEM_SEMANTICS_UNCONFIRMED",
        severity: "INFO",
        phaseId: "IDLE_BASELINE",
        componentId: "joint-a",
        signal: "motor.state_code",
        message: "enum unconfirmed",
      },
      {
        code: "OEM_SEMANTICS_UNCONFIRMED",
        severity: "INFO",
        phaseId: "TURNING",
        componentId: "joint-a",
        signal: "motor.state_code",
        message: "enum unconfirmed",
      },
      {
        code: "PHASE_OBSERVATION_ENDS_BEFORE_DECLARED_END",
        severity: "WARNING",
        phaseId: "RECOVERY_IDLE",
        message: "telemetry ended before declared end",
      },
    ]);

    expect(groups[0]).toMatchObject({
      code: "PHASE_OBSERVATION_ENDS_BEFORE_DECLARED_END",
      severity: "WARNING",
      count: 1,
    });
    expect(groups[1]).toMatchObject({
      code: "OEM_SEMANTICS_UNCONFIRMED",
      severity: "INFO",
      count: 2,
      phaseCount: 2,
      componentCount: 1,
    });
  });

  it("maps normalized component identity to stable Workbench slugs", () => {
    const report = fixtureReport("CH-A03-SLUG");
    const component = report.phases[0]!.components[0]!;
    const slug = componentSlug(component);

    expect(slug).toBe("joint-00-left-hip-pitch");
    expect(findComponentBySlug(report, slug)?.oemIndex).toBe(0);
    expect(findComponentBySlug(report, component.componentId)?.oemIndex).toBe(0);
  });
});

async function privateRoot() {
  const root = await mkdtemp(join(tmpdir(), "elaris-workbench-v04-"));
  cleanup.push(root);
  return root;
}

async function writeReport(
  directory: string,
  report: ComponentHealthEvidenceV03
) {
  await mkdir(directory, { recursive: true });

  const files: Array<[string, string]> = [
    ["field-evidence-v03.json", JSON.stringify(report, null, 2) + "\n"],
    ["field-evidence-v03.md", "# fixture\n"],
    ["analysis-run.json", JSON.stringify(report.run, null, 2) + "\n"],
    ["quality-v03.json", JSON.stringify(report.quality, null, 2) + "\n"],
    ["phase-manifest.json", JSON.stringify({ fixture: true }, null, 2) + "\n"],
  ];

  const checksums: string[] = [];
  for (const [file, payload] of files) {
    await writeFile(join(directory, file), payload, "utf8");
    checksums.push(
      createHash("sha256").update(payload).digest("hex") + "  " + file
    );
  }

  await writeFile(
    join(directory, "checksums.sha256"),
    checksums.join("\n") + "\n",
    "utf8"
  );
}

function fixtureReport(analysisId: string): ComponentHealthEvidenceV03 {
  const components = Array.from({ length: 29 }, (_, oemIndex) => ({
    componentId:
      oemIndex === 0
        ? "unitree-g1-joint-00-left-hip-pitch"
        : `unitree-g1-joint-${String(oemIndex).padStart(2, "0")}-slot-${oemIndex}`,
    componentName: oemIndex === 0 ? "Left hip pitch" : `Slot ${oemIndex}`,
    oemIndex,
    availability: "OBSERVED" as const,
    slotStatus: "OBSERVED_USABLE" as const,
    signals: {
      "joint.position": {
        semanticsStatus: "NORMALIZED_OBSERVATION" as const,
        summary: null,
      },
      "joint.velocity": {
        semanticsStatus: "NORMALIZED_OBSERVATION" as const,
        summary: null,
      },
      "joint.torque_estimate": {
        semanticsStatus: "NORMALIZED_ESTIMATE" as const,
        summary: null,
      },
      "motor.voltage": {
        semanticsStatus: "OEM_SEMANTICS_UNCONFIRMED" as const,
        summary: null,
      },
      "motor.temperature.casing": {
        semanticsStatus: "OEM_SEMANTICS_UNCONFIRMED" as const,
        summary: null,
      },
      "motor.temperature.winding": {
        semanticsStatus: "OEM_SEMANTICS_UNCONFIRMED" as const,
        summary: null,
      },
      "motor.state_code": {
        semanticsStatus: "OEM_ENUM_UNCONFIRMED" as const,
        summary: null,
      },
    },
    comparisonsToIdle: {},
    newStateCodesVsIdle: [],
  }));

  return {
    schemaVersion: "0.3.0",
    evidenceClass: "OBSERVED",
    contextEvidenceClass: "HUMAN_CONFIRMED",
    assessment: "DESCRIPTIVE_OPERATIONAL_EVIDENCE",
    sourceClassification: "SENSITIVE",
    run: {
      schemaVersion: "0.3.0",
      engineVersion: "component-health-evidence-engine-v03",
      analysisId,
      inputFingerprint: "a".repeat(64),
      referencePolicy: {
        primary: "SAME_SESSION_PHASE",
        referencePhaseId: "IDLE_BASELINE",
        historicalBaselineRole: "SECONDARY_CONTEXT_ONLY",
      },
      inputs: {
        observed: lineage("OBSERVED-1", "OPEN"),
        historicalBaseline: lineage("BASELINE-1", "FINALIZED"),
        phaseManifestSha256: "b".repeat(64),
      },
    },
    robot: {
      manufacturer: "Unitree",
      model: "G1",
      componentSlots: 29,
    },
    reference: {
      phaseId: "IDLE_BASELINE",
      label: "Idle baseline",
      rule: "SAME_SESSION_IDLE_PRIMARY",
      historicalBaselineSessionId: "BASELINE-1",
      historicalBaselineRole: "SECONDARY_CONTEXT_ONLY",
    },
    phases: [
      {
        phaseId: "IDLE_BASELINE",
        label: "Idle baseline",
        contextEvidenceClass: "HUMAN_CONFIRMED",
        declaredStart: "2026-10-06T15:00:00.000Z",
        declaredEnd: "2026-10-06T15:01:00.000Z",
        observedTelemetryStart: "2026-10-06T15:00:00.000Z",
        observedTelemetryEnd: "2026-10-06T15:00:59.000Z",
        frameCount: 60,
        jointEventCount: 1000,
        componentSlots: 29,
        observedComponentCount: 29,
        components,
      },
    ],
    operationalFingerprints: {
      IDLE_BASELINE: [],
    },
    quality: {
      maxCoverage: 1,
      phaseQuality: [
        {
          phaseId: "IDLE_BASELINE",
          declaredDurationMs: 60_000,
          observedDurationMs: 59_000,
          observedStartLagMs: 0,
          observedEndGapMs: 1_000,
          missingComponentSlots: 0,
          lowCoverageSignalCount: 0,
          duplicateSignalSampleCount: 0,
          maxCoverage: 1,
          maxInterFrameGapMs: 1_000,
          medianInterFrameGapMs: 1_000,
        },
      ],
      findings: [],
    },
    limitations: ["Descriptive operational evidence only."],
  };
}

function lineage(
  sessionId: string,
  sessionState: "OPEN" | "FINALIZED"
) {
  return {
    sessionId,
    sessionState,
    workingCopyKind: "ORIGINAL_CAPTURE" as const,
    plaintextEquivalence: "NOT_APPLICABLE" as const,
    sourceIntegrity: {
      verified: true as const,
      method: "FINALIZED_SHA256_REGISTRY" as const,
      verifiedFiles: ["manifest.enc.json"],
      registrySha256: "c".repeat(64),
    },
    workingCopyIntegrity: {
      verified: true as const,
      method: "FINALIZED_SHA256_REGISTRY" as const,
      verifiedFiles: ["manifest.enc.json"],
      registrySha256: "c".repeat(64),
    },
  };
}

function restoreEnv(name: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[name];
  } else {
    process.env[name] = value;
  }
}
