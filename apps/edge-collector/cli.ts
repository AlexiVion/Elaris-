import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import {
  ReplayTransport,
  UNITREE_G1_LOWSTATE_CHANNEL,
  UnitreeG1Adapter,
  UnitreeG1Sdk2ReadOnlyTransport,
  type ReadableRobotChannel,
  type RobotIdentity,
} from "@/lib/robot-adapters";
import {
  CaptureSessionWriter,
  approveCaptureExport,
  decryptTelemetrySample,
  readCaptureManifest,
  readCaptureSummary,
} from "@/lib/edge-collector/session";

type ReplayFixture = {
  robot: RobotIdentity;
  channels: ReadableRobotChannel[];
  frames: Array<{ channel: string; payload: unknown }>;
};

async function main() {
  const [, , command, ...args] = process.argv;

  switch (command) {
    case "doctor-unitree":
      await doctorUnitree(args);
      return;
    case "inspect-unitree":
      await inspectUnitree(args);
      return;
    case "capture-unitree":
      await captureUnitree(args);
      return;
    case "capture-replay":
      await captureReplay(args);
      return;
    case "review":
      await reviewCapture(args);
      return;
    case "approve-export":
      await approveExport(args);
      return;
    case "help":
    case "--help":
    case "-h":
    case undefined:
      printHelp();
      return;
    default:
      throw new Error(`Unknown edge command: ${command}. Run: pnpm edge help`);
  }
}

async function doctorUnitree(args: string[]) {
  const networkInterface = requiredFlag(args, "--interface");
  const pythonCommand = process.env.ELARIS_UNITREE_PYTHON ?? "python3";
  const scriptPath = resolve("apps/edge-collector/unitree_g1_preflight.py");
  const bridgePath = resolve("apps/edge-collector/unitree_g1_readonly_bridge.py");

  const env = { ...process.env };
  delete env.ELARIS_EDGE_PASSPHRASE;

  const result = spawnSync(
    pythonCommand,
    [scriptPath, "--interface", networkInterface, "--bridge", bridgePath],
    {
      encoding: "utf8",
      shell: false,
      windowsHide: true,
      env,
    }
  );

  const stdout = (result.stdout ?? "").trim();
  const stderr = (result.stderr ?? "").trim();

  let payload: any = null;
  try {
    payload = stdout ? JSON.parse(stdout) : null;
  } catch {
    payload = null;
  }

  console.log("ELARIS UNITREE FIELD DOCTOR");
  console.log("---------------------------");
  console.log("Robot connection: NOT ATTEMPTED");
  console.log("Mode: READ ONLY");
  console.log(`Python: ${pythonCommand}`);
  console.log(`Requested interface: ${networkInterface}`);
  console.log("");

  if (payload?.checks) {
    const checks = payload.checks as Record<string, { ok?: boolean; [key: string]: unknown }>;
    for (const [name, check] of Object.entries(checks)) {
      console.log(`${check.ok ? "PASS" : "FAIL"}: ${name}`);
    }
    console.log("");
    console.log(`Host mode: ${payload.host_mode ?? "UNKNOWN"}`);
    console.log(`SOFTWARE READY: ${payload.software_ready ? "YES" : "NO"}`);
    console.log(`LIVE ROBOT HOST READY: ${payload.live_host_ready ? "YES" : "NO"}`);
  } else {
    console.log("FIELD READY: NO");
    console.log("Preflight did not return valid JSON.");
  }

  if (stderr) {
    console.log("");
    console.log("Preflight stderr:");
    console.log(stderr);
  }

  if (result.error) {
    throw result.error;
  }
  if (!payload?.software_ready) {
    throw new Error("Unitree software preflight failed. Fix FAIL items before continuing.");
  }

  if (!payload?.live_host_ready) {
    console.log("");
    console.log("Live robot host is NOT field-ready. This is expected on WSL; use it only for SDK/software preparation.");
  }
}
async function inspectUnitree(args: string[]) {
  const networkInterface = requiredFlag(args, "--interface");
  const sampleHz = numberFlag(args, "--hz", 20);
  const transport = new UnitreeG1Sdk2ReadOnlyTransport(networkInterface, sampleHz);
  const adapter = new UnitreeG1Adapter();

  try {
    await transport.connect();
    const discovery = await adapter.discover(transport, {
      manufacturer: "Unitree",
      model: "G1",
    });

    const sample = await waitForFirstFrame(
      transport,
      UNITREE_G1_LOWSTATE_CHANNEL,
      5_000
    );

    const events = adapter.normalize(
      { name: UNITREE_G1_LOWSTATE_CHANNEL },
      sample,
      {
        robotId: "INSPECT-ONLY",
        captureSessionId: "INSPECT-ONLY",
        transportKind: "dds",
      }
    );

    const componentIds = new Set(
      events.map((event) => event.componentId).filter(Boolean)
    );
    const signalNames = [...new Set(events.map((event) => event.signal))].sort();

    console.log("ELARIS EDGE COLLECTOR — UNITREE INSPECT");
    console.log("---------------------------------------");
    console.log("Mode: READ ONLY");
    console.log("Robot family: Unitree G1");
    console.log(`Transport: SDK2 / DDS via ${networkInterface}`);
    console.log(`Sampling cap: ${sampleHz} Hz`);
    console.log("");
    console.log("Readable channels:");
    for (const channel of discovery.readableChannels) {
      console.log(`  ✓ ${channel.name}`);
    }
    console.log("");
    console.log("Blocked by Elaris policy:");
    for (const channel of adapter.blockedChannels()) {
      console.log(`  ✗ ${channel}`);
    }
    console.log("");
    console.log(`Normalized components observed in first frame: ${componentIds.size}`);
    console.log(`Normalized signal types observed: ${signalNames.length}`);
    for (const signal of signalNames) {
      console.log(`  - ${signal}`);
    }
    console.log("");
    console.log("No robot command was sent. No data was written to disk.");
  } finally {
    await transport.close();
  }
}

