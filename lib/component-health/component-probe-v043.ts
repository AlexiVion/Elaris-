import type { NormalizedTelemetryEvent } from "@/lib/robot-adapters";

export type ComponentProbeDisposition =
  | "DYNAMIC_SIGNAL_OBSERVED"
  | "STATIC_OR_ZERO_SIGNAL"
  | "NOT_OBSERVED";

export type ComponentProbeSignalSummary = {
  signal: string;
  samples: number;
  min: number | null;
  max: number | null;
  range: number | null;
  absMax: number | null;
  distinctValues: number;
};

export type ComponentProbeV043 = {
  schemaVersion: "0.4.3";
  componentId: string;
  eventCount: number;
  modeMachine: number | null;
  signals: ComponentProbeSignalSummary[];
  disposition: ComponentProbeDisposition;
  interpretation: "NO_HEALTH_OR_SAFETY_CONCLUSION";
};

const PHYSICAL_DYNAMIC_SIGNALS = [
  "joint.position",
  "joint.velocity",
] as const;

export function analyzeComponentProbeV043(
  events: readonly NormalizedTelemetryEvent[],
  componentId: string,
  epsilon = 1e-6
): ComponentProbeV043 {
  const componentEvents = events.filter(
    (event) => event.componentId === componentId
  );

  const modeMachineEvent = [...events]
    .reverse()
    .find(
      (event) =>
        event.signal === "system.mode_machine" &&
        typeof event.value === "number"
    );

  const signalNames = [...new Set(componentEvents.map((event) => event.signal))].sort();
  const signals = signalNames.map((signal) =>
    summarizeSignal(
      signal,
      componentEvents.filter((event) => event.signal === signal)
    )
  );

  const dynamicObserved = PHYSICAL_DYNAMIC_SIGNALS.some((signalName) => {
    const summary = signals.find((signal) => signal.signal === signalName);
    if (!summary || summary.samples === 0) return false;
    if (signalName === "joint.position") {
      return (summary.range ?? 0) > epsilon;
    }
    return (summary.absMax ?? 0) > epsilon;
  });

  return {
    schemaVersion: "0.4.3",
    componentId,
    eventCount: componentEvents.length,
    modeMachine:
      modeMachineEvent && typeof modeMachineEvent.value === "number"
        ? modeMachineEvent.value
        : null,
    signals,
    disposition:
      componentEvents.length === 0
        ? "NOT_OBSERVED"
        : dynamicObserved
          ? "DYNAMIC_SIGNAL_OBSERVED"
          : "STATIC_OR_ZERO_SIGNAL",
    interpretation: "NO_HEALTH_OR_SAFETY_CONCLUSION",
  };
}

function summarizeSignal(
  signal: string,
  events: readonly NormalizedTelemetryEvent[]
): ComponentProbeSignalSummary {
  const values = events
    .map((event) => event.value)
    .filter((value): value is number => typeof value === "number");

  if (values.length === 0) {
    return {
      signal,
      samples: 0,
      min: null,
      max: null,
      range: null,
      absMax: null,
      distinctValues: 0,
    };
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  return {
    signal,
    samples: values.length,
    min,
    max,
    range: max - min,
    absMax: Math.max(...values.map((value) => Math.abs(value))),
    distinctValues: new Set(values).size,
  };
}
