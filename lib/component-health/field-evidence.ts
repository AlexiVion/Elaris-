import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { readFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { createInterface } from "node:readline";
import {
  analyzeComponentHealthBaseline,
  type ComponentHealthBaseline,
  type NumericSignalBaseline,
  type SignalQuality,
  type StateSignalBaseline,
} from "@/lib/component-health/baseline";
import { SessionCrypto } from "@/lib/edge-collector/crypto";
import type {
  CaptureSessionSummary,
  EncryptedEnvelope,
} from "@/lib/edge-collector/types";
import {
  UnitreeG1Adapter,
  type NormalizedTelemetryEvent,
} from "@/lib/robot-adapters";

export type FieldPhase = {
  id: string;
  label: string;
  start: string;
  end: string;
};

export type FieldPhaseManifest = {
  version: 1;
  sessionId: string;
  contextEvidenceClass: "HUMAN_CONFIRMED";
  phases: FieldPhase[];
};

export type SignalComparison = {
  signal: string;
  baselineQuality: SignalQuality;
  observedQuality: SignalQuality;
  baselineMean: number;
  observedMean: number;
  meanDelta: number;
  meanDeltaPct: number | null;
  baselineP95: number;
  observedP95: number;
  p95Delta: number;
  baselineAbsP95: number;
  observedAbsP95: number;
  absP95Delta: number;
  absP95Ratio: number | null;
  baselineRange: number;
  observedRange: number;
  rangeDelta: number;
};

export type ComponentPhaseEvidence = {
  componentId: string;
  componentName: string;
  oemIndex: number | null;
  signals: Record<string, NumericSignalBaseline | StateSignalBaseline>;
  comparisons: Record<string, SignalComparison>;
  newStateCodes: number[];
};

export type PhaseEvidence = {
  phase: FieldPhase;
  frameCount: number;
  jointEventCount: number;
  componentCount: number;
  components: ComponentPhaseEvidence[];
};

export type FieldEvidencePack = {
  version: 1;
  evidenceClass: "OBSERVED";
  contextEvidenceClass: "HUMAN_CONFIRMED";
  assessment: "DESCRIPTIVE_COMPARISON";
  sourceClassification: "SENSITIVE";
  baselineSessionId: string;
  sessionId: string;
  sessionState: "FINALIZED" | "OPEN";
  disposition: "FINALIZED" | "SALVAGED_OPEN_VERIFIED";
  integrity: {
    verified: boolean;
    method: "FINALIZED_CAPTURE" | "SALVAGE_SHA256_REGISTRY";
    verifiedFiles: string[];
  };
  phases: PhaseEvidence[];
  limitations: string[];
};

type Accumulator = {
  unit: string | null;
  values: number[];
  stateValues: Set<number>;
  transitions: number;
  previousState: number | null;
};

type PhaseAccumulator = {
  frameTimestamps: Set<string>;
  eventCount: number;
  components: Map<string, Map<string, Accumulator>>;
};

const SELECTED_SIGNALS = [
  "joint.position",
  "joint.velocity",
  "joint.torque_estimate",
  "motor.voltage",
  "motor.temperature.casing",
  "motor.temperature.winding",
  "motor.state_code",
] as const;

export async function analyzeComponentHealthFieldEvidence(input: {
  baselineDir: string;
  sessionDir: string;
  passphrase: string;
  phaseManifest: FieldPhaseManifest;
  salvageHashFile?: string | null;
}): Promise<FieldEvidencePack> {
  const baseline = await analyzeComponentHealthBaseline(
    input.baselineDir,
    input.passphrase
  );

  const summary = await readJson<CaptureSessionSummary>(
    join(input.sessionDir, "session.public.json")
  );

  validatePhaseManifest(input.phaseManifest, summary.sessionId);

  let disposition: FieldEvidencePack["disposition"];
  let integrity: FieldEvidencePack["integrity"];

  if (summary.state === "FINALIZED") {
    disposition = "FINALIZED";
    integrity = {
      verified: true,
      method: "FINALIZED_CAPTURE",
      verifiedFiles: [],
    };
  } else {
    if (!input.salvageHashFile) {
      throw new Error(
        "OPEN capture requires --salvage-hashes with a verified SHA-256 registry"
      );
    }

    const verifiedFiles = await verifySalvagedCaptureIntegrity(
      input.sessionDir,
      input.salvageHashFile
    );

    disposition = "SALVAGED_OPEN_VERIFIED";
    integrity = {
      verified: true,
      method: "SALVAGE_SHA256_REGISTRY",
      verifiedFiles,
    };
  }

  const crypto = SessionCrypto.fromPassphrase(
    input.passphrase,
    summary.crypto.saltBase64
  );

  const phaseWindows = input.phaseManifest.phases.map((phase) => ({
    phase,
    startMs: Date.parse(phase.start),
    endMs: Date.parse(phase.end),
  }));

  const accumulators = new Map<string, PhaseAccumulator>(
    input.phaseManifest.phases.map((phase) => [
      phase.id,
      {
        frameTimestamps: new Set<string>(),
        eventCount: 0,
        components: new Map(),
      },
    ])
  );

  const telemetry = createReadStream(
    join(input.sessionDir, "telemetry.ndjson.enc"),
    { encoding: "utf8" }
  );
  const lines = createInterface({ input: telemetry, crlfDelay: Infinity });

  for await (const line of lines) {
    if (!line.trim()) continue;

    const envelope = JSON.parse(line) as EncryptedEnvelope;
    const batch = crypto.decryptJson<NormalizedTelemetryEvent[]>(envelope);

    for (const event of batch) {
      if (!event.componentId?.startsWith("unitree-g1-joint-")) continue;
      if (typeof event.value !== "number" || !Number.isFinite(event.value)) continue;

      const eventMs = Date.parse(event.timestamp);
      if (!Number.isFinite(eventMs)) continue;

      const window = phaseWindows.find(
        (candidate) => eventMs >= candidate.startMs && eventMs < candidate.endMs
      );
      if (!window) continue;

      const phaseAcc = accumulators.get(window.phase.id)!;
      phaseAcc.frameTimestamps.add(event.timestamp);
      phaseAcc.eventCount += 1;

      let component = phaseAcc.components.get(event.componentId);
      if (!component) {
        component = new Map();
        phaseAcc.components.set(event.componentId, component);
      }

      let acc = component.get(event.signal);
      if (!acc) {
        acc = {
          unit: event.unit ?? null,
          values: [],
          stateValues: new Set<number>(),
          transitions: 0,
          previousState: null,
        };
        component.set(event.signal, acc);
      }

      acc.values.push(event.value);

      if (event.signal === "motor.state_code") {
        acc.stateValues.add(event.value);
        if (acc.previousState !== null && acc.previousState !== event.value) {
          acc.transitions += 1;
        }
        acc.previousState = event.value;
      }
    }
  }

  const descriptors = new Map(
    new UnitreeG1Adapter()
      .components()
      .filter((component) => component.kind === "joint")
      .map((component) => [component.id, component] as const)
  );

  const phases: PhaseEvidence[] = input.phaseManifest.phases.map((phase) => {
    const phaseAcc = accumulators.get(phase.id)!;
    const frameCount = phaseAcc.frameTimestamps.size;
    const components: ComponentPhaseEvidence[] = [];

    for (const [componentId, signalMap] of phaseAcc.components.entries()) {
      const descriptor = descriptors.get(componentId);
      const signals: Record<string, NumericSignalBaseline | StateSignalBaseline> = {};

      for (const [signal, acc] of signalMap.entries()) {
        if (acc.values.length === 0) continue;
        signals[signal] = summarizeSignal(signal, acc, frameCount);
      }

      const baselineComponent = baseline.components.find(
        (candidate) => candidate.componentId === componentId
      );

      const comparisons: Record<string, SignalComparison> = {};
      if (baselineComponent) {
        for (const signal of SELECTED_SIGNALS) {
          if (signal === "motor.state_code") continue;
          const baselineSignal = baselineComponent.signals[signal];
          const observedSignal = signals[signal];
          if (!baselineSignal || !observedSignal) continue;

          comparisons[signal] = compareSignal(
            signal,
            baselineSignal,
            observedSignal
          );
        }
      }

      const baselineState = baselineComponent?.signals["motor.state_code"];
      const observedState = signals["motor.state_code"];
      const baselineCodes =
        baselineState && "observedValues" in baselineState
          ? new Set(baselineState.observedValues)
          : new Set<number>();
      const observedCodes =
        observedState && "observedValues" in observedState
          ? observedState.observedValues
          : [];

      components.push({
        componentId,
        componentName: descriptor?.name ?? componentId,
        oemIndex: descriptor?.oemIndex ?? null,
        signals,
        comparisons,
        newStateCodes: observedCodes.filter((code) => !baselineCodes.has(code)),
      });
    }

    components.sort((a, b) => (a.oemIndex ?? 999) - (b.oemIndex ?? 999));

    return {
      phase,
      frameCount,
      jointEventCount: phaseAcc.eventCount,
      componentCount: components.length,
      components,
    };
  });

  return {
    version: 1,
    evidenceClass: "OBSERVED",
    contextEvidenceClass: input.phaseManifest.contextEvidenceClass,
    assessment: "DESCRIPTIVE_COMPARISON",
    sourceClassification: "SENSITIVE",
    baselineSessionId: baseline.sessionId,
    sessionId: summary.sessionId,
    sessionState: summary.state,
    disposition,
    integrity,
    phases,
    limitations: [
      "This report compares observed telemetry distributions; it is not a diagnosis.",
      "No health score, failure probability, remaining useful life, or OEM safety compliance claim is produced.",
      "Phase boundaries are HUMAN_CONFIRMED context and remain distinct from OBSERVED telemetry evidence.",
      "Relative changes are descriptive and have no pass/fail threshold unless a separately validated rule exists.",
      "A salvaged OPEN capture remains OPEN and is never rewritten as FINALIZED.",
      "Signal semantics such as temperature channel meaning and voltage units remain subject to OEM schema validation.",
      "Export approval and data sensitivity remain governed independently from local analysis.",
    ],
  };
}

export async function loadFieldPhaseManifest(path: string) {
  const manifest = await readJson<FieldPhaseManifest>(path);
  validatePhaseManifest(manifest, manifest.sessionId);
  return manifest;
}

export async function verifySalvagedCaptureIntegrity(
  sessionDir: string,
  hashFile: string
) {
  const content = await readFile(hashFile, "utf8");
  const verified: string[] = [];

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;

    const match = /^([a-fA-F0-9]{64})\s+(.+)$/.exec(line);
    if (!match) {
      throw new Error(`Invalid salvage hash row: ${line}`);
    }

    const expected = match[1]!.toLowerCase();
    const originalPath = match[2]!.trim();
    const file = basename(originalPath);
    const localPath = join(sessionDir, file);
    const actual = await sha256File(localPath);

    if (actual !== expected) {
      throw new Error(
        `Salvage integrity mismatch for ${file}: expected ${expected}, got ${actual}`
      );
    }

    verified.push(file);
  }

  const required = [
    "manifest.enc.json",
    "raw.ndjson.enc",
    "session.public.json",
    "telemetry.ndjson.enc",
  ];

  for (const file of required) {
    if (!verified.includes(file)) {
      throw new Error(`Salvage hash registry does not cover required file: ${file}`);
    }
  }

  return [...new Set(verified)].sort();
}

