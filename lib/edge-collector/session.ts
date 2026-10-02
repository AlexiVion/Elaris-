import { createHash, randomBytes } from "node:crypto";
import {
  appendFile,
  chmod,
  mkdir,
  readFile,
  writeFile,
} from "node:fs/promises";
import { join } from "node:path";
import { SessionCrypto } from "./crypto";
import type {
  CaptureAppendInput,
  CaptureCreateInput,
  CaptureManifest,
  CaptureSessionSummary,
  EncryptedEnvelope,
  ExportApprovalRecord,
} from "./types";

const SUMMARY_FILE = "session.public.json";
const MANIFEST_FILE = "manifest.enc.json";
const RAW_FILE = "raw.ndjson.enc";
const TELEMETRY_FILE = "telemetry.ndjson.enc";
const APPROVAL_FILE = "export-approval.enc.json";
const CHECKSUM_FILE = "checksums.sha256";

export class CaptureSessionWriter {
  private frameCount = 0;
  private eventCount = 0;
  private finalized = false;

  private constructor(
    readonly sessionDir: string,
    private readonly crypto: SessionCrypto,
    private summary: CaptureSessionSummary,
    private manifest: CaptureManifest
  ) {}

  static async create(input: CaptureCreateInput) {
    const sessionId = createSessionId();
    const sessionDir = join(input.rootDir, sessionId);
    await mkdir(sessionDir, { recursive: false, mode: 0o700 });
    await chmod(sessionDir, 0o700).catch(() => {});

    const crypto = SessionCrypto.create(input.passphrase);
    const startedAt = new Date().toISOString();

    const summary: CaptureSessionSummary = {
      version: 1,
      sessionId,
      classification: "SENSITIVE",
      state: "OPEN",
      createdAt: startedAt,
      frameCount: 0,
      eventCount: 0,
      exportApproval: "NOT_APPROVED",
      mode: "READ_ONLY",
      crypto: {
        algorithm: "AES-256-GCM",
        kdf: "scrypt",
        saltBase64: crypto.saltBase64,
      },
    };

    const manifest: CaptureManifest = {
      version: 1,
      sessionId,
      purpose: input.purpose,
      robotId: input.robotId,
      robot: input.robot,
      adapterId: input.adapterId,
      transportKind: input.transportKind,
      configurationId: input.configurationId,
      startedAt,
      readableChannels: input.discovery.readableChannels,
      discoveryNotes: input.discovery.notes,
      rawFrameRetention: true,
      normalizedTelemetryRetention: true,
      collectionPolicy: {
        mode: "READ_ONLY",
        rawAudio: "DISABLED",
        rawVideo: "DISABLED",
        cloudUploadDuringCapture: "DISABLED",
        defaultSensitivity: "SENSITIVE",
      },
    };

    await writeJson(join(sessionDir, SUMMARY_FILE), summary);
    await writeEncryptedJson(join(sessionDir, MANIFEST_FILE), crypto.encryptJson(manifest));
    await writeFile(join(sessionDir, RAW_FILE), "", { mode: 0o600 });
    await writeFile(join(sessionDir, TELEMETRY_FILE), "", { mode: 0o600 });

    return new CaptureSessionWriter(sessionDir, crypto, summary, manifest);
  }

  async append(input: CaptureAppendInput) {
    this.assertOpen();

    const rawLine = JSON.stringify(this.crypto.encryptJson(input.rawFrame)) + "\n";
    await appendFile(join(this.sessionDir, RAW_FILE), rawLine, { encoding: "utf8" });
    this.frameCount += 1;

    if (input.events.length > 0) {
      const encryptedEvents = input.events
        .map((event) => JSON.stringify(this.crypto.encryptJson(event)))
        .join("\n") + "\n";
      await appendFile(join(this.sessionDir, TELEMETRY_FILE), encryptedEvents, { encoding: "utf8" });
      this.eventCount += input.events.length;
    }

    await this.persistSummary();
  }

  async finalize() {
    this.assertOpen();
    const endedAt = new Date().toISOString();

    this.finalized = true;
    this.summary = {
      ...this.summary,
      state: "FINALIZED",
      finalizedAt: endedAt,
      frameCount: this.frameCount,
      eventCount: this.eventCount,
    };
    this.manifest = {
      ...this.manifest,
      endedAt,
    };

    await writeJson(join(this.sessionDir, SUMMARY_FILE), this.summary);
    await writeEncryptedJson(
      join(this.sessionDir, MANIFEST_FILE),
      this.crypto.encryptJson(this.manifest)
    );
    await writeChecksums(this.sessionDir, [
      SUMMARY_FILE,
      MANIFEST_FILE,
      RAW_FILE,
      TELEMETRY_FILE,
    ]);

    return {
      sessionDir: this.sessionDir,
      summary: this.summary,
    };
  }

