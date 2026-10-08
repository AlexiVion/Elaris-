import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const SCHEMA = "elaris-evidence-pack/v0";
const STATUSES = new Set(["SYNTHETIC", "UNKNOWN"]);
const PRIORITIES = new Set(["HIGH", "MEDIUM", "LOW"]);
const QUESTION_STATUSES = new Set(["OPEN", "ANSWERED"]);

function fail(message) {
  throw new Error(`Evidence Pack V0: ${message}`);
}

function nonEmpty(value, name) {
  if (typeof value !== "string" || !value.trim() || value.length > 5000) {
    fail(`${name} must be a non-empty string of at most 5000 characters`);
  }
  return value.trim();
}

function array(value, name, max = 100) {
  if (!Array.isArray(value) || value.length > max) fail(`${name} must be an array (max ${max})`);
  return value;
}

function unique(items, name) {
  const ids = new Set();
  for (const item of items) {
    if (!item || typeof item !== "object" || Array.isArray(item)) fail(`Invalid entry in ${name}`);
    nonEmpty(item.id, `${name}.id`);
    if (!/^[A-Za-z0-9_-]{2,60}$/.test(item.id)) fail(`${name}.id must be 2-60 letters, digits, _ or -`);
    if (ids.has(item.id)) fail(`Duplicate ${name} ID: ${item.id}`);
    ids.add(item.id);
  }
  return ids;
}

export function validatePack(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) fail("input must be a JSON object");
  if (data.schemaVersion !== SCHEMA) fail(`schemaVersion must be ${SCHEMA}`);
  // A deliberately narrow first release. Real submissions require rights, review,
  // secure handling and a separately approved workflow: not a CLI flag.
  if (data.mode !== "SYNTHETIC") fail("REAL input is disabled in V0; only SYNTHETIC demo input is allowed");
  for (const key of ["caseId", "subject", "preparedFor", "purpose", "scope"]) {
    nonEmpty(data[key], key);
  }
  if (data.purpose !== "TECHNICAL_EVIDENCE_PREPARATION") {
    fail("purpose must be TECHNICAL_EVIDENCE_PREPARATION");
  }
  const sources = array(data.sources, "sources", 50);
  const facts = array(data.facts, "facts", 100);
  const evidence = array(data.evidence, "evidence", 100);
  const gaps = array(data.gaps, "gaps", 100);
  const sourceIds = unique(sources, "sources");
  unique(facts, "facts");
  unique(evidence, "evidence");
  unique(gaps, "gaps");
  for (const s of sources) {
    nonEmpty(s.title, `sources.${s.id}.title`);
    nonEmpty(s.custodian, `sources.${s.id}.custodian`);
    if (s.kind !== "SYNTHETIC_DOCUMENT") fail(`Source ${s.id} is not explicitly synthetic`);
  }
  const checkSource = (row, name) => {
    if (!sourceIds.has(row.sourceId)) fail(`${name}.${row.id} has no declared source`);
  };
  for (const fact of facts) {
    nonEmpty(fact.label, `facts.${fact.id}.label`);
    if (!STATUSES.has(fact.status)) fail(`Invalid fact status: ${fact.id}`);
    if (fact.status === "UNKNOWN") {
      if (fact.value !== null || fact.sourceId !== null) {
        fail(`UNKNOWN fact ${fact.id} must have null value and sourceId`);
      }
    } else {
      nonEmpty(fact.value, `facts.${fact.id}.value`);
      checkSource(fact, "facts");
    }
  }
  for (const item of evidence) {
    nonEmpty(item.title, `evidence.${item.id}.title`);
    nonEmpty(item.category, `evidence.${item.id}.category`);
    if (!STATUSES.has(item.status)) fail(`Invalid evidence status: ${item.id}`);
    if (item.status === "UNKNOWN") {
      if (item.sourceId !== null) fail(`UNKNOWN evidence ${item.id} must have null sourceId`);
    } else checkSource(item, "evidence");
    if (item.notes !== undefined && item.notes !== null && typeof item.notes !== "string") {
      fail(`evidence.${item.id}.notes must be text`);
    }
  }
  for (const q of gaps) {
    nonEmpty(q.question, `gaps.${q.id}.question`);
    nonEmpty(q.requestedFrom, `gaps.${q.id}.requestedFrom`);
    if (!PRIORITIES.has(q.priority)) fail(`Invalid documentary priority on gap ${q.id}`);
    if (!QUESTION_STATUSES.has(q.status)) fail(`Invalid gap status on ${q.id}`);
  }
  if (facts.length === 0) fail("at least one field is required");
  if (gaps.length === 0) fail("at least one open question is required");
  return data;
}

export function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]
  );
}

function cell(value) {
  return `<td>${escapeHtml(value ?? "Not provided")}</td>`;
}

function table(columns, rows) {
  return `<div class="table-wrap"><table><thead><tr>${columns.map((c) => `<th>${escapeHtml(c)}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map(cell).join("")}</tr>`).join("")}</tbody></table></div>`;
}