export function renderFieldEvidenceMarkdown(pack: FieldEvidencePack) {
  const rows: string[] = [];

  rows.push("# Elaris Component Health — Field Evidence Report");
  rows.push("");
  rows.push(`- Baseline session: \`${pack.baselineSessionId}\``);
  rows.push(`- Observed session: \`${pack.sessionId}\``);
  rows.push(`- Evidence class: \`${pack.evidenceClass}\``);
  rows.push(`- Context evidence: \`${pack.contextEvidenceClass}\``);
  rows.push(`- Assessment: \`${pack.assessment}\``);
  rows.push(`- Source classification: \`${pack.sourceClassification}\``);
  rows.push(`- Session state: \`${pack.sessionState}\``);
  rows.push(`- Disposition: \`${pack.disposition}\``);
  rows.push(
    `- Integrity: \`${pack.integrity.verified ? "VERIFIED" : "NOT_VERIFIED"}\` via \`${pack.integrity.method}\``
  );
  rows.push("");
  rows.push(
    "> Descriptive telemetry comparison only. No diagnosis, health score, failure probability or RUL is produced."
  );
  rows.push("");
  rows.push("## Phase overview");
  rows.push("");
  rows.push("| Phase | Start | End | Frames | Joint numeric events | Components |");
  rows.push("|---|---|---|---:|---:|---:|");

  for (const phase of pack.phases) {
    rows.push(
      `| ${phase.phase.label} | ${phase.phase.start} | ${phase.phase.end} | ${phase.frameCount} | ${phase.jointEventCount} | ${phase.componentCount} |`
    );
  }

  for (const phase of pack.phases) {
    rows.push("");
    rows.push(`## ${phase.phase.label}`);
    rows.push("");
    rows.push(
      "| Component | Torque absP95 baseline → phase | Velocity absP95 baseline → phase | Winding temp mean baseline → phase | Voltage mean baseline → phase | New state codes |"
    );
    rows.push("|---|---:|---:|---:|---:|---|");

    for (const component of phase.components) {
      const torque = component.comparisons["joint.torque_estimate"];
      const velocity = component.comparisons["joint.velocity"];
      const winding = component.comparisons["motor.temperature.winding"];
      const voltage = component.comparisons["motor.voltage"];

      rows.push(
        `| [${String(component.oemIndex ?? "?").padStart(2, "0")}] ${component.componentName} | ${formatAbsP95(torque)} | ${formatAbsP95(velocity)} | ${formatMean(winding)} | ${formatMean(voltage)} | ${component.newStateCodes.length ? component.newStateCodes.join(", ") : "—"} |`
      );
    }
  }

  rows.push("");
  rows.push("## Limitations");
  rows.push("");
  for (const limitation of pack.limitations) {
    rows.push(`- ${limitation}`);
  }

  rows.push("");
  return rows.join("\n");
}