  private async persistSummary() {
    this.summary = {
      ...this.summary,
      frameCount: this.frameCount,
      eventCount: this.eventCount,
    };
    await writeJson(join(this.sessionDir, SUMMARY_FILE), this.summary);
  }

  private assertOpen() {
    if (this.finalized) {
      throw new Error("Capture session is already finalized");
    }
  }
}

export async function readCaptureSummary(sessionDir: string) {
  return readJson<CaptureSessionSummary>(join(sessionDir, SUMMARY_FILE));
}

export async function readCaptureManifest(sessionDir: string, passphrase: string) {
  const summary = await readCaptureSummary(sessionDir);
  const crypto = SessionCrypto.fromPassphrase(
    passphrase,
    summary.crypto.saltBase64
  );
  const envelope = await readJson<EncryptedEnvelope>(join(sessionDir, MANIFEST_FILE));
  return crypto.decryptJson<CaptureManifest>(envelope);
}

export async function approveCaptureExport(
  sessionDir: string,
  passphrase: string,
  approval: Omit<ExportApprovalRecord, "version" | "sessionId" | "approvedAt">
) {
  const summary = await readCaptureSummary(sessionDir);
  if (summary.state !== "FINALIZED") {
    throw new Error("Capture must be FINALIZED before export approval");
  }

  const crypto = SessionCrypto.fromPassphrase(
    passphrase,
    summary.crypto.saltBase64
  );

  const record: ExportApprovalRecord = {
    version: 1,
    sessionId: summary.sessionId,
    reviewer: approval.reviewer,
    reason: approval.reason,
    approvedAt: new Date().toISOString(),
  };

  await writeEncryptedJson(
    join(sessionDir, APPROVAL_FILE),
    crypto.encryptJson(record)
  );

  const nextSummary: CaptureSessionSummary = {
    ...summary,
    exportApproval: "APPROVED",
  };
  await writeJson(join(sessionDir, SUMMARY_FILE), nextSummary);

  await writeChecksums(sessionDir, [
    SUMMARY_FILE,
    MANIFEST_FILE,
    RAW_FILE,
    TELEMETRY_FILE,
    APPROVAL_FILE,
  ]);

  return nextSummary;
}

export async function decryptTelemetrySample(
  sessionDir: string,
  passphrase: string,
  limit = 5
) {
  const summary = await readCaptureSummary(sessionDir);
  const crypto = SessionCrypto.fromPassphrase(
    passphrase,
    summary.crypto.saltBase64
  );

  const content = await readFile(join(sessionDir, TELEMETRY_FILE), "utf8");
  const lines = content.split(/\r?\n/).filter(Boolean).slice(0, limit);

  return lines.map((line) => {
    const envelope = JSON.parse(line) as EncryptedEnvelope;
    return crypto.decryptJson(envelope);
  });
}

async function writeChecksums(sessionDir: string, files: readonly string[]) {
  const rows: string[] = [];
  for (const file of files) {
    const data = await readFile(join(sessionDir, file));
    rows.push(`${createHash("sha256").update(data).digest("hex")}  ${file}`);
  }
  await writeFile(join(sessionDir, CHECKSUM_FILE), rows.join("\n") + "\n", {
    mode: 0o600,
  });
}

async function writeEncryptedJson(path: string, envelope: EncryptedEnvelope) {
  await writeJson(path, envelope, 0o600);
}

async function writeJson(path: string, value: unknown, mode = 0o600) {
  await writeFile(path, JSON.stringify(value, null, 2) + "\n", { mode });
}

async function readJson<T>(path: string) {
  return JSON.parse(await readFile(path, "utf8")) as T;
}

function createSessionId() {
  const now = new Date();
  const date = [
    now.getUTCFullYear(),
    String(now.getUTCMonth() + 1).padStart(2, "0"),
    String(now.getUTCDate()).padStart(2, "0"),
  ].join("");
  return `CAP-${date}-${randomBytes(3).toString("hex").toUpperCase()}`;
}
