import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { chmodSync, existsSync, lstatSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";

const REQUIRED_PACK_FILES = Object.freeze([
  "field-evidence-v03.json",
  "field-evidence-v03.md",
  "analysis-run.json",
  "quality-v03.json",
  "phase-manifest.json",
]);
const REPORT_NAME = "field-evidence-v03.json";
const ROOT = resolve(homedir(), "elaris-private");
const MAX_FILE_BYTES = 32 * 1024 * 1024;

const die = (message) => { throw new Error("Elaris G1 private field draft: " + message); };
const sha256 = (data) => createHash("sha256").update(data).digest("hex");
const htmlEscape = (v) => String(v ?? "").replace(/[&<>"']/g, (x) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[x]
);
const plain = (v) => typeof v === "string" && v.trim().length > 0 && v.length <= 2000;
const integer = (v) => Number.isInteger(v) && v >= 0;
const isIn = (parent, child) => {
  const rel = relative(parent, child);
  return rel === "" || (rel !== ".." && !rel.startsWith(".." + sep) && !isAbsolute(rel));
};

function privateRoot() {
  if (!existsSync(ROOT)) die("Private root does not exist. Use a local authorized $HOME/elaris-private.");
  if (lstatSync(ROOT).isSymbolicLink()) die("Private root cannot be a symlink");
  const root = realpathSync(ROOT);
  if (!isIn(realpathSync(homedir()), root)) die("Private root must be under local home");
  return root;
}

// Reject symlinks in every path component, not only the final file.
function checkPathNoSymlink(path) {
  let part = resolve(path);
  while (existsSync(part)) {
    if (lstatSync(part).isSymbolicLink()) die("Symbolic link in sensitive path");
    const parent = dirname(part);
    if (parent === part) break;
    part = parent;
  }
}
function privateExisting(path, root, kind = "file") {
  if (!isAbsolute(path)) die("Require absolute private path");
  const candidate = resolve(path);
  if (!isIn(root, candidate) || (candidate === root && kind !== "directory")) die("Input must be inside $HOME/elaris-private");
  checkPathNoSymlink(candidate);
  const canon = realpathSync(candidate);
  if (!isIn(root, canon)) die("Private path escapes root");
  const stat = lstatSync(canon);
  if (kind === "file" && !stat.isFile()) die("Expected regular private file");
  if (kind === "directory" && !stat.isDirectory()) die("Expected private directory");
  if (stat.isFile() && stat.size > MAX_FILE_BYTES) die("Input file exceeds 32MB limit");
  return canon;
}

export function parseChecksumRegistry(registry) {
  if (typeof registry !== "string" || registry.length > 100_000) die("Invalid checksum registry");
  const map = new Map();
  for (const raw of registry.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    const match = /^([0-9a-fA-F]{64})\s+(.+)$/.exec(line);
    if (!match) die("Malformed checksums.sha256 row");
    const name = match[2].trim();
    if (name !== basename(name) || name.includes("/") || name.includes("\\") || name === "." || name === "..") {
      die("Unsafe checksum registry filename");
    }
    if (map.has(name)) die("Duplicate file in registry");
    map.set(name, match[1].toLowerCase());
  }
  for (const name of REQUIRED_PACK_FILES) {
    if (!map.has(name)) die("Missing required checksum for " + name);
  }
  return map;
}

export function validateV03(a) {
  if (!a || typeof a !== "object") die("V0.3 report is not an object");
  if (a.schemaVersion !== "0.3.0" || a.evidenceClass !== "OBSERVED" ||
      a.sourceClassification !== "SENSITIVE" || a.assessment !== "DESCRIPTIVE_OPERATIONAL_EVIDENCE") {
    die("Unsupported or improperly classified V0.3 report");
  }
  if (a.robot?.manufacturer !== "Unitree" || a.robot?.model !== "G1" || a.robot?.componentSlots !== 29) {
    die("Only Unitree G1 V0.3/29-slot reports supported");
  }
  if (!a.run || !plain(a.run.analysisId) || !/^[a-f0-9]{64}$/i.test(a.run.inputFingerprint ?? "")) {
    die("Invalid deterministic analysis identity/fingerprint");
  }
  if (a.reference?.rule !== "SAME_SESSION_IDLE_PRIMARY" ||
      a.reference?.historicalBaselineRole !== "SECONDARY_CONTEXT_ONLY") {
    die("Same-session idle reference and secondary historical baseline required");
  }
  for (const lineage of [a.run.inputs?.observed, a.run.inputs?.historicalBaseline]) {
    if (!lineage || lineage.sourceIntegrity?.verified !== true || lineage.workingCopyIntegrity?.verified !== true) {
      die("Unverified source/working copy lineage");
    }
  }
  if (!Array.isArray(a.phases) || a.phases.length === 0 || a.phases.length > 40 ||
      !a.phases.some((p) => p.phaseId === "IDLE_BASELINE")) {
    die("Phase list/IDLE_BASELINE invalid");
  }
  const phaseIds = new Set();
  for (const p of a.phases) {
    if (!plain(p.phaseId) || phaseIds.has(p.phaseId) || !plain(p.label)) die("Invalid/duplicate phase");
    phaseIds.add(p.phaseId);
    if (p.contextEvidenceClass !== "HUMAN_CONFIRMED" ||
        p.componentSlots !== 29 || !Array.isArray(p.components) || p.components.length !== 29 ||
        !integer(p.frameCount) || !integer(p.observedComponentCount) || p.observedComponentCount > 29) {
      die("Inconsistent 29-slot phase evidence");
    }
    for (const field of ["observedTelemetryStart", "observedTelemetryEnd"]) {
      if (p[field] !== null && (typeof p[field] !== "string" || !Number.isFinite(Date.parse(p[field])))) {
        die("Invalid observed telemetry timestamp");
      }
    }
  }
  if (!Array.isArray(a.quality?.findings) || a.quality.findings.length > 200_000 ||
      !Array.isArray(a.quality?.phaseQuality)) die("Malformed quality summary");
  if (typeof a.quality.maxCoverage !== "number" || !Number.isFinite(a.quality.maxCoverage) ||
      a.quality.maxCoverage < 0 || a.quality.maxCoverage > 1 + 1e-9) die("Invalid signal coverage");
  if (!Array.isArray(a.limitations)) die("Missing interpretation limits");
  return a;
}

export function summarizeV03(a, sourceDigest) {
  const report = validateV03(a);
  const findings = new Map();
  for (const x of report.quality.findings) {
    if (!plain(x.code) || !["INFO", "WARNING"].includes(x.severity)) die("Invalid quality finding code/severity");
    const key = x.severity + ":" + x.code;
    findings.set(key, (findings.get(key) ?? 0) + 1);
  }
  const phases = report.phases.map((p) => ({
    id: p.phaseId, label: p.label, frameCount: p.frameCount,
    observedSlots: p.observedComponentCount,
    missingSlots: 29 - p.observedComponentCount,
    observedStart: p.observedTelemetryStart ?? "NOT OBSERVED",
    observedEnd: p.observedTelemetryEnd ?? "NOT OBSERVED",
    unresolvedSlots: p.components.filter(x => x.slotStatus === "OBSERVED_UNRESOLVED_SLOT").length,
  }));
  return {
    label: "PRIVATE_INTERNAL_DRAFT_NOT_APPROVED_FOR_EXPORT",
    origin: "COMPONENT_HEALTH_V03_PRIVATE_VERIFIED_PACK",
    sourceReportSha256: sourceDigest,
    analysisId: report.run.analysisId,
    inputFingerprintPrefix: report.run.inputFingerprint.slice(0, 12),
    referenceRule: report.reference.rule,
    sourceClassification: report.sourceClassification,
    robot: "Unitree G1",
    phaseCount: phases.length,
    phaseRows: phases,
    qualityFindingCount: report.quality.findings.length,
    qualityTypes: [...findings.entries()].map(([k,v])=>({key:k,count:v})).sort((a,b)=>b.count-a.count || a.key.localeCompare(b.key)),
    limitations: [
      "Internal technical evidence review only; NOT APPROVED FOR EXPORT.",
      "Input source reports observations and human-declared phases. No independent OEM-level validation or calibration is implied.",
      "Quality findings describe data gaps, capture behavior and semantic uncertainties; they are not hardware failures or incidents.",
      "No certification, safety approval, insurance submission, premium estimate, insurability, health diagnosis, PAIDS compliance or chain of custody.",
      "Human confirmation and separate owner approval required before any client-facing report.",
      ...report.limitations.slice(0, 10).filter(plain),
    ],
  };
}

function reportHtml(s, auth) {
  const e = htmlEscape;
  const table = (head, rows) => {
    const tr = (r, tag) => "<tr>" + r.map(x=>"<"+tag+">"+e(x)+"</"+tag+">").join("")+"</tr>";
    return "<table><thead>"+tr(head,"th")+"</thead><tbody>"+rows.map(r=>tr(r,"td")).join("")+"</tbody></table>";
  };
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>Elaris — G1 Field Evidence Internal Draft</title>
<style>
body{font:13px/1.55 Arial,Helvetica,sans-serif;background:#edf3f8;color:#15334d;margin:0}
main{max-width:1000px;background:white;margin:25px auto;padding:35px 45px}
h1{font-size:28px;color:#153354;margin:8px 0} h2{font-size:17px;margin:25px 0 10px;color:#194d80}
strong{color:#0f3154} .warning{background:#fff2cf;color:#6c4d09;padding:14px;border:1px solid #e4c66a}
.metadata{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:13px;background:#eef5fe}
table{width:100%;border-collapse:collapse;table-layout:fixed;font-size:11px} td,th{text-align:left;padding:9px;border-bottom:1px solid #dbe5ef;overflow-wrap:anywhere;vertical-align:top}
th{background:#e7f0fb} tr{break-inside:avoid} p{margin:8px 0} li{margin:8px 0}
.note{font-size:11px;color:#526d82} .banner{font-size:10px;letter-spacing:.08em;font-weight:bold;color:#a14d00}
@page{size:A4;margin:14mm}
@media print{body{background:white;font-size:11px}main{padding:0;margin:0}h2{break-after:avoid}td,th{padding:5px} .warning{break-inside:avoid}}
</style></head><body><main>
<p class="banner">SENSITIVE — PRIVATE INTERNAL DRAFT — NOT APPROVED FOR EXPORT</p>
<h1>Unitree G1 · Technical Field Evidence</h1>
<p>Descriptive evidence from a previously recorded Component Health V0.3 analysis. No robot control or live connection.</p>
<div class="warning"><b>Internal use only.</b> Not a customer-facing insurance or safety report. Data-owner permission is recorded for local preparation only; redistributing this PDF is not approved.</div>
<div class="metadata">
<div><b>Analysis</b><p>${e(s.analysisId)}</p></div>
<div><b>System</b><p>${e(s.robot)} (identity limited to model)</p></div>
<div><b>Engine</b><p>Component Health V0.3 / same-session IDLE reference</p></div>
<div><b>Evidence class</b><p>OBSERVED / SENSITIVE, with HUMAN_CONFIRMED phases</p></div>
<div><b>Local review authorized by</b><p>${e(auth.authorizedBy)}</p></div>
<div><b>Purpose</b><p>Private internal technical preparation only</p></div>
</div>
<h2>01 / Session overview</h2><p>${e(s.phaseCount)} labeled phases. The report preserves observational uncertainties; counts are not a condition rating.</p>
${table(["Phase","Frames","Observed slots / 29","Unresolved slots","Telemetry window (UTC)"],s.phaseRows.map(p=>[
p.id,p.frameCount,String(p.observedSlots)+"/29",p.unresolvedSlots,p.observedStart+" — "+p.observedEnd
]))}
<h2>02 / Data quality and interpretation</h2>
<p><b>${e(s.qualityFindingCount)} descriptive findings</b>. These are quality/semantics items, <b>not robot defects or incidents</b>.</p>
${table(["Finding group","Records"],s.qualityTypes.map(x=>[x.key,x.count]))}
<h2>03 / Provenance</h2>
${table(["Source contract","Recorded value"],[
["Analysis ID",s.analysisId],["Input fingerprint (prefix)",s.inputFingerprintPrefix],
["Source V0.3 JSON SHA-256",s.sourceReportSha256],
["Reference policy",s.referenceRule],["Source data class",s.sourceClassification],
["Export authorization","NOT APPROVED"],
])}
<h2>04 / Limitations and required review</h2>
<ul>${s.limitations.map(x=>"<li>"+e(x)+"</li>").join("")}</ul>
<div class="warning">SENSITIVE — LOCAL INTERNAL DRAFT ONLY. Never send to a broker, insurer, other company, or public platform without separately documented owner approval and human validation.</div>
<p class="note">Elaris | Field evidence draft. No actual insurance coverage/underwriting conclusions.</p>
</main></body></html>`;
}

// This worktree can run without pnpm install: the earlier Evidence Pack V0.1
// worktree already had a verified Playwright/Chromium installation in WSL.
// Only use a dependency from another local worktree if explicitly configured.
// No install, download, remote import, or network call is made here.
export async function resolvePlaywrightChromium({
  moduleRoot = process.env.ELARIS_PLAYWRIGHT_FROM,
  importLocal = () => import("@playwright/test"),
} = {}) {
  try {
    const local = await importLocal();
    if (local?.chromium?.launch) return local.chromium;
  } catch {
    // The current worktree may contain an incomplete node_modules after an
    // ENOMEM during pnpm install. An explicitly selected local copy is allowed.
  }
  if (!moduleRoot || !isAbsolute(moduleRoot)) {
    die("Playwright unavailable. Set ELARIS_PLAYWRIGHT_FROM to the absolute path of an existing, installed local worktree (e.g. Elaris-evidence-pack-v0). Do not run pnpm install again.");
  }
  const base = resolve(moduleRoot);
  const packageFile = join(base, "package.json");
  if (!existsSync(packageFile) || lstatSync(packageFile).isSymbolicLink()) {
    die("Fallback worktree must contain a real package.json");
  }
  const manifest = JSON.parse(readFileSync(packageFile,"utf8"));
  if (manifest.name !== "elaris") {
    die("Fallback worktree is not a verified Elaris package");
  }
  try {
    const fallback = createRequire(packageFile)("@playwright/test");
    if (!fallback?.chromium?.launch) die("Fallback Playwright has no Chromium launcher");
    return fallback.chromium;
  } catch (err) {
    die("Playwright unavailable in the explicitly selected Elaris worktree: " + (err?.code ?? err?.message ?? "unknown"));
  }
}

export function validateAuthorization(auth, sourceDigest) {
  if (!auth || auth.schemaVersion !== "elaris-field-internal-use/v1" ||
      auth.status !== "AUTHORIZED_FOR_LOCAL_INTERNAL_REVIEW" ||
      auth.purpose !== "PREPARE_DESCRIPTIVE_G1_FIELD_DRAFT" ||
      auth.externalSharing !== "PROHIBITED" ||
      !plain(auth.authorizedBy) || !plain(auth.dataOwner) ||
      !plain(auth.recordReference) || !Number.isFinite(Date.parse(auth.authorizedAt)) ||
      auth.sourceReportSha256 !== sourceDigest) {
    die("Missing or invalid explicit data-owner permission for PRIVATE internal review");
  }
  return auth;
}

// Validate the destination *before* creating any output. The direct child
// $HOME/elaris-private/<new-directory> is valid, as is a nested existing
// directory; existing targets, external roots and symlinks fail closed.
export function validatePrivateOutputTarget(out, root) {
  if (typeof out !== "string" || !isAbsolute(out)) die("Output requires absolute path");
  const target = resolve(out);
  if (!isIn(root,target) || target===root || existsSync(target)) {
    die("Output must be a NEW private directory under $HOME/elaris-private");
  }
  const parent = privateExisting(dirname(target),root,"directory");
  checkPathNoSymlink(parent);
  return target;
}

export function inspectPack(reportPath, root) {
  const reportFile = privateExisting(reportPath, root);
  if (basename(reportFile) !== REPORT_NAME) die("Expected field-evidence-v03.json");
  const dir = dirname(reportFile);
  const registryFile = privateExisting(join(dir, "checksums.sha256"), root);
  const registry = parseChecksumRegistry(readFileSync(registryFile,"utf8"));
  for (const [file, digest] of registry) {
    const fullPath = privateExisting(join(dir, file), root);
    if (sha256(readFileSync(fullPath)) !== digest) die("Output checksum mismatch: " + file);
  }
  const source = readFileSync(reportFile);
  const analysis = validateV03(JSON.parse(source.toString("utf8")));
  return { analysis, digest: sha256(source) };
}

function parseArgs(argv) {
  const command = argv[0];
  if (command === "--help") return { command };
  if (!["inspect", "prepare"].includes(command)) die("Usage: inspect --input ABS | prepare --input ABS --authorization ABS --out ABS [--pdf]");
  const options = { command };
  for (let i = 1; i < argv.length; i++) {
    const flag = argv[i];
    if (flag === "--pdf") { if (options.pdf) die("Duplicate --pdf"); options.pdf=true; continue; }
    if (!["--input","--authorization","--out"].includes(flag) || options[flag]) die("Invalid/duplicate flag: " + flag);
    const value = argv[++i];
    if (!value || value.startsWith("--")) die("Flag needs a value: " + flag);
    options[flag] = value;
  }
  if (!options["--input"] || (command==="prepare" && (!options["--authorization"] || !options["--out"]))) {
    die("Missing required flags");
  }
  if (command==="inspect" && (options["--authorization"] || options["--out"] || options.pdf)) die("inspect only accepts --input");
  return options;
}

export async function main(argv) {
  const opts = parseArgs(argv);
  if (opts.command === "--help") {
    console.log("Usage: node scripts/evidence-pack/g1-private-draft.mjs inspect --input /home/USER/elaris-private/.../field-evidence-v03.json");
    console.log("Or: prepare --input ABS --authorization ABS --out NEW_PRIVATE_DIRECTORY [--pdf]");
    return;
  }
  const root = privateRoot();
  const { analysis, digest } = inspectPack(opts["--input"], root);
  const summary = summarizeV03(analysis, digest);
  if (opts.command === "inspect") {
    console.log("ELARIS G1 V0.3 PRIVATE EVIDENCE — VERIFIED PACK");
    console.log("Read-only; source SENSITIVE. ID:", summary.analysisId);
    console.log("Phases:", summary.phaseCount, "Quality records:", summary.qualityFindingCount);
    console.log("NO FILES WRITTEN; EXPORT NOT APPROVED");
    return;
  }
  const authorization = validateAuthorization(JSON.parse(readFileSync(privateExisting(opts["--authorization"],root),"utf8")), digest);
  const target = validatePrivateOutputTarget(opts["--out"], root);
  mkdirSync(target,{mode:0o700});
  const html = reportHtml(summary,authorization);
  const manifest = {
    schemaVersion:"elaris-private-field-draft/v1",
    label:summary.label,
    sourceReportSha256:digest,
    internalAuthorizationRef:authorization.recordReference,
    exportApproval:"NOT_APPROVED",
    outputSha256:{},
    generatedAt:new Date().toISOString(),
  };
  const htmlFile=join(target,"internal-g1-draft.html");
  writeFileSync(htmlFile,html,{flag:"wx",mode:0o600});
  manifest.outputSha256["internal-g1-draft.html"]=sha256(readFileSync(htmlFile));
  if(opts.pdf){
    const chromium=await resolvePlaywrightChromium();
    const browser=await chromium.launch({headless:true});
    try {
      const page=await browser.newPage();
      await page.setContent(html,{waitUntil:"load"});
      await page.pdf({path:join(target,"internal-g1-draft.pdf"),format:"A4",printBackground:true,preferCSSPageSize:true});
    } finally {await browser.close();}
    chmodSync(join(target,"internal-g1-draft.pdf"),0o600);
    manifest.outputSha256["internal-g1-draft.pdf"]=sha256(readFileSync(join(target,"internal-g1-draft.pdf")));
  }
  writeFileSync(join(target,"internal-draft-manifest.json"),JSON.stringify(manifest,null,2)+"\n",{flag:"wx",mode:0o600});
  console.log("PRIVATE DRAFT CREATED (SENSITIVE / NOT APPROVED FOR EXPORT)");
  console.log("Output:",target);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main(process.argv.slice(2)).catch(e=>{console.error(e.message);process.exitCode=1;});
}
