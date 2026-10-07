import { createHash } from "node:crypto";
import {
  lstat,
  readdir,
  readFile,
  realpath,
  stat,
} from "node:fs/promises";
import { homedir } from "node:os";
import { basename, isAbsolute, join, relative, resolve, sep } from "node:path";
import type {
  ComponentHealthEvidenceV03,
  PhaseComponentEvidenceV03,
  PhaseEvidenceV03,
  QualityFindingV03,
} from "@/lib/component-health/evidence-engine-v03";

const REPORT_FILENAME = "field-evidence-v03.json";
const DEFAULT_PRIVATE_ROOT = join(homedir(), "elaris-private");
const MAX_DISCOVERY_DEPTH = 5;
const MAX_DISCOVERED_REPORTS = 100;
const MAX_REPORT_BYTES = 32 * 1024 * 1024;

export type WorkbenchArtifact = {
  analysisId: string;
  inputFingerprintPrefix: string;
  reportSha256: string;
  duplicateCopies: number;
  lastModifiedMs: number;
  report: ComponentHealthEvidenceV03;
};

export type WorkbenchCatalogue = {
  sourceMode: "EXPLICIT_REPORT" | "PRIVATE_ROOT";
  root: string;
  activeAnalysisId: string | null;
  analyses: WorkbenchArtifact[];
  warnings: string[];
};

export type QualityFindingGroup = {
  code: QualityFindingV03["code"];
  severity: QualityFindingV03["severity"];
  count: number;
  phaseCount: number;
  componentCount: number;
  signals: string[];
  examples: Array<{
    phaseId: string | null;
    componentId: string | null;
    signal: string | null;
    message: string;
  }>;
};

export async function loadComponentHealthWorkbench(): Promise<WorkbenchCatalogue> {
  const explicitReport = cleanEnv(process.env.ELARIS_COMPONENT_HEALTH_V03_REPORT);
  const configuredRoot = cleanEnv(process.env.ELARIS_COMPONENT_HEALTH_V03_ROOT);
  const activeRequested = cleanEnv(
    process.env.ELARIS_COMPONENT_HEALTH_ACTIVE_ANALYSIS_ID
  );

  const candidateFiles = explicitReport
    ? [resolve(explicitReport)]
    : await discoverV03Reports(
        resolve(configuredRoot ?? DEFAULT_PRIVATE_ROOT)
      );

  const sourceMode = explicitReport ? "EXPLICIT_REPORT" : "PRIVATE_ROOT";
  const root = explicitReport
    ? resolve(explicitReport)
    : resolve(configuredRoot ?? DEFAULT_PRIVATE_ROOT);

  const artifacts = await loadAndDedupeArtifacts(candidateFiles);
  artifacts.sort(
    (a, b) =>
      b.lastModifiedMs - a.lastModifiedMs ||
      a.analysisId.localeCompare(b.analysisId)
  );

  const warnings: string[] = [];
  let activeAnalysisId: string | null = null;

  if (activeRequested) {
    if (artifacts.some((artifact) => artifact.analysisId === activeRequested)) {
      activeAnalysisId = activeRequested;
    } else {
      warnings.push(
        `Requested active analysis ${activeRequested} was not found in the private evidence catalogue.`
      );
    }
  }

  if (!activeAnalysisId && artifacts.length > 0) {
    activeAnalysisId = artifacts[0]!.analysisId;
    if (artifacts.length > 1 && !activeRequested) {
      warnings.push(
        "Multiple V0.3 analyses were discovered; the most recently modified private artifact is active. Set ELARIS_COMPONENT_HEALTH_ACTIVE_ANALYSIS_ID to pin one."
      );
    }
  }

  return {
    sourceMode,
    root,
    activeAnalysisId,
    analyses: artifacts,
    warnings,
  };
}

export async function loadActiveComponentHealthAnalysis() {
  const catalogue = await loadComponentHealthWorkbench();
  if (!catalogue.activeAnalysisId) {
    return { catalogue, artifact: null };
  }

  return {
    catalogue,
    artifact:
      catalogue.analyses.find(
        (analysis) => analysis.analysisId === catalogue.activeAnalysisId
      ) ?? null,
  };
}

