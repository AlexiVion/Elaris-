import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
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
import { analyzeComponentHealthBaseline } from "@/lib/component-health/baseline";
import {
  analyzeComponentHealthFieldEvidence,
  loadFieldPhaseManifest,
  renderFieldEvidenceMarkdown,
} from "@/lib/component-health/field-evidence";
import {
  analyzeComponentHealthEvidenceV03,
  extractComponentHealthQualityV03,
  renderComponentHealthEvidenceV03Markdown,
} from "@/lib/component-health/evidence-engine-v03";
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
    case "health-baseline":
      await healthBaseline(args);
      return;
    case "health-report":
      await healthReport(args);
      return;
    case "health-report-v03":
      await healthReportV03(args);
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
    console.log(`NETWORK LINK READY: ${payload.network_link_ready ? "YES" : "NO"}`);
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
    console.log("Live robot host is NOT field-ready. WSL is software-only, and native Linux also requires an active multicast-capable interface.");
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


async function healthBaseline(args: string[]) {
  const passphrase = requirePassphrase();
  const sessionDir = resolve(requiredPositional(args, 0, "session directory"));
  const requestedComponent = optionalFlag(args, "--component");
  const json = args.includes("--json");

  const baseline = await analyzeComponentHealthBaseline(sessionDir, passphrase);

  if (json) {
    console.log(JSON.stringify(baseline, null, 2));
    return;
  }

  console.log("ELARIS COMPONENT HEALTH — OBSERVED BASELINE");
  console.log("-------------------------------------------");
  console.log(`Session: ${baseline.sessionId}`);
  console.log(`Evidence class: ${baseline.evidenceClass}`);
  console.log(`Assessment: ${baseline.assessment}`);
  console.log(`Frames: ${baseline.frameCount}`);
  console.log(`Normalized events: ${baseline.eventCount}`);
  console.log(`Mapped joint slots observed: ${baseline.componentCount}`);
  console.log(`Usable observed components: ${baseline.usableComponentCount}`);
  console.log(`Unresolved motor slots: ${baseline.unresolvedSlotCount}`);
  console.log("");
  console.log("No diagnosis, failure probability, health score, or RUL is produced.");
  console.log("");

  const components = requestedComponent
    ? baseline.components.filter(
        (component) =>
          component.componentId === requestedComponent ||
          component.componentName.toLowerCase().includes(requestedComponent.toLowerCase())
      )
    : baseline.components;

  if (components.length === 0) {
    throw new Error(`No observed component matches: ${requestedComponent}`);
  }

  for (const component of components) {
    const evidenceSuffix =
      component.evidenceState === "OBSERVED_UNRESOLVED_SLOT"
        ? " [UNRESOLVED SLOT]"
        : "";

    console.log(
      `[${String(component.oemIndex ?? "?").padStart(2, "0")}] ${component.componentName}${evidenceSuffix}`
    );

    if (component.evidenceState === "OBSERVED_UNRESOLVED_SLOT") {
      console.log("  evidence: physical signals are constant zero with a non-zero OEM state code");
      console.log("  interpretation: configuration/slot unresolved — NOT treated as healthy or active");
    }

    printSignal(component.signals["motor.temperature.casing"], "  casing temp", true);
    printSignal(component.signals["motor.temperature.winding"], "  winding temp", true);
    printSignal(component.signals["motor.voltage"], "  voltage", true);
    printSignal(component.signals["joint.torque_estimate"], "  torque", false, true);
    printSignal(component.signals["joint.velocity"], "  velocity", false, true);

    const acceleration = component.signals["joint.acceleration"];
    if (acceleration?.quality === "CONSTANT_ZERO") {
      console.log(
        `  acceleration: CONSTANT_ZERO across ${acceleration.samples} samples | coverage=${percent(acceleration.coverage)} | informativeness=UNRESOLVED`
      );
    } else {
      printSignal(acceleration, "  acceleration", false, true);
    }

    const state = component.signals["motor.state_code"];
    if (state && "observedValues" in state) {
      console.log(
        `  state codes: ${state.observedValues.join(", ")} | transitions=${state.transitions} | coverage=${percent(state.coverage)}`
      );
    }

    console.log("");
  }

  console.log("Limitations:");
  for (const limitation of baseline.limitations) {
    console.log(`  - ${limitation}`);
  }
}

function printSignal(
  signal: import("@/lib/component-health/baseline").NumericSignalBaseline |
    import("@/lib/component-health/baseline").StateSignalBaseline |
    undefined,
  label: string,
  range = false,
  absP95 = false
) {
  if (!signal) {
    console.log(`${label}: NOT OBSERVED`);
    return;
  }

  const unit = signal.unit ? ` ${signal.unit}` : "";

  if (absP95) {
    console.log(
      `${label}: absP95=${fmt(signal.absP95)}${unit} | signed=[${fmt(signal.min)}, ${fmt(signal.max)}]${unit} | n=${signal.samples} | coverage=${percent(signal.coverage)}`
    );
    return;
  }

  if (range) {
    console.log(
      `${label}: mean=${fmt(signal.mean)}${unit} | p95=${fmt(signal.p95)}${unit} | min=${fmt(signal.min)}${unit} | max=${fmt(signal.max)}${unit} | n=${signal.samples} | coverage=${percent(signal.coverage)}`
    );
    return;
  }

  console.log(
    `${label}: mean=${fmt(signal.mean)}${unit} | n=${signal.samples} | coverage=${percent(signal.coverage)}`
  );
}