async function captureUnitree(args: string[]) {
  const passphrase = requirePassphrase();
  const networkInterface = requiredFlag(args, "--interface");
  const robotId = requiredFlag(args, "--robot-id");
  const purpose = requiredFlag(args, "--purpose");
  const durationSeconds = numberFlag(args, "--duration", 60);
  const sampleHz = numberFlag(args, "--hz", 20);
  const rootDir = optionalFlag(args, "--root") ?? resolve("captures");
  const configurationId = optionalFlag(args, "--configuration");

  if (durationSeconds <= 0 || durationSeconds > 3600) {
    throw new Error("--duration must be > 0 and <= 3600 seconds");
  }

  const transport = new UnitreeG1Sdk2ReadOnlyTransport(networkInterface, sampleHz);
  const adapter = new UnitreeG1Adapter();

  try {
    await transport.connect();
    const discovery = await adapter.discover(transport, {
      manufacturer: "Unitree",
      model: "G1",
    });

    if (!discovery.readableChannels.some((channel) => channel.name === UNITREE_G1_LOWSTATE_CHANNEL)) {
      throw new Error("rt/lowstate is not readable; refusing to start capture");
    }

    const writer = await CaptureSessionWriter.create({
      rootDir,
      passphrase,
      purpose,
      robotId,
      robot: {
        manufacturer: "Unitree",
        model: "G1",
      },
      adapterId: adapter.id,
      transportKind: transport.kind,
      configurationId,
      discovery,
    });

    let writeChain: Promise<unknown> = Promise.resolve();
    const subscription = await transport.subscribe(
      UNITREE_G1_LOWSTATE_CHANNEL,
      (payload, channel) => {
        const timestamp = new Date().toISOString();
        const events = adapter.normalize(channel, payload, {
          robotId,
          configurationId,
          captureSessionId: writer.sessionDir.split(/[\\/]/).pop() ?? "unknown",
          timestamp,
          transportKind: transport.kind,
        });

        writeChain = writeChain.then(() =>
          writer.append({
            rawFrame: {
              timestamp,
              channel: channel.name,
              payload,
            },
            events,
          })
        );
      }
    );

    console.log("ELARIS EDGE COLLECTOR");
    console.log("Mode: READ ONLY");
    console.log("Cloud upload: DISABLED");
    console.log("Raw audio/video: DISABLED");
    console.log(`Capture: ${durationSeconds}s @ <= ${sampleHz} Hz`);
    console.log(`Local encrypted session: ${writer.sessionDir}`);

    await sleep(durationSeconds * 1000);
    await subscription.unsubscribe();
    await writeChain;

    const result = await writer.finalize();
    console.log("");
    console.log("Capture FINALIZED.");
    console.log(`Frames: ${result.summary.frameCount}`);
    console.log(`Normalized events: ${result.summary.eventCount}`);
    console.log("Export approval: NOT_APPROVED");
  } finally {
    await transport.close();
  }
}

