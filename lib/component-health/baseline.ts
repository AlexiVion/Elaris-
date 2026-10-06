import { createReadStream } from "node:fs";
import { readFile } from "node:fs/promises";
import { createInterface } from "node:readline";
import { join } from "node:path";
import { SessionCrypto } from "@/lib/edge-collector/crypto";
import type { CaptureSessionSummary, EncryptedEnvelope } from "@/lib/edge-collector/types";
import type { NormalizedTelemetryEvent } from "@/lib/robot-adapters";
import { UnitreeG1Adapter } from "@/lib/robot-adapters";

export type SignalQuality = "INFORMATIVE" | "CONSTANT" | "CONSTANT_ZERO";
export type ComponentEvidenceState = "OBSERVED_USABLE" | "OBSERVED_UNRESOLVED_SLOT";

export type NumericSignalBaseline = {
  signal: string;
  unit: string | null;
  samples: number;
  coverage: number;
  quality: SignalQuality;
  min: number;
  p05: number;
  mean: number;
  p50: number;
  p95: number;
  max: number;
  absP95: number;
  first: number;
  last: number;
  delta: number;
};

export type StateSignalBaseline = NumericSignalBaseline & {
  observedValues: number[];
  transitions: number;
};

export type ComponentBaseline = {
  componentId: string;
  componentName: string;
  oemIndex: number | null;
  evidenceState: ComponentEvidenceState;
  signals: Record<string, NumericSignalBaseline | StateSignalBaseline>;
};

export type ComponentHealthBaseline = {
  version: 1;
  evidenceClass: "OBSERVED";
  assessment: "BASELINE_ONLY";
  sessionId: string;
  frameCount: number;
  eventCount: number;
  componentCount: number;
  usableComponentCount: number;
  unresolvedSlotCount: number;
  components: ComponentBaseline[];
  limitations: string[];
};

type Accumulator = {
  unit: string | null;
  values: number[];
  stateValues: Set<number>;
  transitions: number;
  previousState: number | null;
};

const PHYSICAL_SIGNAL_NAMES = [
  "joint.position",
  "joint.velocity",
  "joint.torque_estimate",
  "motor.voltage",
  "motor.temperature.casing",
  "motor.temperature.winding",
] as const;

export async function analyzeComponentHealthBaseline(
  sessionDir: string,
  passphrase: string
): Promise<ComponentHealthBaseline> {
  const summary = await readJson<CaptureSessionSummary>(
    join(sessionDir, "session.public.json")
  );

  if (summary.state !== "FINALIZED") {
    throw new Error("Capture must be FINALIZED before baseline analysis");
  }

  const crypto = SessionCrypto.fromPassphrase(
    passphrase,
    summary.crypto.saltBase64
  );

  const byComponent = new Map<string, Map<string, Accumulator>>();
  const input = createReadStream(join(sessionDir, "telemetry.ndjson.enc"), {
    encoding: "utf8",
  });
  const lines = createInterface({ input, crlfDelay: Infinity });

  for await (const line of lines) {
    if (!line.trim()) continue;

    const envelope = JSON.parse(line) as EncryptedEnvelope;
    const batch = crypto.decryptJson<NormalizedTelemetryEvent[]>(envelope);

    for (const event of batch) {
      if (!event.componentId?.startsWith("unitree-g1-joint-")) continue;
      if (typeof event.value !== "number" || !Number.isFinite(event.value)) continue;

      let component = byComponent.get(event.componentId);
      if (!component) {
        component = new Map();
        byComponent.set(event.componentId, component);
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

  const components: ComponentBaseline[] = [];

  for (const [componentId, signalMap] of byComponent.entries()) {
    const descriptor = descriptors.get(componentId);
    const signals: Record<string, NumericSignalBaseline | StateSignalBaseline> = {};

    for (const [signal, acc] of signalMap.entries()) {
      if (acc.values.length === 0) continue;

      const values = [...acc.values].sort((a, b) => a - b);
      const absValues = acc.values.map(Math.abs).sort((a, b) => a - b);
      const mean = acc.values.reduce((sum, value) => sum + value, 0) / acc.values.length;
      const min = values[0]!;
      const max = values[values.length - 1]!;

      const base: NumericSignalBaseline = {
        signal,
        unit: acc.unit,
        samples: acc.values.length,
        coverage: summary.frameCount > 0 ? acc.values.length / summary.frameCount : 0,
        quality: signalQuality(min, max),
        min,
        p05: percentile(values, 0.05),
        mean,
        p50: percentile(values, 0.50),
        p95: percentile(values, 0.95),
        max,
        absP95: percentile(absValues, 0.95),
        first: acc.values[0]!,
        last: acc.values[acc.values.length - 1]!,
        delta: acc.values[acc.values.length - 1]! - acc.values[0]!,
      };

      signals[signal] = signal === "motor.state_code"
        ? {
            ...base,
            observedValues: [...acc.stateValues].sort((a, b) => a - b),
            transitions: acc.transitions,
          }
        : base;
    }

    components.push({
      componentId,
      componentName: descriptor?.name ?? componentId,
      oemIndex: descriptor?.oemIndex ?? null,
      evidenceState: inferComponentEvidenceState(signals),
      signals,
    });
  }

  components.sort((a, b) => (a.oemIndex ?? 999) - (b.oemIndex ?? 999));

  const usableComponentCount = components.filter(
    (component) => component.evidenceState === "OBSERVED_USABLE"
  ).length;
  const unresolvedSlotCount = components.filter(
    (component) => component.evidenceState === "OBSERVED_UNRESOLVED_SLOT"
  ).length;

  return {
    version: 1,
    evidenceClass: "OBSERVED",
    assessment: "BASELINE_ONLY",
    sessionId: summary.sessionId,
    frameCount: summary.frameCount,
    eventCount: summary.eventCount,
    componentCount: components.length,
    usableComponentCount,
    unresolvedSlotCount,
    components,
    limitations: [
      "This is a descriptive baseline of one capture session, not a diagnosis.",
      "No failure probability, remaining useful life, or predictive-maintenance claim is produced.",
      "A constant-zero signal is preserved as observed data but is not automatically treated as an informative measurement.",
      "An unresolved motor slot is not treated as an active component or as a healthy component until the physical configuration is confirmed.",
      "Thresholds require repeated comparable sessions and validated operating context.",
      "Export approval remains governed independently by the capture session.",
    ],
  };
}

function signalQuality(min: number, max: number): SignalQuality {
  if (min === 0 && max === 0) return "CONSTANT_ZERO";
  if (min === max) return "CONSTANT";
  return "INFORMATIVE";
}

function inferComponentEvidenceState(
  signals: Record<string, NumericSignalBaseline | StateSignalBaseline>
): ComponentEvidenceState {
  const physical = PHYSICAL_SIGNAL_NAMES
    .map((signal) => signals[signal])
    .filter((signal): signal is NumericSignalBaseline | StateSignalBaseline => Boolean(signal));

  const allPhysicalConstantZero =
    physical.length === PHYSICAL_SIGNAL_NAMES.length &&
    physical.every((signal) => signal.quality === "CONSTANT_ZERO");

  const state = signals["motor.state_code"];
  const hasNonZeroStateCode =
    state !== undefined &&
    "observedValues" in state &&
    state.observedValues.some((value) => value !== 0);

  return allPhysicalConstantZero && hasNonZeroStateCode
    ? "OBSERVED_UNRESOLVED_SLOT"
    : "OBSERVED_USABLE";
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

async function readJson<T>(path: string) {
  return JSON.parse(await readFile(path, "utf8")) as T;
}
