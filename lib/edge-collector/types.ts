import type {
  NormalizedTelemetryEvent,
  ReadableRobotChannel,
  RobotDiscoveryResult,
  RobotIdentity,
  RobotTransportKind,
} from "@/lib/robot-adapters";

export type CaptureState = "OPEN" | "FINALIZED";
export type ExportApprovalState = "NOT_APPROVED" | "APPROVED";

export type CaptureLifecycle = {
  collectorStartedAt?: string | null;
  transportReadyAt?: string | null;
  captureRequestedStartAt?: string | null;
  firstFrameAt?: string | null;
  lastFrameAt?: string | null;
  captureRequestedEndAt?: string | null;
  unsubscribeRequestedAt?: string | null;
  unsubscribeCompletedAt?: string | null;
  finalizeStartedAt?: string | null;
  finalizedAt?: string | null;
};

export type CaptureFrameProvenance = {
  bridgeObservedAtUnixNs?: string | null;
  bridgeObservedMonotonicNs?: string | null;
  callbackSequence?: number | null;
  emittedSequence?: number | null;
  receivedAt?: string | null;
  normalizedAt?: string | null;
  persistedAt?: string | null;
  sourceTick?: number | null;
};

export type CaptureSessionSummary = {
  version: 1;
  sessionId: string;
  classification: "SENSITIVE";
  state: CaptureState;
  createdAt: string;
  finalizedAt?: string | null;
  frameCount: number;
  eventCount: number;
  exportApproval: ExportApprovalState;
  mode: "READ_ONLY";
  crypto: {
    algorithm: "AES-256-GCM";
    kdf: "scrypt";
    saltBase64: string;
  };
};

export type CaptureManifest = {
  version: 1;
  sessionId: string;
  purpose: string;
  robotId: string;
  robot: RobotIdentity;
  adapterId: string;
  transportKind: RobotTransportKind;
  configurationId?: string | null;
  startedAt: string;
  endedAt?: string | null;
  readableChannels: ReadableRobotChannel[];
  discoveryNotes: string[];
  lifecycle?: CaptureLifecycle;
  rawFrameRetention: true;
  normalizedTelemetryRetention: true;
  collectionPolicy: {
    mode: "READ_ONLY";
    rawAudio: "DISABLED";
    rawVideo: "DISABLED";
    cloudUploadDuringCapture: "DISABLED";
    defaultSensitivity: "SENSITIVE";
  };
};

export type EncryptedEnvelope = {
  version: 1;
  algorithm: "AES-256-GCM";
  ivBase64: string;
  tagBase64: string;
  ciphertextBase64: string;
};

export type CapturedRawFrame = {
  timestamp: string;
  channel: string;
  payload: unknown;
  provenance?: CaptureFrameProvenance;
};

export type ExportApprovalRecord = {
  version: 1;
  sessionId: string;
  reviewer: string;
  reason: string;
  approvedAt: string;
};

export type CaptureCreateInput = {
  rootDir: string;
  passphrase: string;
  purpose: string;
  robotId: string;
  robot: RobotIdentity;
  adapterId: string;
  transportKind: RobotTransportKind;
  configurationId?: string | null;
  discovery: RobotDiscoveryResult;
  lifecycle?: CaptureLifecycle;
};

export type CaptureAppendInput = {
  rawFrame: CapturedRawFrame;
  events: readonly NormalizedTelemetryEvent[];
};