async function captureReplay(args: string[]) {
  const passphrase = requirePassphrase();
  const fixturePath = requiredFlag(args, "--fixture");
  const robotId = requiredFlag(args, "--robot-id");
  const purpose = requiredFlag(args, "--purpose");
  const rootDir = optionalFlag(args, "--root") ?? resolve("captures");
  const configurationId = optionalFlag(args, "--configuration");

  const fixture = JSON.parse(
    await readFile(resolve(fixturePath), "utf8")
  ) as ReplayFixture;

  const transport = new ReplayTransport(fixture.channels, fixture.frames);
  const adapter = new UnitreeG1Adapter();

  await transport.connect();
  try {
    const discovery = await adapter.discover(transport, fixture.robot);
    const writer = await CaptureSessionWriter.create({
      rootDir,
      passphrase,
      purpose,
      robotId,
      robot: fixture.robot,
      adapterId: adapter.id,
      transportKind: transport.kind,
      configurationId,
      discovery,
    });

    let writeChain: Promise<unknown> = Promise.resolve();
    const subscriptions = [];

    for (const channel of discovery.readableChannels) {
      subscriptions.push(
        await transport.subscribe(channel.name, (payload, readableChannel) => {
          const timestamp = new Date().toISOString();
          const events = adapter.normalize(readableChannel, payload, {
            robotId,
            configurationId,
            captureSessionId: writer.sessionDir.split(/[\\/]/).pop() ?? "unknown",
            timestamp,
            transportKind: transport.kind,
          });

          writeChain = writeChain.then(() =>
            writer.append({
              rawFrame: {
                timestamp,
                channel: readableChannel.name,
                payload,
              },
              events,
            })
          );
        })
      );
    }

    await transport.replayAll();
    await writeChain;
    for (const subscription of subscriptions) {
      await subscription.unsubscribe();
    }

    const result = await writer.finalize();
    console.log("Synthetic replay capture FINALIZED.");
    console.log(`Session: ${result.summary.sessionId}`);
    console.log(`Directory: ${result.sessionDir}`);
    console.log(`Frames: ${result.summary.frameCount}`);
    console.log(`Events: ${result.summary.eventCount}`);
    console.log("Export approval: NOT_APPROVED");
  } finally {
    await transport.close();
  }
}

async function reviewCapture(args: string[]) {
  const passphrase = requirePassphrase();
  const sessionDir = resolve(requiredPositional(args, 0, "session directory"));
  const sampleCount = numberFlag(args, "--sample", 0);

  const [summary, manifest] = await Promise.all([
    readCaptureSummary(sessionDir),
    readCaptureManifest(sessionDir, passphrase),
  ]);

  console.log("ELARIS EDGE CAPTURE REVIEW");
  console.log("--------------------------");
  console.log(`Session: ${summary.sessionId}`);
  console.log(`State: ${summary.state}`);
  console.log(`Classification: ${summary.classification}`);
  console.log(`Export approval: ${summary.exportApproval}`);
  console.log(`Purpose: ${manifest.purpose}`);
  console.log(`Robot ID: ${manifest.robotId}`);
  console.log(`Robot: ${manifest.robot.manufacturer} ${manifest.robot.model}`);
  console.log(`Adapter: ${manifest.adapterId}`);
  console.log(`Transport: ${manifest.transportKind}`);
  console.log(`Frames: ${summary.frameCount}`);
  console.log(`Normalized events: ${summary.eventCount}`);
  console.log("");
  console.log("Collection policy:");
  console.log("  READ ONLY");
  console.log("  cloud upload disabled during capture");
  console.log("  raw audio/video disabled");

  if (sampleCount > 0) {
    const sample = await decryptTelemetrySample(
      sessionDir,
      passphrase,
      Math.min(sampleCount, 20)
    );
    console.log("");
    console.log("Decrypted telemetry sample:");
    console.log(JSON.stringify(sample, null, 2));
  }
}