export function summarizeQualityFindings(
  findings: readonly QualityFindingV03[]
): QualityFindingGroup[] {
  const groups = new Map<string, {
    code: QualityFindingV03["code"];
    severity: QualityFindingV03["severity"];
    count: number;
    phases: Set<string>;
    components: Set<string>;
    signals: Set<string>;
    examples: QualityFindingGroup["examples"];
  }>();

  for (const finding of findings) {
    const key = `${finding.severity}:${finding.code}`;
    let group = groups.get(key);
    if (!group) {
      group = {
        code: finding.code,
        severity: finding.severity,
        count: 0,
        phases: new Set(),
        components: new Set(),
        signals: new Set(),
        examples: [],
      };
      groups.set(key, group);
    }

    group.count += 1;
    if (finding.phaseId) group.phases.add(finding.phaseId);
    if (finding.componentId) group.components.add(finding.componentId);
    if (finding.signal) group.signals.add(finding.signal);

    if (group.examples.length < 3) {
      group.examples.push({
        phaseId: finding.phaseId ?? null,
        componentId: finding.componentId ?? null,
        signal: finding.signal ?? null,
        message: finding.message,
      });
    }
  }

  return [...groups.values()]
    .map((group) => ({
      code: group.code,
      severity: group.severity,
      count: group.count,
      phaseCount: group.phases.size,
      componentCount: group.components.size,
      signals: [...group.signals].sort(),
      examples: group.examples,
    }))
    .sort(
      (a, b) =>
        severityRank(b.severity) - severityRank(a.severity) ||
        b.count - a.count ||
        a.code.localeCompare(b.code)
    );
}

export function componentSlug(component: {
  oemIndex: number;
  componentName: string;
}) {
  return `joint-${String(component.oemIndex).padStart(2, "0")}-${slugify(
    component.componentName
  )}`;
}

export function findComponentBySlug(
  report: ComponentHealthEvidenceV03,
  slug: string
): PhaseComponentEvidenceV03 | null {
  const reference =
    report.phases.find((phase) => phase.phaseId === report.reference.phaseId) ??
    report.phases[0];

  return (
    reference?.components.find(
      (component) =>
        componentSlug(component) === slug || component.componentId === slug
    ) ?? null
  );
}

export function findPhase(
  report: ComponentHealthEvidenceV03,
  phaseId: string
): PhaseEvidenceV03 | null {
  return report.phases.find((phase) => phase.phaseId === phaseId) ?? null;
}

export function componentGroup(componentName: string) {
  const name = componentName.toLowerCase();
  if (
    name.includes("hip") ||
    name.includes("knee") ||
    name.includes("ankle")
  ) {
    return "Lower body";
  }
  if (name.includes("waist")) return "Torso";
  if (
    name.includes("shoulder") ||
    name.includes("elbow") ||
    name.includes("wrist")
  ) {
    return "Upper body";
  }
  return "Other";
}

export function fingerprintPrefix(value: string) {
  return value.slice(0, 16);
}

async function discoverV03Reports(root: string) {
  const rootInfo = await safeStat(root);
  if (!rootInfo?.isDirectory()) return [];

  await assertPrivatePath(root);

  const found: string[] = [];
  await walk(root, 0, found);
  return found.sort();

  async function walk(directory: string, depth: number, out: string[]) {
    if (depth > MAX_DISCOVERY_DEPTH || out.length >= MAX_DISCOVERED_REPORTS) {
      return;
    }

    const entries = await readdir(directory, { withFileTypes: true });
    for (const entry of entries) {
      if (out.length >= MAX_DISCOVERED_REPORTS) return;
      if (entry.name.startsWith(".")) continue;

      const path = join(directory, entry.name);
      if (entry.isSymbolicLink()) continue;
      if (entry.isFile() && entry.name === REPORT_FILENAME) {
        out.push(path);
        continue;
      }
      if (entry.isDirectory()) {
        await walk(path, depth + 1, out);
      }
    }
  }
}

async function loadAndDedupeArtifacts(paths: string[]) {
  const byAnalysisId = new Map<string, WorkbenchArtifact>();

  for (const path of paths) {
    const artifact = await loadArtifact(path);
    const existing = byAnalysisId.get(artifact.analysisId);

    if (!existing) {
      byAnalysisId.set(artifact.analysisId, artifact);
      continue;
    }

    if (existing.reportSha256 !== artifact.reportSha256) {
      throw new Error(
        `Conflicting private V0.3 artifacts share analysisId ${artifact.analysisId} but have different report SHA-256 values.`
      );
    }

    existing.duplicateCopies += 1;
    existing.lastModifiedMs = Math.max(
      existing.lastModifiedMs,
      artifact.lastModifiedMs
    );
  }

  return [...byAnalysisId.values()];
}

