import type {
  ReadableRobotChannel,
  ReadOnlyRobotTransport,
  RobotFrameHandler,
  RobotFrameMetadata,
  RobotSubscription,
} from "./types";
import { assertReadOnlyChannel } from "./security";

type ReplayFrame = {
  channel: string;
  payload: unknown;
  metadata?: RobotFrameMetadata;
};

export class ReplayTransport implements ReadOnlyRobotTransport {
  readonly kind = "replay" as const;

  private connected = false;
  private readonly handlers = new Map<string, Set<RobotFrameHandler>>();

  constructor(
    private readonly channels: readonly ReadableRobotChannel[],
    private readonly frames: readonly ReplayFrame[] = []
  ) {}

  async connect() {
    this.connected = true;
  }

  async close() {
    this.connected = false;
    this.handlers.clear();
  }

  async listReadableChannels() {
    this.assertConnected();
    return [...this.channels];
  }

  async subscribe(channelName: string, handler: RobotFrameHandler): Promise<RobotSubscription> {
    this.assertConnected();
    assertReadOnlyChannel(channelName);

    const channel = this.channels.find((candidate) => candidate.name === channelName);
    if (!channel) {
      throw new Error(`Replay channel not available: ${channelName}`);
    }

    const set = this.handlers.get(channelName) ?? new Set<RobotFrameHandler>();
    set.add(handler);
    this.handlers.set(channelName, set);

    return {
      unsubscribe: async () => {
        set.delete(handler);
      },
    };
  }

  async replayAll() {
    this.assertConnected();

    for (const frame of this.frames) {
      await this.emit(frame.channel, frame.payload, frame.metadata);
    }
  }

  async emit(channelName: string, payload: unknown, metadata?: RobotFrameMetadata) {
    this.assertConnected();
    assertReadOnlyChannel(channelName);

    const channel = this.channels.find((candidate) => candidate.name === channelName);
    if (!channel) {
      throw new Error(`Replay channel not available: ${channelName}`);
    }

    for (const handler of this.handlers.get(channelName) ?? []) {
      await handler(payload, channel, metadata);
    }
  }

  private assertConnected() {
    if (!this.connected) {
      throw new Error("ReplayTransport is not connected");
    }
  }
}
