# Elaris — Offline Technical Evidence Pack V0

**Status:** `FULL_LOCAL_GATE_PASS / VISUAL_AND_COMMERCIAL_REVIEW_PENDING` (2026-10-09).  
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
- `manifest.json` — input JSON SHA-256, **SHA-256 for every generated output** (excluding the manifest itself), generated time and non-claims. Digests help transfer-integrity checks; they are not cryptographic signatures or forensics proof.

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

## PDF layout and demonstration QA

- The generator includes a **documentary overview** counting synthetic examples, unknown fields, missing evidence entries, and open follow-up questions. These are not risk scores or insurance metrics.
- PDF print CSS was made more compact after an independent visual inspection of V0, in which the 3-page output showed an awkward table split and excessive whitespace on page 3.
- **The compact print revision has not yet been re-rendered in the user WSL environment.** Re-run the `--pdf` command into a fresh output path, inspect PDF page count, wrapping, clipping, legends, limits and source table; record visual findings in PR #25.
- Previous rendered PDF shows that Chromium export works, but the revised layout must be reviewed separately.

## Registro de la verificación local V0.1

El 2026-10-09, Alexi ejecutó el gate en WSL sobre la revisión `0c61ea5`: **9/9 Node tests, PDF generado, `pnpm lint` PASS y `pnpm typecheck` PASS**. Registro formal: [local gate](../../docs/research/boop-2026/evidence-pack-v01-local-verification-2026-10-09.md). Los controles generales `pnpm test` y `pnpm build` PASARON mediante el gate aislado el 2026-10-09; sigue pendiente inspección visual del PDF actualizado y validación comercial.

## Full repository build verification without touching prisma/dev.db

The first `pnpm build` attempt on this new WSL worktree failed with Prisma `P2021` (missing SQLite tables during Next.js prerender), because the database used for prerender was not migrated and seeded. This is **not evidence of an Evidence Pack generator failure**.

**Never fix this using `pnpm db:reset` or `pnpm db:seed` against your normal `prisma/dev.db`**. The seed deletes and recreates demo rows. The dedicated gate uses a uniquely named throwaway SQLite file and copies it into another uniquely named DB for action integration tests.

```bash
git pull --ff-only
bash scripts/ci/verify-evidence-pack-v01.sh
```

This gate runs Prisma Client generation, migrations/status, seed on the isolated DB, 9 component tests, lint, typecheck, full Vitest, and Next.js build. It cleans up the specifically generated temporary DBs on exit and prints PASS only if all stages succeed. It **passed in Ubuntu WSL** on 2026-10-09 (log `~/elaris-evidence-gate-20261009-170003.log`). The gate does not leave behind a running server or seeded persistent database.

[Build failure, root-cause and isolated gate record](../../docs/research/boop-2026/evidence-pack-v01-build-gate-2026-10-09.md).

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
