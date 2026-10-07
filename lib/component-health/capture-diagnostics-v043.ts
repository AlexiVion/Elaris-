import type {
  CaptureManifest,
  CapturedRawFrame,
} from "@/lib/edge-collector/types";

export const COMPONENT_HEALTH_V043_SCHEMA = "0.4.3";

export type CaptureDiagnosticsV043 = {
  schemaVersion: "0.4.3";
  frameCount: number;
  duplicateCaptureTimestampCount: number;
  duplicateSourceTickCount: number;
  duplicateEmittedSequenceCount: number;
  callbackSequenceRegressions: number;
  emittedSequenceRegressions: number;
  emittedSequenceGapCount: number;
  lifecycle: {
    firstFrameAt: string | null;
    lastFrameAt: string | null;
    captureRequestedEndAt: string | null;
    lastFrameToRequestedEndMs: number | null;
    status: "NOT_RECORDED" | "ALIGNED" | "GAP_OBSERVED";
  };
  interpretation: "DESCRIPTIVE_PIPELINE_DIAGNOSTICS_ONLY";
};

export function analyzeCaptureDiagnosticsV043(
  frames: readonly CapturedRawFrame[],
  manifest?: CaptureManifest | null
): CaptureDiagnosticsV043 {
  const timestamps = frames.map((frame) => frame.timestamp);
  const sourceTicks = frames
    .map((frame) => frame.provenance?.sourceTick)
    .filter((value): value is number => typeof value === "number");
  const callbackSequences = frames
    .map((frame) => frame.provenance?.callbackSequence)
    .filter((value): value is number => typeof value === "number");
  const emittedSequences = frames
    .map((frame) => frame.provenance?.emittedSequence)
    .filter((value): value is number => typeof value === "number");

  const firstFrameAt =
    manifest?.lifecycle?.firstFrameAt ??
    frames[0]?.provenance?.receivedAt ??
    frames[0]?.timestamp ??
    null;
  const lastFrame =
    frames.length > 0 ? frames[frames.length - 1] : null;
  const lastFrameAt =
    manifest?.lifecycle?.lastFrameAt ??
    lastFrame?.provenance?.receivedAt ??
    lastFrame?.timestamp ??
    null;
  const captureRequestedEndAt =
    manifest?.lifecycle?.captureRequestedEndAt ?? null;

  const lastFrameToRequestedEndMs =
    lastFrameAt && captureRequestedEndAt
      ? Date.parse(captureRequestedEndAt) - Date.parse(lastFrameAt)
      : null;

  return {
    schemaVersion: COMPONENT_HEALTH_V043_SCHEMA,
    frameCount: frames.length,
    duplicateCaptureTimestampCount: duplicateCount(timestamps),
    duplicateSourceTickCount: duplicateCount(sourceTicks),
    duplicateEmittedSequenceCount: duplicateCount(emittedSequences),
    callbackSequenceRegressions: regressionCount(callbackSequences),
    emittedSequenceRegressions: regressionCount(emittedSequences),
    emittedSequenceGapCount: gapCount(emittedSequences),
    lifecycle: {
      firstFrameAt,
      lastFrameAt,
      captureRequestedEndAt,
      lastFrameToRequestedEndMs,
      status:
        lastFrameToRequestedEndMs === null
          ? "NOT_RECORDED"
          : lastFrameToRequestedEndMs > 2_000
            ? "GAP_OBSERVED"
            : "ALIGNED",
    },
    interpretation: "DESCRIPTIVE_PIPELINE_DIAGNOSTICS_ONLY",
  };
}

function duplicateCount(values: readonly (string | number)[]) {
  const seen = new Set<string | number>();
  let duplicates = 0;
  for (const value of values) {
    if (seen.has(value)) duplicates += 1;
    else seen.add(value);
  }
  return duplicates;
}

function regressionCount(values: readonly number[]) {
  let count = 0;
  for (let index = 1; index < values.length; index += 1) {
    if (values[index]! <= values[index - 1]!) count += 1;
  }
  return count;
}

function gapCount(values: readonly number[]) {
  let count = 0;
  for (let index = 1; index < values.length; index += 1) {
    if (values[index]! - values[index - 1]! > 1) count += 1;
  }
  return count;
}