function summarizeSignal(
  signal: string,
  acc: Accumulator,
  frameCount: number
): NumericSignalBaseline | StateSignalBaseline {
  const sorted = [...acc.values].sort((a, b) => a - b);
  const absValues = acc.values.map(Math.abs).sort((a, b) => a - b);
  const min = sorted[0]!;
  const max = sorted[sorted.length - 1]!;
  const mean =
    acc.values.reduce((sum, value) => sum + value, 0) / acc.values.length;

  const base: NumericSignalBaseline = {
    signal,
    unit: acc.unit,
    samples: acc.values.length,
    coverage: frameCount > 0 ? acc.values.length / frameCount : 0,
    quality: signalQuality(min, max),
    min,
    p05: percentile(sorted, 0.05),
    mean,
    p50: percentile(sorted, 0.5),
    p95: percentile(sorted, 0.95),
    max,
    absP95: percentile(absValues, 0.95),
    first: acc.values[0]!,
    last: acc.values[acc.values.length - 1]!,
    delta: acc.values[acc.values.length - 1]! - acc.values[0]!,
  };

  if (signal !== "motor.state_code") return base;

  return {
    ...base,
    observedValues: [...acc.stateValues].sort((a, b) => a - b),
    transitions: acc.transitions,
  };
}

function compareSignal(
  signal: string,
  baseline: NumericSignalBaseline | StateSignalBaseline,
  observed: NumericSignalBaseline | StateSignalBaseline
): SignalComparison {
  const meanDelta = observed.mean - baseline.mean;
  const baselineRange = baseline.max - baseline.min;
  const observedRange = observed.max - observed.min;

  return {
    signal,
    baselineQuality: baseline.quality,
    observedQuality: observed.quality,
    baselineMean: baseline.mean,
    observedMean: observed.mean,
    meanDelta,
    meanDeltaPct:
      baseline.mean === 0 ? null : (meanDelta / Math.abs(baseline.mean)) * 100,
    baselineP95: baseline.p95,
    observedP95: observed.p95,
    p95Delta: observed.p95 - baseline.p95,
    baselineAbsP95: baseline.absP95,
    observedAbsP95: observed.absP95,
    absP95Delta: observed.absP95 - baseline.absP95,
    absP95Ratio:
      baseline.absP95 === 0 ? null : observed.absP95 / baseline.absP95,
    baselineRange,
    observedRange,
    rangeDelta: observedRange - baselineRange,
  };
}

