import { createHash } from "node:crypto";
import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  analyzeComponentHealthEvidenceV03,
  type ComponentHealthEvidenceV03Input,
} from "@/lib/component-health/evidence-engine-v03";
import type { FieldPhaseManifest } from "@/lib/component-health/field-evidence";
import { CaptureSessionWriter } from "@/lib/edge-collector/session";
import type { NormalizedTelemetryEvent } from "@/lib/robot-adapters";

const cleanup: string[] = [];
const PASSPHRASE = "correct-horse-battery-staple";

afterEach(async () => {
  while (cleanup.length > 0) {
    const path = cleanup.pop();
    if (path) await rm(path, { recursive: true, force: true });
  }
});

describe("Component Health Evidence Engine V0.3", () => {
  it("uses same-session IDLE_BASELINE as primary reference and emits the complete 29-slot matrix", async () => {
    const fixture = await createFixture();
    const salvage = await writeRegistry(fixture.observedDir, "salvage.sha256");

    const report = await analyzeComponentHealthEvidenceV03({
      baselineDir: fixture.baselineDir,
      sessionDir: fixture.observedDir,
      passphrase: PASSPHRASE,
      phaseManifest: fixture.phaseManifest,
      salvageHashFile: salvage,
    });

    expect(report).toMatchObject({
      schemaVersion: "0.3.0",
      evidenceClass: "OBSERVED",
      assessment: "DESCRIPTIVE_OPERATIONAL_EVIDENCE",
      reference: {
        phaseId: "IDLE_BASELINE",
        rule: "SAME_SESSION_IDLE_PRIMARY",
        historicalBaselineRole: "SECONDARY_CONTEXT_ONLY",
      },
      robot: {
        manufacturer: "Unitree",
        model: "G1",
        componentSlots: 29,
      },
    });

    expect(report.phases).toHaveLength(2);
    expect(report.phases.every((phase) => phase.components.length === 29)).toBe(true);

    const controlled = report.phases.find(
      (phase) => phase.phaseId === "CONTROLLED_LOAD"
    )!;
    const knee = controlled.components.find((component) => component.oemIndex === 3)!;

    expect(knee.availability).toBe("OBSERVED");
    expect(
      knee.comparisonsToIdle["joint.torque_estimate"]?.baselineAbsP95
    ).toBe(10);
    expect(
      knee.comparisonsToIdle["joint.torque_estimate"]?.observedAbsP95
    ).toBe(20);
    expect(
      knee.comparisonsToIdle["joint.torque_estimate"]?.absP95Ratio
    ).toBe(2);

    const missing = controlled.components.find((component) => component.oemIndex === 0)!;
    expect(missing.availability).toBe("MISSING");
    expect(missing.signals["joint.torque_estimate"].summary).toBeNull();

    expect(report.quality.maxCoverage).toBe(1);
    expect(report.operationalFingerprints.CONTROLLED_LOAD?.[0]).toMatchObject({
      oemIndex: 3,
      ratio: 2,
    });
  });

  it("produces a stable analysis id and input fingerprint for identical inputs", async () => {
    const fixture = await createFixture();
    const salvage = await writeRegistry(fixture.observedDir, "salvage.sha256");
    const input: ComponentHealthEvidenceV03Input = {
      baselineDir: fixture.baselineDir,
      sessionDir: fixture.observedDir,
      passphrase: PASSPHRASE,
      phaseManifest: fixture.phaseManifest,
      salvageHashFile: salvage,
    };

    const first = await analyzeComponentHealthEvidenceV03(input);
    const second = await analyzeComponentHealthEvidenceV03(input);

    expect(second.run.analysisId).toBe(first.run.analysisId);
    expect(second.run.inputFingerprint).toBe(first.run.inputFingerprint);
    expect(second).toEqual(first);
  });

  it("separates source and derivative lineage for the historical baseline", async () => {
    const fixture = await createFixture();
    const salvage = await writeRegistry(fixture.observedDir, "salvage.sha256");

    const derivativeDir = join(
      dirname(dirname(fixture.baselineDir)),
      "baseline-derivative",
      basename(fixture.baselineDir)
    );
    await mkdir(dirname(derivativeDir), { recursive: true });
    await cp(fixture.baselineDir, derivativeDir, { recursive: true });
    const derivativeHashes = await writeRegistry(
      derivativeDir,
      "derivative.sha256"
    );

    const report = await analyzeComponentHealthEvidenceV03({
      baselineDir: derivativeDir,
      sessionDir: fixture.observedDir,
      passphrase: PASSPHRASE,
      phaseManifest: fixture.phaseManifest,
      salvageHashFile: salvage,
      baselineSourceDir: fixture.baselineDir,
      baselineSourceHashFile: join(fixture.baselineDir, "checksums.sha256"),
      baselineDerivativeHashFile: derivativeHashes,
    });

    expect(report.run.inputs.historicalBaseline).toMatchObject({
      workingCopyKind: "REKEYED_DERIVATIVE",
      plaintextEquivalence: "NOT_INDEPENDENTLY_VERIFIED",
      sourceIntegrity: {
        verified: true,
        method: "SOURCE_FINALIZED_SHA256_REGISTRY",
      },
      workingCopyIntegrity: {
        verified: true,
        method: "DERIVATIVE_SHA256_REGISTRY",
      },
    });
  });

  it("fails closed without the required same-session idle reference", async () => {
    const fixture = await createFixture();
    const salvage = await writeRegistry(fixture.observedDir, "salvage.sha256");
    const noIdle: FieldPhaseManifest = {
      ...fixture.phaseManifest,
      phases: fixture.phaseManifest.phases.filter(
        (phase) => phase.id !== "IDLE_BASELINE"
      ),
    };

    await expect(
      analyzeComponentHealthEvidenceV03({
        baselineDir: fixture.baselineDir,
        sessionDir: fixture.observedDir,
        passphrase: PASSPHRASE,
        phaseManifest: noIdle,
        salvageHashFile: salvage,
      })
    ).rejects.toThrow("IDLE_BASELINE");
  });
});

