import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { createInterface } from "node:readline";
import { resolve } from "node:path";
import type {
  ReadableRobotChannel,
  ReadOnlyRobotTransport,
  RobotFrameHandler,
  RobotSubscription,
} from "./types";
import { assertReadOnlyChannel } from "./security";

type BridgeMessage =
  | { type: "ready"; channel: string; messageType?: string }
  | { type: "frame"; channel: string; timestamp: string; payload: unknown }
  | { type: "error"; message: string };

export class UnitreeG1Sdk2ReadOnlyTransport implements ReadOnlyRobotTransport {
  readonly kind = "dds" as const;

  private process: ChildProcessWithoutNullStreams | null = null;
  private ready = false;
  private readonly handlers = new Map<string, Set<RobotFrameHandler>>();
  private readonly channels = new Map<string, ReadableRobotChannel>();
  private stderr = "";

  constructor(
    private readonly networkInterface: string,
    private readonly pythonCommand = process.env.ELARIS_UNITREE_PYTHON ?? "python3",
    private readonly bridgePath = resolve("apps/edge-collector/unitree_g1_readonly_bridge.py"),
    private readonly startupTimeoutMs = 12_000
  ) {
    if (!networkInterface.trim()) {
      throw new Error("Unitree network interface is required");
    }
  }

  async connect() {
    if (this.process) return;

    const child = spawn(
      this.pythonCommand,
      [this.bridgePath, "--interface", this.networkInterface],
      {
        stdio: ["ignore", "pipe", "pipe"],
        shell: false,
        windowsHide: true,
      }
    );

    this.process = child;
    child.stderr.setEncoding("utf8");
    child.stderr.on("data", (chunk: string) => {
      this.stderr += chunk;
      if (this.stderr.length > 8_000) {
        this.stderr = this.stderr.slice(-8_000);
      }
    });

    const rl = createInterface({ input: child.stdout });
    rl.on("line", (line) => {
      this.handleLine(line).catch(() => {});
    });

    await new Promise<void>((resolveReady, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(
          "Timed out waiting for Unitree SDK2 read-only bridge. " +
          this.formatStderr()
        ));
      }, this.startupTimeoutMs);

      const poll = setInterval(() => {
        if (this.ready) {
          clearTimeout(timer);
          clearInterval(poll);
          resolveReady();
        }

        if (child.exitCode !== null) {
          clearTimeout(timer);
          clearInterval(poll);
          reject(new Error(
            `Unitree SDK2 bridge exited with code ${child.exitCode}. ${this.formatStderr()}`
          ));
        }
      }, 50);
    });
  }

  async close() {
    const child = this.process;
    this.process = null;
    this.ready = false;
    this.handlers.clear();
    this.channels.clear();

    if (!child || child.exitCode !== null) return;

    child.kill("SIGTERM");
    await new Promise<void>((resolveClose) => {
      const timer = setTimeout(() => {
        if (child.exitCode === null) child.kill("SIGKILL");
        resolveClose();
      }, 2_000);
      child.once("exit", () => {
        clearTimeout(timer);
        resolveClose();
      });
    });
  }

  async listReadableChannels() {
    this.assertConnected();
    return [...this.channels.values()];
  }

  async subscribe(channelName: string, handler: RobotFrameHandler): Promise<RobotSubscription> {
    this.assertConnected();
    assertReadOnlyChannel(channelName);

    const channel = this.channels.get(channelName);
    if (!channel) {
      throw new Error(`Unitree bridge channel not available: ${channelName}`);
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

  private async handleLine(line: string) {
    if (!line.trim()) return;

    let message: BridgeMessage;
    try {
      message = JSON.parse(line) as BridgeMessage;
    } catch {
      return;
    }

    if (message.type === "error") {
      this.stderr += "\nbridge: " + message.message;
      return;
    }

    if (message.type === "ready") {
      assertReadOnlyChannel(message.channel);
      this.channels.set(message.channel, {
        name: message.channel,
        messageType: message.messageType ?? null,
        description: "Unitree SDK2 subscriber-only bridge",
      });
      this.ready = true;
      return;
    }

    if (message.type === "frame") {
      assertReadOnlyChannel(message.channel);
      const channel = this.channels.get(message.channel);
      if (!channel) return;

      for (const handler of this.handlers.get(message.channel) ?? []) {
        await handler(message.payload, channel);
      }
    }
  }

  private assertConnected() {
    if (!this.process || !this.ready) {
      throw new Error("UnitreeG1Sdk2ReadOnlyTransport is not connected");
    }
  }

  private formatStderr() {
    const stderr = this.stderr.trim();
    return stderr ? `Bridge stderr: ${stderr}` : "No bridge stderr captured.";
  }
}
