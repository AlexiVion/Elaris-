# Elaris — Deployment & Change Evidence (MVP)

Elaris connects a Physical AI system's **real configuration** with the
**evidence and approvals** that authorize its deployment, and keeps that
relationship valid when the system changes. It answers two questions:

1. What system was deployed, for what task, under what configuration, and with
   what evidence and approvals?
2. If something changes, what tests, documents or approvals are affected, and who
   must review them?

Elaris is a **layer on top** — not PLM, fleet management or observability. No
telemetry, battery or online/offline. It is deterministic and **does not certify
or approve**; approvals are recorded by named people. Single-tenant, local,
runs with demo data, operated by one person.

> This is an MVP with **demo data** (a banner says so in-app). Clients are
> fictional (Northgas Energy, Autoline Motors, Humandroid's own lab).

## Prerequisites

- **Node.js LTS** (tested on v22)
- **pnpm** (via corepack): `corepack enable && corepack prepare pnpm@9 --activate`
- No external services — everything runs locally on SQLite.

## Run the demo

```bash
pnpm install          # install deps (also runs prisma generate)
pnpm db:reset         # create the SQLite DB, run migrations, seed demo data
pnpm dev              # http://localhost:3000
```

That's it — `pnpm install && pnpm db:reset && pnpm dev` brings the app up with
the seed and no external services.

## A 5-minute tour (the acceptance flows)

Use the **“Viewing as”** selector (top-right) to switch persona — there is no
real login.

- **A · Register a change.** Open **Deployments → Valve Inspection Pilot
  (DEP-0017) → New change**. Change *Hands* `BrainCo Revo2 → Inspire RH56DFX`
  and *Control stack* `v2.3 → v2.4`, **Preview impact** (3 evidence, 3
  requirements, 2 approvals, 1 deployment), then **Confirm**.
- **B · Resolve & approve.** Open the **golden change** at
  `/changes/CHG-0005`. For each item use **Manage** to put in review, resolve
  (a re-run needs a linked evidence item or a test date + result), waive (needs
  a written justification) or assign. As **Sarah Chen (Safety Lead)**, once no
  high-impact item is open **and every affected approval has been re-reviewed by
  its named approver**, **Approve Change** → a new baseline is frozen and the
  previous one stays in **History**.
- **C · Reports.** **Reports** → open a System Passport / Deployment Readiness
  Pack / Change Impact Report → **Print / PDF** (A4) and **Export JSON**.
- **D · Share.** In any report, **Share View** → create a read-only link (with
  audience label + expiry) → open it in a private window → **Revoke** it and
  confirm it stops working.
- **E · Incident.** **Incidents → New incident**; on save the active baseline and
  snapshot are linked automatically.

Everything you see is **computed from the data** — nothing is hardcoded. The
design images are visual reference only.

## Scripts

| Script | What it does |
| --- | --- |
| `pnpm dev` | Run the app |
| `pnpm build` | Production build (prisma generate + next build) |
| `pnpm lint` / `pnpm typecheck` | ESLint / strict TypeScript |
| `pnpm test` | Vitest — domain engine + action integration tests |
| `pnpm test:e2e` | Playwright smoke tests (needs `pnpm exec playwright install chromium` once) |
| `pnpm db:seed` | Seed demo data |
| `pnpm db:reset` | Migrate reset + seed (clean rebuild) |

## Architecture

- **Next.js 14** (App Router) · **TypeScript strict** · **Tailwind** + shadcn-style
  UI + lucide-react · **Prisma + SQLite** (portable to Postgres) · **Zod** ·
  **Server Actions** · **Vitest** + **Playwright**. Font: Inter.
- **Core logic** is pure, deterministic and DB-free in `lib/engine/`
  (hash · diff · rules · impact · readiness · coverage) — never an LLM — and is
  the most heavily tested part of the system (the golden test asserts the
  reference scenario exactly, 3/3/2/1).
- The vocabulary is constrained (Ready / Review required / Missing / Not
  requested / Pending / In review; Evidence coverage; Readiness — never
  "compliant", "certified" or "approved by Elaris") and centralized in
  `lib/copy/`.
- Nothing is deleted: every mutation appends an **AuditEvent** (see a
  deployment's **History** tab); records are archived, not removed.

See **`CLAUDE.md`** for the full architecture, where the core logic lives, the
vocabulary rules and the golden scenario.

## Out of scope (MVP)

Assistant (shown disabled, "Coming soon"), a full Insurance Readiness module,
on-robot snapshot agent / Git-Drive-fleet connectors, telemetry, multi-tenant,
real auth, billing, risk score. Extension points are left in place.


## Humandroid pilot

The current product validation focus is the **Humandroid Pilot** for Elaris Deployment Control.

Canonical working docs:

- [Elaris overview](docs/company/elaris-overview.md)
- [Physical AI industry map](docs/industry/physical-ai-industry-map.md)
- [Deployment Control product](docs/product/deployment-control.md)
- [Humandroid Pilot Spec](docs/pilots/humandroid/pilot-spec.md)
- [Humandroid Data Request](docs/pilots/humandroid/data-request.md)
- [Humandroid Operating Workflow](docs/pilots/humandroid/operating-workflow.md)
- [Humandroid Minimum Data Model](docs/pilots/humandroid/minimum-data-model.md)
- [Humandroid Success Criteria](docs/pilots/humandroid/success-criteria.md)
- [Humandroid Demo & Delivery Plan](docs/pilots/humandroid/demo-delivery-plan.md)
- [Humandroid Demo Data Audit](docs/pilots/humandroid/demo-data-audit.md)
- [Humandroid Evidence Map Semantics](docs/pilots/humandroid/evidence-map-semantics.md)
- [Humandroid 7-Minute Demo Script](docs/pilots/humandroid/demo-script.md)
- [Current system audit](docs/architecture/system-design.md)

The rule for this branch is simple: **do not add features just because they are technically possible.**
A feature enters the Humandroid MVP only when it maps to a real pilot workflow or validated need.
