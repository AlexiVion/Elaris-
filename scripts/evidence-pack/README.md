# Elaris — Offline Technical Evidence Pack V0

**Status:** `IMPLEMENTED_PENDING_LOCAL_VERIFICATION`.  
**Owner:** Alexi (technical); **commercial reviewer:** Juanma.  
**Task:** `BOOP-T01/T02-V0` in [research backlog](../../docs/research/boop-2026/execution-and-decision-log.md). GitHub Issues are disabled in this repository (HTTP 410), so this is the versioned task record.  
**Strategy:** [Boop benchmark](../../docs/research/boop-2026/README.md) and [horizontal Elaris vision](../../docs/company/long-term-vision-industrial-intelligence.md).

## Purpose
Create a presentable **synthetic** example of the technical report that Elaris could prepare for integrators, deployers and brokers. Uses Node.js and optionally the existing `@playwright/test` Chromium dependency. **No server, database, external LLM/API, insurance integration, RDR, real robot access or subscriptions** are needed.

The input is an explicitly synthetic JSON with one robot/site, structured facts, evidence categories, declared source references and documentary follow-up questions. The generator deliberately refuses `mode: REAL` until there is a separate approved real-client intake workflow with permission and review controls.

## Run from repository root
```bash
node scripts/evidence-pack/generate.mjs \
  --input examples/evidence-pack/synthetic-insurance-intake.json \
  --out out/elaris-evidence-demo
```

Outputs:
- `report.html` — printable evidence dossier with SYNTHETIC watermark, source register and disclaimer;
- `facts_registry.csv` — source-referenced facts with explicit UNKNOWN;
- `evidence_inventory.csv` — example evidence classes, not test results;
- `open_questions.csv` — gaps and required reviewers;
- `sources.csv` — source IDs, custodians and types;
- `manifest.json` — fixture input SHA-256, generated time and non-claims.

To generate a **PDF in addition** (Chromium browser installed):
```bash
node scripts/evidence-pack/generate.mjs \
  --input examples/evidence-pack/synthetic-insurance-intake.json \
  --out out/elaris-evidence-demo-pdf --pdf
```

If Chromium is missing, install the existing project browser using `pnpm exec playwright install chromium` (may download browser binaries); otherwise use `report.html` and Print to PDF manually. No third-party web service is used for rendering. Never publicly host or attach real client evidence to a demo.

`--overwrite` permits replacing the generator's own named output files in an existing destination. Without it, reruns fail rather than silently overwrite previous deliverables.

## Verification
```bash
node --test tests/evidence-pack/pack.test.mjs
node --check scripts/evidence-pack/generate.mjs
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

**Note:** these checks were **not run** by GitHub connector. On a local machine, keep the database/test environment safe; this CLI itself is independent of Prisma, SQLite and the unresolved DC051 gate.

## Built-in fail-closed design
1. Only `schemaVersion: elaris-evidence-pack/v0` and `mode: SYNTHETIC` are supported.
2. Every synthetic fact and listed synthetic document references a declared synthetic source; UNKNOWN carries `null` value/source.
3. HTML escapes all string inputs; CSV neutralizes formula-leading spreadsheet text.
4. A case cannot be emitted without at least one fact and one review question.
5. Manifest fingerprints original JSON; **does not** imply a signed or forensically valid chain of custody.
6. Report states that Elaris is not a safety certifier, insurance advisor/MGA/insurer, PAIDS validator or actuarial rating engine.
7. The demonstration is **not** the Humandroid G1 or Universidad Siglo 21.

## Next engineering gates — do not implement until confirmed
- `BOOP-T03` technical/human quality-review time, PDF visual check and acceptance with Juanma.
- `BOOP-C03/C04` real broker/integrator interview and one paying buyer, owned by Juanma.
- A reviewed `REAL` intake contract (permissions, confidentiality, scope, export recipients, secure storage/deletion, sources and signatures). **Not merely removing the synthetic flag**.
- Future integration with Deployment Control and Component Health only after stable, authorized source contracts; avoid creating insurance-specific copies of technical truth.

## Quality gate
Juanma should be able to show this package to a prospect to explain **what work Elaris performs**, while plainly stating it is fictional. A user must never be able to mistake this document for a licensed insurer's underwriting opinion or a certified physical robot test.