function fmt(value: number) {
  return Number.isFinite(value) ? value.toFixed(3) : "NaN";
}

function percent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

async function healthReport(args: string[]) {
  const passphrase = requirePassphrase();
  const baselineDir = resolve(requiredPositional(args, 0, "baseline session directory"));
  const sessionDir = resolve(requiredPositional(args, 1, "observed session directory"));
  const phaseManifestPath = resolve(requiredFlag(args, "--phases"));
  const salvageHashFlag = optionalFlag(args, "--salvage-hashes");
  const salvageHashFile = salvageHashFlag ? resolve(salvageHashFlag) : null;
  const sourceDirFlag = optionalFlag(args, "--source-dir");
  const sourceHashFlag = optionalFlag(args, "--source-salvage-hashes");
  const derivativeHashFlag = optionalFlag(args, "--derivative-hashes");

  const phaseManifest = await loadFieldPhaseManifest(phaseManifestPath);
  const report = await analyzeComponentHealthFieldEvidence({
    baselineDir,
    sessionDir,
    passphrase,
    phaseManifest,
    salvageHashFile,
    sourceSessionDir: sourceDirFlag ? resolve(sourceDirFlag) : null,
    sourceSalvageHashFile: sourceHashFlag ? resolve(sourceHashFlag) : null,
    derivativeHashFile: derivativeHashFlag ? resolve(derivativeHashFlag) : null,
  });

  const outputDir = resolve(
    optionalFlag(args, "--out") ??
      `derived/${report.sessionId}-field-evidence-v0`
  );

  await mkdir(outputDir, { recursive: true });

  const jsonPath = resolve(outputDir, "field-evidence-report.json");
  const markdownPath = resolve(outputDir, "field-evidence-report.md");
  const phaseSnapshotPath = resolve(outputDir, "phase-manifest.json");

  await writeFile(jsonPath, JSON.stringify(report, null, 2) + "\n", "utf8");
  await writeFile(
    markdownPath,
    renderFieldEvidenceMarkdown(report) + "\n",
    "utf8"
  );
  await writeFile(
    phaseSnapshotPath,
    JSON.stringify(phaseManifest, null, 2) + "\n",
    "utf8"
  );

  console.log("ELARIS COMPONENT HEALTH — FIELD EVIDENCE REPORT");
  console.log("-----------------------------------------------");
  console.log(`Baseline: ${report.baselineSessionId}`);
  console.log(`Observed session: ${report.sessionId}`);
  console.log(`Session state: ${report.sessionState}`);
  console.log(`Disposition: ${report.disposition}`);
  console.log(
    `Working-copy integrity: ${report.integrity.verified ? "VERIFIED" : "NOT VERIFIED"} via ${report.integrity.method}`
  );
  console.log(`Source integrity: ${report.provenance.sourceIntegrity.method}`);
  console.log(`Working copy: ${report.provenance.workingCopyKind}`);
  console.log(`Plaintext equivalence: ${report.provenance.plaintextEquivalence}`);
  console.log(`Phases analyzed: ${report.phases.length}`);
  console.log(`Classification: ${report.sourceClassification}`);
  console.log("");
  console.log("Generated:");
  console.log(`  ${jsonPath}`);
  console.log(`  ${markdownPath}`);
  console.log(`  ${phaseSnapshotPath}`);
  console.log("");
  console.log(
    "Descriptive evidence only — no diagnosis, health score, failure probability, or RUL."
  );
}

