import { createHash } from "node:crypto";
import { after, test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { csv, generate, renderHtml, validatePack } from "../../scripts/evidence-pack/generate.mjs";

const fixture = resolve("examples/evidence-pack/synthetic-insurance-intake.json");
const data = JSON.parse(readFileSync(fixture, "utf8"));
const temp = mkdtempSync(join(tmpdir(), "elaris-evidence-pack-"));
after(() => rmSync(temp, { recursive: true, force: true }));

function copy() { return structuredClone(data); }

test("valid fictional input is explicitly synthetic, source-referenced and has UNKNOWN fields", () => {
  assert.equal(validatePack(copy()).mode, "SYNTHETIC");
  assert.equal(data.facts.find((f) => f.label === "Unit serial number").status, "UNKNOWN");
  assert.match(renderHtml(data), /100% SYNTHETIC DEMONSTRATION/);
  assert.match(renderHtml(data), /does not certify robots/);
});

test("REAL records and fake statuses are denied", () => {
  const real = copy();
  real.mode = "REAL";
  assert.throws(() => validatePack(real), /REAL input is disabled/);
  const fake = copy();
  fake.facts[0].status = "OBSERVED";
  assert.throws(() => validatePack(fake), /Invalid fact status/);
});

test("unknown facts cannot carry fabricated values or source references", () => {
  const a = copy();
  const unknown = a.facts.find((f) => f.status === "UNKNOWN");
  unknown.value = "123-REAL-SERIAL";
  assert.throws(() => validatePack(a), /must have null value and sourceId/);
});

test("non-unknown facts require declared source references", () => {
  const a = copy();
  a.facts[0].sourceId = "NONEXISTENT";
  assert.throws(() => validatePack(a), /no declared source/);
  const b = copy();
  b.evidence[0].sourceId = "NONEXISTENT";
  assert.throws(() => validatePack(b), /no declared source/);
});

test("duplicate source IDs are rejected", () => {
  const a = copy();
  a.sources.push({ ...a.sources[0] });
  assert.throws(() => validatePack(a), /Duplicate sources ID/);
});

test("HTML renders all untrusted content escaped", () => {
  const a = copy();
  a.gaps[0].question = '<img src=x onerror=alert("x")>';
  const rendered = renderHtml(a);
  assert.ok(!rendered.includes('<img src=x onerror='));
  assert.ok(rendered.includes("&lt;img src=x onerror="));
});

test("CSV neutralizes formula-leading untrusted content", () => {
  const rendered = csv([["Field", "Value"], ["t", "=HYPERLINK(1)"], ["u", " -SUM(1)"], ["v", "+CMD"]]);
  assert.ok(rendered.includes(`"'=HYPERLINK(1)"`));
  assert.ok(rendered.includes(`"' -SUM(1)"`));
  assert.ok(rendered.includes(`"'+CMD"`));
});

test("offline build emits HTML, CSVs and manifest with the SHA256 of source JSON", async () => {
  const out = join(temp, "demo");
  const result = await generate(fixture, out);
  assert.equal(result.files.length, 6);
  assert.deepEqual(readdirSync(out).sort(), result.files.slice().sort());
  const html = readFileSync(join(out, "report.html"), "utf8");
  assert.ok(html.includes("Aster Robotics M2 (fictional)"));
  assert.ok(html.includes("NOT PROVIDED"));
  const manifest = JSON.parse(readFileSync(join(out, "manifest.json"), "utf8"));
  assert.equal(manifest.status, "SYNTHETIC_DEMO_ONLY");
  assert.equal(manifest.sourceInputSha256.length, 64);
  assert.ok(manifest.nonClaims.includes("NO_INSURANCE_DECISION"));
  for (const [name, expectedDigest] of Object.entries(manifest.outputSha256)) {
    const actual = createHash("sha256").update(readFileSync(join(out, name))).digest("hex");
    assert.equal(actual, expectedDigest, `Output hash mismatch: ${name}`);
  }
  assert.equal(Object.keys(manifest.outputSha256).length, 5);
  assert.ok(html.includes('aria-label="Documentary overview"'));
  assert.ok(html.includes("Missing evidence entries"));
  assert.ok(html.includes('<h2 class="report-section-next-page">03 / Information gaps'));
  assert.ok(html.includes(".report-section-next-page{break-before:page;page-break-before:always}"));
  await assert.rejects(() => generate(fixture, out), /report.html already exists/);
});

test("no output is written when validation fails", async () => {
  const bad = copy();
  bad.mode = "REAL";
  const input = join(temp, "real.json");
  const { writeFileSync, existsSync } = await import("node:fs");
  writeFileSync(input, JSON.stringify(bad));
  const dest = join(temp, "rejected");
  await assert.rejects(() => generate(input, dest), /REAL input is disabled/);
  assert.equal(existsSync(dest), false);
});