function validatePhaseManifest(
  manifest: FieldPhaseManifest,
  expectedSessionId: string
) {
  if (manifest.version !== 1) {
    throw new Error("Unsupported field phase manifest version");
  }
  if (manifest.sessionId !== expectedSessionId) {
    throw new Error(
      `Phase manifest sessionId ${manifest.sessionId} does not match capture ${expectedSessionId}`
    );
  }
  if (manifest.contextEvidenceClass !== "HUMAN_CONFIRMED") {
    throw new Error("Phase manifest contextEvidenceClass must be HUMAN_CONFIRMED");
  }
  if (manifest.phases.length === 0) {
    throw new Error("Phase manifest must contain at least one phase");
  }

  const ids = new Set<string>();
  let previousEnd = -Infinity;

  for (const phase of manifest.phases) {
    if (!phase.id || !phase.label) {
      throw new Error("Every phase requires id and label");
    }
    if (ids.has(phase.id)) {
      throw new Error(`Duplicate phase id: ${phase.id}`);
    }
    ids.add(phase.id);

    const start = Date.parse(phase.start);
    const end = Date.parse(phase.end);
    if (!Number.isFinite(start) || !Number.isFinite(end) || start >= end) {
      throw new Error(`Invalid time window for phase: ${phase.id}`);
    }
    if (start < previousEnd) {
      throw new Error(`Phase windows overlap or are out of order at: ${phase.id}`);
    }
    previousEnd = end;
  }
}