async function approveExport(args: string[]) {
  const passphrase = requirePassphrase();
  const sessionDir = resolve(requiredPositional(args, 0, "session directory"));
  const reviewer = requiredFlag(args, "--reviewer");
  const reason = requiredFlag(args, "--reason");

  const summary = await approveCaptureExport(sessionDir, passphrase, {
    reviewer,
    reason,
  });

  console.log(`Session ${summary.sessionId} marked APPROVED for export.`);
  console.log("This does not upload or transmit anything.");
}

async function waitForFirstFrame(
  transport: UnitreeG1Sdk2ReadOnlyTransport,
  channelName: string,
  timeoutMs: number
) {
  return new Promise<unknown>(async (resolveFrame, reject) => {
    let subscription: Awaited<ReturnType<typeof transport.subscribe>> | null = null;
    const timer = setTimeout(async () => {
      if (subscription) await subscription.unsubscribe();
      reject(new Error(`No ${channelName} frame received within ${timeoutMs} ms`));
    }, timeoutMs);

    subscription = await transport.subscribe(channelName, async (payload) => {
      clearTimeout(timer);
      if (subscription) await subscription.unsubscribe();
      resolveFrame(payload);
    });
  });
}

function requirePassphrase() {
  const value = process.env.ELARIS_EDGE_PASSPHRASE;
  if (!value) {
    throw new Error(
      "ELARIS_EDGE_PASSPHRASE is required. Do not pass secrets as CLI arguments."
    );
  }
  return value;
}

function optionalFlag(args: string[], name: string) {
  const index = args.indexOf(name);
  if (index < 0) return null;
  const value = args[index + 1];
  if (!value || value.startsWith("--")) {
    throw new Error(`Missing value for ${name}`);
  }
  return value;
}

function requiredFlag(args: string[], name: string) {
  const value = optionalFlag(args, name);
  if (!value) throw new Error(`Required flag: ${name}`);
  return value;
}

function numberFlag(args: string[], name: string, fallback: number) {
  const value = optionalFlag(args, name);
  if (value === null) return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new Error(`${name} must be a number`);
  }
  return parsed;
}

function requiredPositional(args: string[], index: number, label: string) {
  const value = args.filter((arg, i) => {
    if (i > 0 && args[i - 1]?.startsWith("--")) return false;
    return !arg.startsWith("--");
  })[index];
  if (!value) throw new Error(`Missing ${label}`);
  return value;
}

function sleep(ms: number) {
  return new Promise((resolveSleep) => setTimeout(resolveSleep, ms));
}

function printHelp() {
  console.log(`
Elaris Edge Collector V0

Security defaults:
  READ ONLY
  local encrypted capture
  cloud upload disabled
  raw audio/video disabled
  export requires explicit local approval

Commands:

  pnpm edge doctor-unitree --interface <iface>

  pnpm edge inspect-unitree --interface <iface> [--hz 20]

  pnpm edge capture-unitree \\
    --interface <iface> \\
    --robot-id <id> \\
    --purpose <purpose> \\
    [--duration 60] [--hz 20] [--configuration <id>] [--root captures]

  pnpm edge capture-replay \\
    --fixture <json> \\
    --robot-id <id> \\
    --purpose <purpose> \\
    [--configuration <id>] [--root captures]

  pnpm edge review <capture-dir> [--sample 5]

  pnpm edge approve-export <capture-dir> \\
    --reviewer <name> \\
    --reason <reason>

Capture / review / approval require:
  ELARIS_EDGE_PASSPHRASE

Live Unitree access additionally requires the official unitree_sdk2_python
environment and an authorized robot network interface.
`.trim());
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error("Elaris Edge Collector error:", message);
  process.exitCode = 1;
});
