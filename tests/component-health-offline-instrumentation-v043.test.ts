import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { analyzeCaptureDiagnosticsV043 } from "@/lib/component-health/capture-diagnostics-v043";
import { analyzeComponentProbeV043 } from "@/lib/component-health/component-probe-v043";
import { COMPONENT_HEALTH_V043_REPLAY_SCENARIOS } from "@/lib/component-health/replay-fixtures-v043";
import {
  CaptureSessionWriter,
  decryptRawFrames,
  readCaptureManifest,
} from "@/lib/edge-collector/session";
import {
  ReplayTransport,
  UNITREE_G1_LOWSTATE_CHANNEL,
  UnitreeG1Adapter,
  type NormalizedTelemetryEvent,
  type RobotFrameMetadata,
} from "@/lib/robot-adapters";

const cleanup: string[] = [];
const PASSPHRASE = "v043-test-passphrase";

afterEach(async () => {
  while (cleanup.length > 0) {
    const path = cleanup.pop();
    if (path) await rm(path, { recursive: true, force: true });
  }
});

describe("Component Health V0.4.3 offline instrumentation", () => {
  it("separates duplicate capture timestamps from bridge/source sequencing", async () => {
    const root = await mkdtemp(join(tmpdir(), "elaris-v043-diagnostics-"));
    cleanup.push(root);

    const writer = await createWriter(root);
    const timestamp = "2026-10-07T18:00:00.000Z";

    await writer.append({
      rawFrame: {
        timestamp,
        channel: UNITREE_G1_LOWSTATE_CHANNEL,
        payload: { tick: 100 },
        provenance: {
          callbackSequence: 1,
          emittedSequence: 1,
          receivedAt: timestamp,
          normalizedAt: timestamp,
          sourceTick: 100,
        },
      },
      events: [],
    });

    await writer.append({
      rawFrame: {
        timestamp,
        channel: UNITREE_G1_LOWSTATE_CHANNEL,
        payload: { tick: 101 },
        provenance: {
          callbackSequence: 2,
          emittedSequence: 2,
          receivedAt: timestamp,
          normalizedAt: timestamp,
          sourceTick: 101,
        },
      },
      events: [],
    });

    await writer.markLifecycle({
      captureRequestedEndAt: "2026-10-07T18:00:05.000Z",
      unsubscribeRequestedAt: "2026-10-07T18:00:05.001Z",
      unsubscribeCompletedAt: "2026-10-07T18:00:05.010Z",
    });
    const finalized = await writer.finalize();

    const [manifest, frames] = await Promise.all([
      readCaptureManifest(finalized.sessionDir, PASSPHRASE),
      decryptRawFrames(finalized.sessionDir, PASSPHRASE),
    ]);
    const report = analyzeCaptureDiagnosticsV043(frames, manifest);

    expect(frames).toHaveLength(2);
    expect(frames[0]?.provenance?.persistedAt).toBeTruthy();
    expect(report).toMatchObject({
      schemaVersion: "0.4.3",
      frameCount: 2,
      duplicateCaptureTimestampCount: 1,
      duplicateSourceTickCount: 0,
      duplicateEmittedSequenceCount: 0,
      callbackSequenceRegressions: 0,
      emittedSequenceRegressions: 0,
      emittedSequenceGapCount: 0,
      lifecycle: {
        status: "GAP_OBSERVED",
        lastFrameToRequestedEndMs: 5000,
      },
      interpretation: "DESCRIPTIVE_PIPELINE_DIAGNOSTICS_ONLY",
    });
  });

  it("distinguishes a dynamic wrist signal from a static unresolved observation", async () => {
    const staticEvents = normalizeScenario("G1_29_DOF_WRIST_STATIC");
    const movingEvents = normalizeScenario("G1_29_DOF_WRIST_MOVING");

    const componentId = "unitree-g1-joint-28-right-wrist-yaw";
    const staticProbe = analyzeComponentProbeV043(staticEvents, componentId);
    const movingProbe = analyzeComponentProbeV043(movingEvents, componentId);

    expect(staticProbe).toMatchObject({
      modeMachine: 5,
      disposition: "STATIC_OR_ZERO_SIGNAL",
      interpretation: "NO_HEALTH_OR_SAFETY_CONCLUSION",
    });
    expect(movingProbe).toMatchObject({
      modeMachine: 5,
      disposition: "DYNAMIC_SIGNAL_OBSERVED",
      interpretation: "NO_HEALTH_OR_SAFETY_CONCLUSION",
    });

    const position = movingProbe.signals.find(
      (signal) => signal.signal === "joint.position"
    );
    expect(position?.range).toBeCloseTo(0.27);
    expect(position?.distinctValues).toBe(3);
  });

  it("replays frame provenance without adding command capability", async () => {
    const scenario = COMPONENT_HEALTH_V043_REPLAY_SCENARIOS.DUPLICATE_CAPTURE_TIMESTAMP;
    const transport = new ReplayTransport(
      [{ name: UNITREE_G1_LOWSTATE_CHANNEL }],
      scenario.frames
    );
    await transport.connect();

    const metadata: RobotFrameMetadata[] = [];
    await transport.subscribe(
      UNITREE_G1_LOWSTATE_CHANNEL,
      (_payload, _channel, frameMetadata) => {
        if (frameMetadata) metadata.push(frameMetadata);
      }
    );

    await transport.replayAll();
    await transport.close();

    expect(metadata.map((item) => item.emittedSequence)).toEqual([1, 2, 3]);
    expect(metadata[0]?.receivedAt).toBe(metadata[1]?.receivedAt);
  });
});

async function createWriter(rootDir: string) {
  return CaptureSessionWriter.create({
    rootDir,
    passphrase: PASSPHRASE,
    purpose: "V0.4.3 offline instrumentation test",
    robotId: "G1-TEST",
    robot: { manufacturer: "Unitree", model: "G1" },
    adapterId: "unitree-g1",
    transportKind: "replay",
    lifecycle: {
      collectorStartedAt: "2026-10-07T17:59:59.000Z",
      transportReadyAt: "2026-10-07T17:59:59.500Z",
      captureRequestedStartAt: "2026-10-07T18:00:00.000Z",
    },
    discovery: {
      adapterId: "unitree-g1",
      robot: { manufacturer: "Unitree", model: "G1" },
      transportKind: "replay",
      readableChannels: [{ name: UNITREE_G1_LOWSTATE_CHANNEL }],
      components: [],
      signals: [],
      notes: [],
    },
  });
}

function normalizeScenario(
  scenarioId: "G1_29_DOF_WRIST_STATIC" | "G1_29_DOF_WRIST_MOVING"
): NormalizedTelemetryEvent[] {
  const adapter = new UnitreeG1Adapter();
  const scenario = COMPONENT_HEALTH_V043_REPLAY_SCENARIOS[scenarioId];
  const events: NormalizedTelemetryEvent[] = [];

  for (const frame of scenario.frames) {
    events.push(
      ...adapter.normalize(
        { name: frame.channel },
        frame.payload,
        {
          robotId: "G1-REPLAY",
          captureSessionId: scenario.id,
          timestamp: frame.metadata?.receivedAt,
          transportKind: "replay",
        }
      )
    );
  }

  return events;
}
