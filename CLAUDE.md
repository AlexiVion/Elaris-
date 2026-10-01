# CLAUDE.md — Elaris (Deployment & Change Evidence)

Guidance for working in this repo. Keep this file updated as phases land.

Elaris connects a Physical AI system's real configuration with the evidence and
approvals that authorize its deployment, and keeps that relationship valid when
the system changes. It is a **layer on top** — not PLM, fleet management, or
observability. No telemetry, battery, or online/offline state. Single-tenant,
local, seed data, one operator. Full spec: `ELARIS_SPEC.md`.

## Commands

```bash
pnpm install         # install deps (runs prisma generate)
pnpm dev             # run the app (http://localhost:3000)
pnpm build           # prisma generate + next build
pnpm lint            # next lint
pnpm typecheck       # tsc --noEmit (strict)
pnpm test            # vitest run (engine unit tests)
pnpm test:watch      # vitest watch
pnpm test:e2e        # playwright smoke tests (Phase 6)
pnpm db:seed         # seed the demo data (prisma/seed.ts)
pnpm db:reset        # migrate reset --force + seed  ← full clean rebuild
pnpm db:push         # push schema without a migration
```

`pnpm install && pnpm db:reset && pnpm dev` brings the app up with the seed and
no external services (acceptance criterion §10).

> Tooling note: `pnpm` is provided via corepack. If it's missing on a fresh
> shell, it lives at `~/.local/node-v22.14.0/bin/pnpm` (symlinked into
> `~/.local/bin`).

## Stack

Next.js 14 (App Router) · TypeScript strict · Tailwind + shadcn-style UI +
lucide-react · Prisma + SQLite (portable to Postgres) · Zod · Server Actions ·
Vitest (domain) · Playwright (smoke). Font: Inter.

## Architecture — where things live

```
app/                routes (RSC). Home, robots, deployments, changes, evidence,
                    requirements, incidents, reports, share/[token]
components/ui/      shadcn-style primitives (Button, Card, …)
components/elaris/  domain components (StatusPill, PageHeader, Sidebar, Topbar,
                    KpiCard, ReadinessBar/Donut, SnapshotTable, BeforeAfterPanel,
                    ImpactTable, AuditTimeline)
lib/domain/         enums (TS unions — single source of truth), types, Zod,
                    json (serialize/parse the JSON-as-String columns)
lib/engine/         *** CORE LOGIC — pure functions, NO DB access ***
                    hash · diff · rules · impact · readiness · coverage
lib/db/             Prisma client + queries (viewer, attention, …)
lib/actions/        Server Actions (validate w/ Zod → engine → db → audit)
lib/copy/           ALL UI text (en.ts) + enum labels/pill tones (labels.ts)
prisma/             schema.prisma, seed.ts, migrations
tests/engine/       Vitest unit tests (incl. the golden test)
tests/e2e/          Playwright smoke tests
```

### The core logic (spec §6) — `lib/engine/`
Deterministic, pure, rule-based, **fully tested, never LLM**:
- `hash.ts` — SHA-256 of canonical config items. Same items → same hash.
- `diff.ts` — Before→After `DiffEntry[]` (ADDED/REMOVED/CHANGED), slot-ordered.
- `rules.ts` — kind→action table + (kind, slot) reason templates + cyber/
  shared-area predicates.
- `impact.ts` — the impact engine → ordered `ImpactResult[]` + `ImpactCounts`.
- `readiness.ts` — 6 categories + whole-deployment %.
- `coverage.ts` — evidence coverage. `round.ts` — standard percentage rounding.

Tests: `tests/engine/*.test.ts` (52 tests) with the shared golden fixture in
`tests/engine/fixtures.ts`. `golden.test.ts` asserts the §9.3 table exactly
(nine items, order, reasons, counters 3/3/2/1).

The engine takes plain domain types (`lib/domain/types.ts`), never Prisma
models, so it can be unit-tested with fixtures and no database.

## Data model notes (SQLite → Postgres)
Enums are stored as `String` and `Json` as serialized `String` (SQLite doesn't
support Prisma `enum`/`Json` portably). The TS unions in `lib/domain/enums.ts`
+ Zod are the source of truth; use `lib/domain/json.ts` to (de)serialize
`scopeSlots`, `diff`, snapshots, timelines, and audit `before/after`. This keeps
`schema.prisma` identical on Postgres. Many-to-many uses the explicit
`DeploymentRobot` join model. Nothing is ever deleted — mutations append an
`AuditEvent`; records are archived, not removed.

## Vocabulary rules (spec §1.3) — enforced in `lib/copy`
| Use | Never |
| --- | --- |
| Ready, Review required, Missing, Not requested, Pending, In review | Compliant, Certified, Safe |
| Approved by \<name>, \<role>, \<date> | Approved by Elaris |
| Evidence coverage | Compliance % |
| Readiness | Compliance score, risk score |

UI is English, all strings centralized in `lib/copy/en.ts`; enum→label/pill
tone maps in `lib/copy/labels.ts`. **Pills always render text** — color never
carries meaning alone (§3.1). Elaris does not approve or certify; it only flags
what needs review. Design images are visual reference only — **numbers are
never copied, everything is computed** (§0, §3.2). Use fictional clients
(Northgas Energy, Autoline Motors), 2026 dates, correct "Unitree" spelling.

## Golden scenario (spec §9.3) — the acceptance anchor
Deployment **DEP-0017** "Valve Inspection Pilot" (Northgas Energy, G1 #017,
PILOT/LIVE, SUPERVISED, SHARED_AREA). Active snapshot **C004**, baseline
**B-0017-01**.

