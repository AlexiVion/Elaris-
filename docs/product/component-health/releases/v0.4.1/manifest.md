# Component Health V0.4.1 — Internal Stable Release Manifest

**Release line:** `component-health-v0.4.1-stable`  
**Release branch:** `release/component-health-v0.4.1`  
**Source implementation head:** `89b5c04d5e5592e2caabecd0c40d7bdf52ceac17` (PR #19, VERIFIED_LOCAL)  
**Release state:** `INTERNAL_STABLE` only when tag `component-health-v0.4.1-stable` points to the exact validated release-branch commit; without that tag this branch is a release candidate.  
**Audience:** internal / authorized technical users only  
**Data classification:** `SENSITIVE`  
**External export:** `NOT_APPROVED`

## Stable scope

This release freezes the first complete internal Component Health workflow:

1. real Unitree G1 field capture/evidence baseline;
2. reproducible V0.3 Evidence Engine;
3. private artifact-backed V0.4 Audit Workbench;
4. complete 29-slot × phase navigation for the validated dataset;
5. quality findings grouped without converting them into health/failure claims;
6. internal draft reporting;
7. V0.4.1 human-review queue with plain-language recommended actions;
8. persisted review state and notes through Prisma/SQLite;
9. save → full refresh → persisted-state E2E validation.

## Release claims

This release may claim:

- observed operational evidence is ingested from private V0.3 artifacts;
- analysis runs are reproducible for the validated Dataset #002 workflow;
- same-session idle is used as the primary comparison reference;
- missing/unresolved evidence remains explicit;
- review workflow state can be persisted locally;
- quality findings can be converted into documented follow-up work.

This release must **not** claim:

- component health;
- diagnosis;
- fault detection;
- failure probability;
- remaining useful life;
- predictive maintenance;
- safety certification;
- return-to-service approval;
- OEM semantic completeness;
- permission to export/share the underlying field evidence.

## Required runtime

- WSL2 Ubuntu 24.04 (validated environment)
- Node.js 22.x
- pnpm 9.15.x
- Prisma 5.22.x
- Next.js 14.2.15
- Chromium for Playwright
- private V0.3 artifacts outside the Git working tree

Default artifact discovery:

```text
$HOME/elaris-private
```

## Release gate

The exact release branch must pass:

```bash
bash scripts/component-health/release-check-v041.sh
```

The script validates:

- clean tracked working tree before the gate;
- presence of at least one private V0.3 report;
- Prisma migration deploy;
- Prisma Client generation;
- TypeScript;
- all Component Health unit/integration tests;
- production build;
- Playwright E2E on the production build;
- persisted review workflow via the E2E save → refresh assertions.

Only after this passes should the release be tagged:

```text
component-health-v0.4.1-stable
```

## Known limitations

See [known-limitations.md](known-limitations.md).

## Operating instructions

See [runbook.md](runbook.md).

## Governance

`VERIFIED_LOCAL` and `INTERNAL STABLE` are technical states. They do not imply:

- owner/data-export approval;
- external/public release;
- authenticated multi-user deployment;
- certification or regulatory acceptance.

Any future change in behavior, evidence semantics, schema, review persistence, or supported claims must occur on a new development/version line rather than modifying this frozen release silently.
