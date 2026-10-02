export type RobotTransportKind = "replay" | "dds" | "ros2" | "custom";
export type DataSensitivity = "PUBLIC" | "INTERNAL" | "SENSITIVE" | "RESTRICTED";
export type SignalValue = number | string | boolean;

export type RobotIdentity = {
  manufacturer: string;
  model: string;
  variant?: string | null;
  serial?: string | null;
  firmware?: string | null;
};

export type RobotComponentDescriptor = {
  id: string;
  name: string;
  kind: "joint" | "actuator" | "battery" | "imu" | "hand" | "sensor" | "system" | "unknown";
  position?: string | null;
  parentId?: string | null;
  oemIndex?: number | null;
  oemPartNumber?: string | null;
  serial?: string | null;
  availability?: "STANDARD" | "VARIANT_DEPENDENT" | "UNKNOWN";
  metadata?: Record<string, string | number | boolean | null>;
};

export type RobotSignalDescriptor = {
  name: string;
  unit?: string | null;
  componentKind?: RobotComponentDescriptor["kind"] | null;
  valueType: "number" | "string" | "boolean";
  description: string;
};

export type ReadableRobotChannel = {
  name: string;
  messageType?: string | null;
  description?: string | null;
};

export type RobotDiscoveryResult = {
  adapterId: string;
  robot: RobotIdentity;
  transportKind: RobotTransportKind;
  readableChannels: ReadableRobotChannel[];
  components: RobotComponentDescriptor[];
  signals: RobotSignalDescriptor[];
  notes: string[];
};

export type TelemetrySource = {
  adapterId: string;
  transportKind: RobotTransportKind;
  channel: string;
  rawField?: string | null;
};

export type NormalizedTelemetryEvent = {
  timestamp: string;
  captureSessionId: string;
  robotId: string;
  configurationId?: string | null;
  componentId?: string | null;
  signal: string;
  value: SignalValue;
  unit?: string | null;
  sensitivity: DataSensitivity;
  source: TelemetrySource;
};

export type NormalizationContext = {
  robotId: string;
  captureSessionId: string;
  configurationId?: string | null;
  timestamp?: string;
  transportKind: RobotTransportKind;
};

export type RobotAdapterSecurityProfile = {
  mode: "READ_ONLY";
  controlCommands: "DISABLED";
  actuation: "DISABLED";
  remoteControl: "DISABLED";
  cloudUpload: "DISABLED_BY_DEFAULT";
  rawAudio: "DISABLED_BY_DEFAULT";
  rawVideo: "DISABLED_BY_DEFAULT";
  telemetrySensitivity: "SENSITIVE_BY_DEFAULT";
};

export type RobotFrameHandler = (payload: unknown, channel: ReadableRobotChannel) => void | Promise<void>;

export type RobotSubscription = {
  unsubscribe(): Promise<void>;
};

/**
 * Intentionally read-only.
 *
 * There is no publish/send/control method in this contract. A transport with
 * command capability must be wrapped behind a read-only facade before an
 * Elaris Robot Adapter may receive it.
 */
export interface ReadOnlyRobotTransport {
  readonly kind: RobotTransportKind;
  connect(): Promise<void>;
  close(): Promise<void>;
  listReadableChannels(): Promise<ReadableRobotChannel[]>;
  subscribe(channelName: string, handler: RobotFrameHandler): Promise<RobotSubscription>;
}

export interface RobotAdapter {
  readonly id: string;
  readonly displayName: string;
  readonly security: RobotAdapterSecurityProfile;

  supports(robot: RobotIdentity): boolean;
  allowedChannels(): readonly string[];
  blockedChannels(): readonly string[];
  components(): readonly RobotComponentDescriptor[];
  signals(): readonly RobotSignalDescriptor[];

  discover(transport: ReadOnlyRobotTransport, robot: RobotIdentity): Promise<RobotDiscoveryResult>;

  normalize(
    channel: ReadableRobotChannel,
    payload: unknown,
    context: NormalizationContext
  ): readonly NormalizedTelemetryEvent[];
}
