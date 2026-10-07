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
  analyzeComponentHealthFieldEvidence,
  type FieldPhaseManifest,
} from "@/lib/component-health/field-evidence";
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

describe("Component Health field evidence", () => {
  it("refuses an OPEN capture without a salvage integrity registry", async () => {
    const fixture = await createFixture();

    await expect(
      analyzeComponentHealthFieldEvidence({
        baselineDir: fixture.baselineDir,
        sessionDir: fixture.observedDir,
        passphrase: PASSPHRASE,
        phaseManifest: fixture.phaseManifest,
      })
    ).rejects.toThrow(
      "OPEN capture requires --salvage-hashes with a verified SHA-256 registry"
    );
  });

  it("analyzes an integrity-verified salvaged OPEN capture by human-confirmed phase", async () => {
    const fixture = await createFixture();
    const hashes = await writeSalvageHashes(fixture.observedDir);

    const report = await analyzeComponentHealthFieldEvidence({
      baselineDir: fixture.baselineDir,
      sessionDir: fixture.observedDir,
      passphrase: PASSPHRASE,
      phaseManifest: fixture.phaseManifest,
      salvageHashFile: hashes,
    });

    expect(report).toMatchObject({
      evidenceClass: "OBSERVED",
      contextEvidenceClass: "HUMAN_CONFIRMED",
      assessment: "DESCRIPTIVE_COMPARISON",
      sourceClassification: "SENSITIVE",
      sessionState: "OPEN",
      disposition: "SALVAGED_OPEN_VERIFIED",
      integrity: {
        verified: true,
        method: "SALVAGE_SHA256_REGISTRY",
      },
    });

    expect(report.phases).toHaveLength(1);
    expect(report.phases[0]).toMatchObject({
      frameCount: 20,
      componentCount: 1,
      observedTelemetryStart: iso(0),
      observedTelemetryEnd: iso(19),
    });
    expect(report.provenance).toMatchObject({
      workingCopyKind: "ORIGINAL_CAPTURE",
      plaintextEquivalence: "NOT_APPLICABLE",
      sourceIntegrity: { method: "SOURCE_SALVAGE_SHA256_REGISTRY", verified: true },
    });

    const component = report.phases[0]!.components[0]!;
    const torque = component.comparisons["joint.torque_estimate"];

    expect(component.componentId).toBe("unitree-g1-joint-03-left-knee");
    expect(torque).toBeDefined();
    expect(torque!.baselineAbsP95).toBe(10);
    expect(torque!.observedAbsP95).toBe(20);
    expect(torque!.absP95Ratio).toBe(2);
  });

  it("distinguishes original salvage integrity from a rekeyed working-copy registry", async () => {
    const fixture = await createFixture();
    const sourceHashes = await writeSalvageHashes(fixture.observedDir);
    const derivativeDir = join(dirname(dirname(fixture.observedDir)), "derivative", basename(fixture.observedDir));
    await mkdir(dirname(derivativeDir), { recursive: true });
    await cp(fixture.observedDir, derivativeDir, { recursive: true });
    const derivativeHashes = await writeSalvageHashes(derivativeDir);

    const report = await analyzeComponentHealthFieldEvidence({
      baselineDir: fixture.baselineDir,
      sessionDir: derivativeDir,
      passphrase: PASSPHRASE,
      phaseManifest: fixture.phaseManifest,
      sourceSessionDir: fixture.observedDir,
      sourceSalvageHashFile: sourceHashes,
      derivativeHashFile: derivativeHashes,
    });

    expect(report.integrity.method).toBe("DERIVATIVE_SHA256_REGISTRY");
    expect(report.provenance).toMatchObject({
      workingCopyKind: "REKEYED_DERIVATIVE",
      plaintextEquivalence: "NOT_INDEPENDENTLY_VERIFIED",
      sourceIntegrity: {
        verified: true,
        method: "SOURCE_SALVAGE_SHA256_REGISTRY",
      },
    });
  });

  it("fails closed if derivative provenance flags are incomplete", async () => {
    const fixture = await createFixture();
    const sourceHashes = await writeSalvageHashes(fixture.observedDir);

    await expect(
      analyzeComponentHealthFieldEvidence({
        baselineDir: fixture.baselineDir,
        sessionDir: fixture.observedDir,
        passphrase: PASSPHRASE,
        phaseManifest: fixture.phaseManifest,
        sourceSalvageHashFile: sourceHashes,
      })
    ).rejects.toThrow("Rekeyed OPEN derivative requires");
  });

  it("rejects an altered source even when the derivative matches its own registry", async () => {
    const fixture = await createFixture();
    const sourceHashes = await writeSalvageHashes(fixture.observedDir);
    const derivativeDir = join(dirname(dirname(fixture.observedDir)), "derivative2", basename(fixture.observedDir));
    await mkdir(dirname(derivativeDir), { recursive: true });
    await cp(fixture.observedDir, derivativeDir, { recursive: true });
    const derivativeHashes = await writeSalvageHashes(derivativeDir);
    await writeFile(join(fixture.observedDir, "raw.ndjson.enc"), "\n", { flag: "a" });

    await expect(
      analyzeComponentHealthFieldEvidence({
        baselineDir: fixture.baselineDir,
        sessionDir: derivativeDir,
        passphrase: PASSPHRASE,
        phaseManifest: fixture.phaseManifest,
        sourceSessionDir: fixture.observedDir,
        sourceSalvageHashFile: sourceHashes,
        derivativeHashFile: derivativeHashes,
      })
    ).rejects.toThrow("Salvage integrity mismatch");
  });

  it("fails closed when a salvaged capture file changes after hashing", async () => {
    const fixture = await createFixture();
    const hashes = await writeSalvageHashes(fixture.observedDir);

    await writeFile(
      join(fixture.observedDir, "telemetry.ndjson.enc"),
      "\n",
      { flag: "a" }
    );

    await expect(
      analyzeComponentHealthFieldEvidence({
        baselineDir: fixture.baselineDir,
        sessionDir: fixture.observedDir,
        passphrase: PASSPHRASE,
        phaseManifest: fixture.phaseManifest,
        salvageHashFile: hashes,
      })
    ).rejects.toThrow("Salvage integrity mismatch");
  });
});