export function csv(rows) {
  return rows.map((row) => row.map((value) => {
    let text = String(value ?? "");
    // Excel and similar spreadsheet apps can evaluate attacker-controlled
    // formula strings even inside quotes. Always neutralize on export.
    if (/^\s*[=+@-]/.test(text) || /^[\t\r\n]/.test(text)) text = "'" + text;
    return '"' + text.replace(/"/g, '""') + '"';
  }).join(",")).join("\r\n") + "\r\n";
}

export function renderHtml(data) {
  const fields = table(["Field", "Value", "Class", "Source"], data.facts.map((x) => [
    x.label, x.value ?? "NOT PROVIDED", x.status, x.sourceId ?? "—"
  ]));
  const inventory = table(["Evidence", "Category", "Class", "Source", "Notes"], data.evidence.map((x) => [
    x.title, x.category, x.status, x.sourceId ?? "—", x.notes ?? ""
  ]));
  const questions = table(["ID", "Open question", "Owner", "Priority", "Status"], data.gaps.map((x) => [
    x.id, x.question, x.requestedFrom, x.priority, x.status
  ]));
  const sources = table(["Source", "Description", "Custodian", "Class"], data.sources.map((x) => [
    x.id, x.title, x.custodian, x.kind
  ]));
  const e = escapeHtml;
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${e(data.caseId)} | Elaris Technical Evidence Pack</title>
<style>
:root{color-scheme:light}*{box-sizing:border-box}
body{margin:0;background:#edf2f8;color:#16304a;font:14px/1.55 Arial,Helvetica,sans-serif}
.page{max-width:980px;margin:32px auto;background:white;padding:42px 48px;box-shadow:0 8px 28px #11264118}
header{border-bottom:4px solid #1c6fe7;padding-bottom:24px;margin-bottom:28px}
.kicker{text-transform:uppercase;letter-spacing:.13em;color:#397ab8;font-size:11px;font-weight:bold}
h1{font-size:32px;line-height:1.14;letter-spacing:-.04em;margin:10px 0;color:#122d4d}
h2{font-size:19px;margin:30px 0 12px;color:#12365e;page-break-after:avoid}
.subtitle{color:#4c637d;font-size:15px;max-width:660px}
.badge{display:inline-block;border-radius:6px;background:#fff2ca;color:#7a5500;border:1px solid #f0d67c;font-size:11px;font-weight:bold;letter-spacing:.08em;padding:7px 11px;margin:14px 0}
.metadata{display:grid;grid-template-columns:1fr 1fr;gap:14px 24px;padding:20px;background:#f4f8ff;border-radius:8px}
dt{font-size:10px;color:#5a7896;text-transform:uppercase;letter-spacing:.08em}dd{margin:3px 0 0;font-weight:600;overflow-wrap:anywhere}
.lead{background:#edf5ff;border-left:4px solid #1c6fe7;padding:13px 16px;border-radius:0 6px 6px 0}
.table-wrap{overflow:visible}table{width:100%;border-collapse:collapse;table-layout:fixed;font-size:11px}
td,th{padding:10px 8px;text-align:left;vertical-align:top;overflow-wrap:anywhere;border-bottom:1px solid #e1e9f0}
th{background:#eaf1fb;color:#174a78;font-size:10px;text-transform:uppercase}
tbody tr:nth-child(even){background:#f8fbff}
.warning{border:1px solid #f0d67c;background:#fff9e8;padding:14px;margin-top:26px;border-radius:7px}
.small{color:#5b6c7c;font-size:11px}
footer{border-top:1px solid #d9e5f0;margin-top:40px;padding-top:16px;font-size:11px;color:#657c93}
@page{size:A4;margin:16mm}
@media print{body{background:white}.page{padding:0;box-shadow:none;margin:0;max-width:none}
h2{page-break-after:avoid}tr{break-inside:avoid}.metadata{break-inside:avoid}
header{page-break-inside:avoid}footer{font-size:9px}}
</style></head><body><main class="page">
<header><div class="kicker">ELARIS  /  TECHNICAL EVIDENCE SERVICES</div>
<h1>Physical AI<br>Technical Evidence Pack</h1>
<div class="subtitle">Structured technical facts, document references and open questions. Independent of insurance underwriting decisions.</div>
<div class="badge">100% SYNTHETIC DEMONSTRATION — NOT A REAL ROBOT OR INSURANCE SUBMISSION</div>
</header>
<dl class="metadata">
<div><dt>Case reference</dt><dd>${e(data.caseId)}</dd></div>
<div><dt>Prepared for</dt><dd>${e(data.preparedFor)}</dd></div>
<div><dt>System subject</dt><dd>${e(data.subject)}</dd></div>
<div><dt>Purpose</dt><dd>Technical evidence preparation — demonstration</dd></div>
<div style="grid-column:1/-1"><dt>Declared scope</dt><dd>${e(data.scope)}</dd></div>
</dl>
<h2>01 / System and deployment facts</h2><p class="small">Unknown means not provided; synthetic values do not represent field observations.</p>${fields}
<h2>02 / Evidence inventory</h2><p class="small">A synthetic evidence item illustrates a document category; it does not prove a test occurred.</p>${inventory}
<h2>03 / Information gaps and reviewer questions</h2><p class="small">Priorities are documentary follow-up only, not physical risk or actuarial severity.</p>${questions}
<h2>04 / Source and provenance register</h2>${sources}
<section class="warning"><strong>Authority and validity limitations.</strong> This pack contains fictional demonstration data. Elaris does not certify robots, approve operations, estimate premiums, calculate insurability or decide insurance coverage. No PAIDS compliance or forensic chain of custody is claimed. A responsible human must validate a future real dossier and the right to disclose every source.</section>
<footer>Elaris · Draft service format V0 · For commercial illustration only · Never use as an actual insurance submission.</footer>
</main></body></html>`;
}

function csvExports(data) {
  return {
    "facts_registry.csv": csv([
      ["Fact ID", "Field", "Value", "Class", "Source"],
      ...data.facts.map((x) => [x.id, x.label, x.value ?? "NOT PROVIDED", x.status, x.sourceId ?? ""])
    ]),
    "evidence_inventory.csv": csv([
      ["Evidence ID", "Title", "Category", "Class", "Source", "Notes"],
      ...data.evidence.map((x) => [x.id, x.title, x.category, x.status, x.sourceId ?? "", x.notes ?? ""])
    ]),
    "open_questions.csv": csv([
      ["Question ID", "Question", "Requested From", "Documentary Priority", "Status"],
      ...data.gaps.map((x) => [x.id, x.question, x.requestedFrom, x.priority, x.status])
    ]),
    "sources.csv": csv([
      ["Source ID", "Title", "Custodian", "Kind"],
      ...data.sources.map((x) => [x.id, x.title, x.custodian, x.kind])
    ])
  };
}

export async function generate(inputPath, outputPath, { pdf = false, overwrite = false } = {}) {
  const raw = readFileSync(inputPath);
  const data = validatePack(JSON.parse(raw.toString("utf8")));
  const out = resolve(outputPath);
  const exports = {
    "report.html": renderHtml(data),
    ...csvExports(data)
  };
  const proposed = Object.keys(exports).concat(["manifest.json"], pdf ? ["report.pdf"] : []);
  for (const name of proposed) {
    if (!overwrite && existsSync(resolve(out, name))) fail(`${name} already exists in ${out}; choose another --out or --overwrite`);
  }
  mkdirSync(out, { recursive: true });
  for (const [name, content] of Object.entries(exports)) writeFileSync(resolve(out, name), content, { encoding: "utf8", flag: overwrite ? "w" : "wx" });
  const manifest = {
    schemaVersion: SCHEMA,
    status: "SYNTHETIC_DEMO_ONLY",
    caseId: data.caseId,
    sourceInputSha256: createHash("sha256").update(raw).digest("hex"),
    files: proposed,
    generatedAt: new Date().toISOString(),
    nonClaims: ["NO_INSURANCE_DECISION", "NO_SAFETY_CERTIFICATION", "NO_FIELD_VALIDATION", "NO_PAIDS_COMPLIANCE"]
  };
  writeFileSync(resolve(out, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n", { flag: overwrite ? "w" : "wx" });
  if (pdf) {
    // Existing dev dependency. No external service, uploads or HTTP requests.
    const { chromium } = await import("@playwright/test");
    const browser = await chromium.launch({ headless: true });
    try {
      const page = await browser.newPage();
      await page.setContent(exports["report.html"], { waitUntil: "load" });
      await page.pdf({ path: resolve(out, "report.pdf"), format: "A4", printBackground: true, preferCSSPageSize: true });
    } finally {
      await browser.close();
    }
  }
  return { out, files: proposed, manifest };
}

function usage() {
  return "Usage: node scripts/evidence-pack/generate.mjs --input path.json --out output-dir [--pdf] [--overwrite]";
}

async function main(args) {
  let input = null;
  let out = null;
  let pdf = false;
  let overwrite = false;
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--input") input = args[++i];
    else if (arg === "--out") out = args[++i];
    else if (arg === "--pdf") pdf = true;
    else if (arg === "--overwrite") overwrite = true;
    else if (arg === "--help") { console.log(usage()); return; }
    else fail(`Unknown argument: ${arg}`);
  }
  if (!input || !out || input.startsWith("--") || out.startsWith("--")) fail(usage());
  const result = await generate(resolve(input), resolve(out), { pdf, overwrite });
  console.log(`ELARIS EVIDENCE PACK V0 / SYNTHETIC DEMO\nOutput: ${result.out}\nFiles:\n${result.files.map((x) => "  " + x).join("\n")}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main(process.argv.slice(2)).catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