Golden change **CHG-0005** (C004 → C005): `HANDS` BrainCo Revo2 → Inspire
RH56DFX and `CONTROL_STACK` Humandroid Control v2.3 → v2.4.
changedSlots = {HANDS, CONTROL_STACK}. The engine MUST produce exactly:

| Item | Type | Action | Severity |
| --- | --- | --- | --- |
| INT-042 | Evidence | Re-run | HIGH |
| SAF-017 | Requirement | Review | HIGH |
| Safety approval | Approval | Re-approve | HIGH |
| CTD-009 | Evidence | Update | MEDIUM |
| INS-003 | Requirement | Review | MEDIUM |
| Customer engineering approval | Approval | Re-approve | MEDIUM |
| CAL-021 | Evidence | Re-run | LOW |
| SZL-004 | Requirement | Confirm | LOW |
| Confirm no cyber impact | Check | Confirm | LOW |

Not affected: ESV-001, SZR-002, NET-002, OPT-005, SAT-006, MNT-001, Customer
technical approval. **Potential Impact counters: 3 evidence · 3 requirements ·
2 approvals · 1 deployment.** Order: severity HIGH→LOW, then code (coded items
first, then approvals/checks by title). The Phase-2 `tests/engine/golden.test.ts`
asserts this table exactly.

### Write model (Phase 4)
Server Actions apply §6.3 literally: on confirm, affected **VALID** evidence →
REVIEW_REQUIRED (items already non-valid keep their state). Affected approvals are surfaced as RE_APPROVE impact items referencing the
existing immutable approval decision (no duplicate rows, avoiding readiness
double-counting). Each re-approval impact can only be resolved by the named
approver on that approval. A Safety Lead cannot satisfy a Customer Engineer's
approval. Final change approval is blocked while any affected approval impact
remains open. Once all blocking review work is complete, Safety Lead approval
freezes a NEW baseline (old kept in History) and updates `activeBaselineId`. Resolving an evidence impact item
returns it to VALID, so readiness/coverage recompute (acceptance §10). The
golden CHG-0005 stays a preloaded fixture over a healthy baseline (below).

### Seed coherence decision
`prisma/seed.ts` seeds DEP-0017 at the §9.3 states and preloads CHG-0005 as
`REVIEW_REQUIRED` with the nine ImpactItems already persisted (open), WITHOUT
pre-applying the §6.3 confirm-mutations to evidence/approvals. That is the
"registered, awaiting resolution" starting point for demo flow B. Coverage is
intentionally < 100% on DEP-0017 (ESV-001 is VALID but not yet linked → 4 of 5
EVIDENCE items linked). "vs last 30 days" deltas are reconstructed from real
backdated `AuditEvent`s (spec §6.7 decision (a)); never invented.

## Working agreement (spec §0)
Work phase by phase (§12). Close each phase with `pnpm lint`, `pnpm typecheck`,
`pnpm test` green, a clear commit, and a 5-line summary. **Never advance a phase
with broken tests.** Ask when a domain rule is ambiguous; don't add features
outside scope (§2 — Assistant is disabled "Coming soon"; no telemetry, no real
auth, no multi-tenant).

## Phase status
- [x] **Phase 1 — Base:** scaffold, Tailwind + design tokens, shell (sidebar +
      topbar + "Viewing as" + demo banner), schema.prisma, seed, CLAUDE.md.
- [x] **Phase 2 — Engines:** diff, rules, impact, readiness, coverage, round as
      pure functions + 52 Vitest tests incl. the golden test (3/3/2/1).
- [x] **Phase 3 — Read screens:** Home (KPIs + 6 widgets), Deployments list +
      Overview (KPI strip, readiness 6-cat, config snapshot, coverage, req &
      approvals, recent changes, incidents, History tab), Change Impact
      (before/after, 3/3/2/1 counters, affected items, recommended actions,
      approvals affected), Changes list. All values computed from the seed
      (DEP-0017 readiness 64%, coverage 4/5=80%). Query layer in lib/db maps
      Prisma → engine inputs; UI components in components/elaris.
- [x] **Phase 4 — Writes:** Server Actions (Zod → engine → DB → audit) in
      lib/actions: create change w/ preview, review/assign/resolve/waive impact
      items, approve change (SAFETY_LEAD only, blocked on HIGH open → new
      baseline, old kept), evidence/requirement CRUD (browser SHA-256, no
      upload), incident logging (auto-links active baseline+snapshot). Audit log
      in the deployment History tab. Client islands: ApproveChangeButton,
      ImpactActions, NewChangeForm, EvidenceFormDialog, IncidentFormDialog.
      7 integration tests exercise the real actions against a throwaway seeded DB.
- [x] **Phase 5 — Robots, reports, Share View:** Robots list + profile
      (identity, active config, snapshot history w/ diff, deployments, linked
      evidence, incidents — no battery/online). Three reports (System Passport,
      Deployment Readiness Pack, Change Impact Report) as printable A4 pages
      (ReportView) + JSON export (/api/reports/*) + footer disclaimer. Share View:
      read-only /share/[token], token stored hashed, audience label, expiry,
      revocation (ShareDialog + lib/actions/share). The app shell is hidden on
      /share via ShellGate. 4 share integration tests (create→resolve→revoke,
      expiry, hashed token).
- [x] **Phase 6 — Polish:** functional global search (/search + topbar form,
      robots/deployments/evidence/changes by code/title), empty states,
      accessibility (skip-to-content, focus-visible, aria, exact-text pills),
      4 Playwright smoke tests (Home, Overview 64% + no forbidden vocab, Change
      Impact golden, search), and a README with the demo walkthrough (flows A–E).

**MVP complete.** 63 unit/integration tests + 4 e2e, all green.