async function createFixture() {
  const root = await mkdtemp(join(tmpdir(), "elaris-field-evidence-"));
  cleanup.push(root);

  const baselineWriter = await createWriter(join(root, "baseline"));
  for (let index = 0; index < 20; index += 1) {
    await baselineWriter.append({
      rawFrame: {
        timestamp: iso(index),
        channel: "rt/lowstate",
        payload: { fixture: true },
      },
      events: eventsFor(iso(index), 10),
    });
  }
  const finalized = await baselineWriter.finalize();

  const observedWriter = await createWriter(join(root, "observed"));
  const observedSessionId = basename(observedWriter.sessionDir);

  for (let index = 0; index < 20; index += 1) {
    await observedWriter.append({
      rawFrame: {
        timestamp: iso(index),
        channel: "rt/lowstate",
        payload: { fixture: true },
      },
      events: eventsFor(iso(index), 20, observedSessionId),
    });
  }

  const phaseManifest: FieldPhaseManifest = {
    version: 1,
    sessionId: observedSessionId,
    contextEvidenceClass: "HUMAN_CONFIRMED",
    phases: [
      {
        id: "CONTROLLED_LOAD",
        label: "Controlled load",
        start: "2026-10-06T15:22:40.000Z",
        end: "2026-10-06T15:23:10.000Z",
      },
    ],
  };

  return {
    baselineDir: finalized.sessionDir,
    observedDir: observedWriter.sessionDir,
    phaseManifest,
  };
}

async function createWriter(rootDir: string) {
  return CaptureSessionWriter.create({
    rootDir,
    passphrase: PASSPHRASE,
    purpose: "field evidence test",
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
    { ...common, signal: "joint.position", value: 0.2, unit: "rad" },
    { ...common, signal: "joint.velocity", value: torque / 100, unit: "rad/s" },
    { ...common, signal: "joint.torque_estimate", value: torque, unit: "N*m" },
    { ...common, signal: "motor.voltage", value: 48, unit: "V" },
    { ...common, signal: "motor.temperature.casing", value: 38, unit: "C" },
    { ...common, signal: "motor.temperature.winding", value: 41, unit: "C" },
    { ...common, signal: "motor.state_code", value: 0, unit: null },
  ];
}

function iso(offsetSeconds: number) {
  return new Date(
    Date.parse("2026-10-06T15:22:41.000Z") + offsetSeconds * 1000
  ).toISOString();
}

async function writeSalvageHashes(sessionDir: string) {
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

  const path = join(sessionDir, "salvage.sha256");
  await writeFile(path, rows.join("\n") + "\n", "utf8");
  return path;
}