async function healthReportV03(args: string[]) {
  const passphrase = requirePassphrase();
  const baselineDir = resolve(requiredPositional(args, 0, "baseline working session directory"));
  const sessionDir = resolve(requiredPositional(args, 1, "observed working session directory"));
  const phaseManifestPath = resolve(requiredFlag(args, "--phases"));

  const salvageHashFlag = optionalFlag(args, "--salvage-hashes");
  const sourceDirFlag = optionalFlag(args, "--source-dir");
  const sourceHashFlag = optionalFlag(args, "--source-salvage-hashes");
  const derivativeHashFlag = optionalFlag(args, "--derivative-hashes");

  const baselineSourceDirFlag = optionalFlag(args, "--baseline-source-dir");
  const baselineSourceHashFlag = optionalFlag(args, "--baseline-source-hashes");
  const baselineDerivativeHashFlag = optionalFlag(args, "--baseline-derivative-hashes");

  const phaseManifest = await loadFieldPhaseManifest(phaseManifestPath);
  const report = await analyzeComponentHealthEvidenceV03({
    baselineDir,
    sessionDir,
    passphrase,
    phaseManifest,
    salvageHashFile: salvageHashFlag ? resolve(salvageHashFlag) : null,
    sourceSessionDir: sourceDirFlag ? resolve(sourceDirFlag) : null,
    sourceSalvageHashFile: sourceHashFlag ? resolve(sourceHashFlag) : null,
    derivativeHashFile: derivativeHashFlag ? resolve(derivativeHashFlag) : null,
    baselineSourceDir: baselineSourceDirFlag ? resolve(baselineSourceDirFlag) : null,
    baselineSourceHashFile: baselineSourceHashFlag ? resolve(baselineSourceHashFlag) : null,
    baselineDerivativeHashFile: baselineDerivativeHashFlag
      ? resolve(baselineDerivativeHashFlag)
      : null,
  });

  const outputDir = resolve(
    optionalFlag(args, "--out") ??
      `derived/${report.run.analysisId.toLowerCase()}`
  );
  await mkdir(outputDir, { recursive: true });

  const jsonPath = resolve(outputDir, "field-evidence-v03.json");
  const markdownPath = resolve(outputDir, "field-evidence-v03.md");
  const analysisRunPath = resolve(outputDir, "analysis-run.json");
  const qualityPath = resolve(outputDir, "quality-v03.json");
  const phaseSnapshotPath = resolve(outputDir, "phase-manifest.json");
  const checksumsPath = resolve(outputDir, "checksums.sha256");

  await writeFile(jsonPath, JSON.stringify(report, null, 2) + "\n", "utf8");
  await writeFile(
    markdownPath,
    renderComponentHealthEvidenceV03Markdown(report) + "\n",
    "utf8"
  );
  await writeFile(
    analysisRunPath,
    JSON.stringify(report.run, null, 2) + "\n",
    "utf8"
  );
  await writeFile(
    qualityPath,
    JSON.stringify(extractComponentHealthQualityV03(report), null, 2) + "\n",
    "utf8"
  );
  await writeFile(
    phaseSnapshotPath,
    JSON.stringify(phaseManifest, null, 2) + "\n",
    "utf8"
  );

  const outputFiles = [
    "field-evidence-v03.json",
    "field-evidence-v03.md",
    "analysis-run.json",
    "quality-v03.json",
    "phase-manifest.json",
  ];

  const checksumRows: string[] = [];
  for (const file of outputFiles) {
    const payload = await readFile(resolve(outputDir, file));
    checksumRows.push(
      `${createHash("sha256").update(payload).digest("hex")}  ${file}`
    );
  }
  await writeFile(checksumsPath, checksumRows.join("\n") + "\n", "utf8");

  console.log("ELARIS COMPONENT HEALTH — EVIDENCE ENGINE V0.3");
  console.log("------------------------------------------------");
  console.log(`Analysis ID: ${report.run.analysisId}`);
  console.log(`Input fingerprint: ${report.run.inputFingerprint}`);
  console.log(`Observed session: ${report.run.inputs.observed.sessionId}`);
  console.log(`Historical baseline: ${report.run.inputs.historicalBaseline.sessionId}`);
  console.log("Primary reference: SAME_SESSION_PHASE / IDLE_BASELINE");
  console.log(`Phases: ${report.phases.length}`);
  console.log(`Component slots per phase: ${report.robot.componentSlots}`);
  console.log(`Max coverage: ${(report.quality.maxCoverage * 100).toFixed(1)}%`);
  console.log(`Quality findings: ${report.quality.findings.length}`);
  console.log(`Observed working copy: ${report.run.inputs.observed.workingCopyKind}`);
  console.log(
    `Historical baseline working copy: ${report.run.inputs.historicalBaseline.workingCopyKind}`
  );
  console.log("");
  console.log("Generated:");
  for (const file of [...outputFiles, "checksums.sha256"]) {
    console.log(`  ${resolve(outputDir, file)}`);
  }
  console.log("");
  console.log(
    "Descriptive evidence only — no diagnosis, health score, failure probability, anomaly probability, damage score, or RUL."
  );
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

  pnpm edge health-baseline <capture-dir> [--component <id-or-name>] [--json]

  pnpm edge health-report <baseline-dir> <observed-session-dir> \
    --phases <phase-manifest.json> \
    [--salvage-hashes <source-sha256.txt>] \
    [--source-dir <original-open-capture-dir> \
     --source-salvage-hashes <source-sha256.txt> \
     --derivative-hashes <working-copy-sha256.txt>] \
    [--out <derived-output-dir>]

  pnpm edge health-report-v03 <baseline-working-dir> <observed-working-dir> \
    --phases <phase-manifest.json> \
    [--salvage-hashes <observed-source-sha256.txt>] \
    [--source-dir <observed-original-dir> \
     --source-salvage-hashes <observed-source-sha256.txt> \
     --derivative-hashes <observed-working-sha256.txt>] \
    [--baseline-source-dir <baseline-original-dir> \
     --baseline-source-hashes <baseline-source-sha256.txt> \
     --baseline-derivative-hashes <baseline-working-sha256.txt>] \
    [--out <derived-output-dir>]

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