function signalQuality(min: number, max: number): SignalQuality {
  if (min === 0 && max === 0) return "CONSTANT_ZERO";
  if (min === max) return "CONSTANT";
  return "INFORMATIVE";
}

function percentile(sorted: readonly number[], p: number) {
  if (sorted.length === 1) return sorted[0]!;
  const index = (sorted.length - 1) * p;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sorted[lower]!;
  const weight = index - lower;
  return sorted[lower]! * (1 - weight) + sorted[upper]! * weight;
}

async function sha256File(path: string) {
  const hash = createHash("sha256");
  const input = createReadStream(path);
  for await (const chunk of input) {
    hash.update(chunk as Buffer);
  }
  return hash.digest("hex");
}

async function readJson<T>(path: string) {
  return JSON.parse(await readFile(path, "utf8")) as T;
}

function formatAbsP95(comparison: SignalComparison | undefined) {
  if (!comparison) return "—";
  const ratio =
    comparison.absP95Ratio === null
      ? ""
      : ` (×${comparison.absP95Ratio.toFixed(2)})`;
  return `${fmt(comparison.baselineAbsP95)} → ${fmt(comparison.observedAbsP95)}${ratio}`;
}

function formatMean(comparison: SignalComparison | undefined) {
  if (!comparison) return "—";
  return `${fmt(comparison.baselineMean)} → ${fmt(comparison.observedMean)}`;
}

function fmt(value: number) {
  return Number.isFinite(value) ? value.toFixed(3) : "NaN";
}