async function createFixture() {
  const root = await mkdtemp(join(tmpdir(), "elaris-evidence-v03-"));
  cleanup.push(root);

  const baselineWriter = await createWriter(join(root, "baseline"));
  for (let index = 0; index < 20; index += 1) {
    const timestamp = iso(index);
    await baselineWriter.append({
      rawFrame: {
        timestamp,
        channel: "rt/lowstate",
        payload: { fixture: true },
      },
      events: eventsFor(timestamp, 8),
    });
  }
  const baseline = await baselineWriter.finalize();

  const observedWriter = await createWriter(join(root, "observed"));
  const observedSessionId = basename(observedWriter.sessionDir);

  for (let index = 0; index < 40; index += 1) {
    const timestamp = iso(index);
    await observedWriter.append({
      rawFrame: {
        timestamp,
        channel: "rt/lowstate",
        payload: { fixture: true },
      },
      events: eventsFor(
        timestamp,
        index < 20 ? 10 : 20,
        observedSessionId
      ),
    });
  }

  const phaseManifest: FieldPhaseManifest = {
    version: 1,
    sessionId: observedSessionId,
    contextEvidenceClass: "HUMAN_CONFIRMED",
    phases: [
      {
        id: "IDLE_BASELINE",
        label: "Idle baseline",
        start: iso(-1),
        end: iso(20),
      },
      {
        id: "CONTROLLED_LOAD",
        label: "Controlled load",
        start: iso(20),
        end: iso(41),
      },
    ],
  };

  return {
    baselineDir: baseline.sessionDir,
    observedDir: observedWriter.sessionDir,
    phaseManifest,
  };
}

async function createWriter(rootDir: string) {
  return CaptureSessionWriter.create({
    rootDir,
    passphrase: PASSPHRASE,
    purpose: "Component Health Evidence Engine V0.3 test",
    robotId: "robot-test",
    robot: { manufacturer: "Unitree", model: "G1" },
    adapterId: "unitree-g1-sdk2-v0",
    transportKind: "replay",
    discovery: {
      adapterId: "unitree-g1-sdk2-v0",
      robot: { manufacturer: "Unitree", model: "G1" },
      transportKind: "replay",
      readableChannels: [{ name: "rt/lowstate" }],
      components: [],
      signals: [],
      notes: [],
    },
  });
}

function eventsFor(
  timestamp: string,
  torque: number,
  captureSessionId = "baseline-fixture"
): NormalizedTelemetryEvent[] {
  const common = {
    timestamp,
    captureSessionId,
    robotId: "robot-test",
    componentId: "unitree-g1-joint-03-left-knee",
    sensitivity: "SENSITIVE" as const,
    source: {
      adapterId: "unitree-g1-sdk2-v0",
      transportKind: "replay" as const,
      channel: "rt/lowstate",
    },
  };

  return [
    { ...common, signal: "joint.position", value: torque / 100, unit: "rad" },
    { ...common, signal: "joint.velocity", value: torque / 100, unit: "rad/s" },
    {
      ...common,
      signal: "joint.torque_estimate",
      value: torque,
      unit: "N·m",
    },
    { ...common, signal: "motor.voltage", value: 48, unit: "V" },
    {
      ...common,
      signal: "motor.temperature.casing",
      value: 38,
      unit: "°C",
    },
    {
      ...common,
      signal: "motor.temperature.winding",
      value: 41,
      unit: "°C",
    },
    { ...common, signal: "motor.state_code", value: 0, unit: null },
  ];
}

function iso(offsetSeconds: number) {
  return new Date(
    Date.parse("2026-10-06T15:22:41.000Z") + offsetSeconds * 1000
  ).toISOString();
}

async function writeRegistry(sessionDir: string, filename: string) {
  const files = [
    "manifest.enc.json",
    "raw.ndjson.enc",
    "session.public.json",
    "telemetry.ndjson.enc",
  ];

  const rows: string[] = [];
  for (const file of files) {
    const content = await readFile(join(sessionDir, file));
    const hash = createHash("sha256").update(content).digest("hex");
    rows.push(`${hash}  ${join(sessionDir, file)}`);
  }

  const path = join(sessionDir, filename);
  await writeFile(path, rows.join("\n") + "\n", "utf8");
  return path;
}