async function loadArtifact(path: string): Promise<WorkbenchArtifact> {
  const absolute = resolve(path);
  await assertPrivatePath(absolute);

  if (basename(absolute) !== REPORT_FILENAME) {
    throw new Error(
      `Component Health Workbench only accepts ${REPORT_FILENAME} artifacts.`
    );
  }

  const info = await stat(absolute);
  if (!info.isFile()) {
    throw new Error(`Evidence artifact is not a file: ${absolute}`);
  }
  if (info.size > MAX_REPORT_BYTES) {
    throw new Error(
      `Evidence artifact exceeds ${MAX_REPORT_BYTES} bytes: ${absolute}`
    );
  }

  const payload = await readFile(absolute, "utf8");
  const parsed = JSON.parse(payload) as unknown;
  assertV03Report(parsed);

  return {
    analysisId: parsed.run.analysisId,
    inputFingerprintPrefix: fingerprintPrefix(parsed.run.inputFingerprint),
    reportSha256: createHash("sha256").update(payload).digest("hex"),
    duplicateCopies: 1,
    lastModifiedMs: info.mtimeMs,
    report: parsed,
  };
}

function assertV03Report(
  value: unknown
): asserts value is ComponentHealthEvidenceV03 {
  if (!value || typeof value !== "object") {
    throw new Error("Invalid Component Health V0.3 artifact: expected object.");
  }

  const report = value as Partial<ComponentHealthEvidenceV03>;
  if (report.schemaVersion !== "0.3.0") {
    throw new Error(
      `Unsupported Component Health evidence schema: ${String(
        report.schemaVersion
      )}`
    );
  }
  if (report.evidenceClass !== "OBSERVED") {
    throw new Error("Workbench only accepts OBSERVED Component Health evidence.");
  }
  if (report.sourceClassification !== "SENSITIVE") {
    throw new Error(
      "Workbench V0.4 currently requires SENSITIVE private evidence semantics."
    );
  }
  if (!report.run || typeof report.run.analysisId !== "string") {
    throw new Error("V0.3 artifact is missing run.analysisId.");
  }
  if (typeof report.run.inputFingerprint !== "string") {
    throw new Error("V0.3 artifact is missing run.inputFingerprint.");
  }
  if (!report.reference || report.reference.rule !== "SAME_SESSION_IDLE_PRIMARY") {
    throw new Error(
      "V0.4 requires V0.3 SAME_SESSION_IDLE_PRIMARY evidence."
    );
  }
  if (!Array.isArray(report.phases) || report.phases.length === 0) {
    throw new Error("V0.3 artifact contains no phases.");
  }
  if (!report.quality || !Array.isArray(report.quality.findings)) {
    throw new Error("V0.3 artifact is missing quality findings.");
  }

  for (const phase of report.phases) {
    if (!Array.isArray(phase.components) || phase.components.length !== 29) {
      throw new Error(
        `V0.4 expected 29 component slots in phase ${phase.phaseId}; got ${phase.components?.length ?? "missing"}.`
      );
    }
  }
}

async function assertPrivatePath(path: string) {
  const repoRoot = await realpath(resolve(process.cwd())).catch(() =>
    resolve(process.cwd())
  );
  const target = await realpath(path).catch(() => resolve(path));

  if (isInside(repoRoot, target) || target === repoRoot) {
    throw new Error(
      "Refusing to load SENSITIVE Component Health evidence from inside the Git working tree."
    );
  }

  const targetInfo = await lstat(target).catch(() => null);
  if (targetInfo?.isSymbolicLink()) {
    throw new Error("Refusing to load Component Health evidence through a symlink.");
  }
}

function isInside(parent: string, child: string) {
  const rel = relative(parent, child);
  return (
    rel !== "" &&
    rel !== ".." &&
    !rel.startsWith(".." + sep) &&
    !isAbsolute(rel)
  );
}

async function safeStat(path: string) {
  try {
    return await stat(path);
  } catch {
    return null;
  }
}

function cleanEnv(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function severityRank(severity: QualityFindingV03["severity"]) {
  return severity === "WARNING" ? 2 : 1;
}
