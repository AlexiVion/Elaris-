# Sprint 01 — Humandroid Pilot Demo — Execution Log

## Sprint goal

Make the existing Elaris MVP tell the Humandroid Deployment Control story end-to-end and leave it ready for a concise design-partner demo.

## Technical source of truth

- Repository: `AlexiVion/elaris`
- Branch: `feat/humandroid-pilot`
- Base: `main`

## Work completed

### Pilot operating documentation
- `13586e6` — establish pilot operating spec and product architecture
- `78d5ef0` — map the pilot demo to the current MVP and engineering delta

### CI / definition of done
- `e6667b1` — add Humandroid Pilot CI
- CI runs DB reset/seed, lint, strict typecheck, unit/integration tests, production build and Playwright smoke tests.

### Baseline truth
- `c593c7b` — freeze complete task/environment/evidence/approval context for newly approved baselines.
- `6d71635` — populate complete frozen state for active demo baselines.
- Historical `B-0017-00` is intentionally not backfilled with invented evidence state.

### Approval boundaries
- `5af4744` — enforce named re-approval boundaries.
- `2423ec5` — make re-approval workflow explicit in UI/reports.
- `243d1d5` — record approval semantics in product/technical docs.

Result:
- Safety Lead cannot satisfy Customer Engineering approval.
- Affected approvals cannot use generic waiver.
- Final change approval waits for all affected re-approvals.

### Evidence Map
- `d462508` — document pilot-safe Evidence Map semantics.

Result:
- Elaris may group Evidence and Requirements by deployment/scope.
- It must **not** claim that Evidence A formally satisfies Requirement B until Humandroid validates that relation.
- This remains an external validation dependency, not a software blocker.

### Demo UX and flow validation
- `163957b` — polish Deployment Overview and Change Impact narrative and expand E2E coverage.

Result:
- active baseline + snapshot + hash visible;
- pending change visible;
- explicit “review signal, not automatic invalidation” boundary;
- evidence/requirements filtered pilot flow tested;
- readiness and impact reports tested.

### Pilot artifacts
- `6f21763` — demo data audit
- `4e2bb96` — seven-minute demo script
- `2bc0ec9` — index pilot execution artifacts

## Validation evidence

The expanded CI run for `163957b` completed successfully with:
- database reset/seed: PASS
- lint: PASS
- typecheck: PASS
- unit/integration tests: PASS
- production build: PASS
- Playwright: **6/6 PASS**

The six E2E flows are:
1. Home → deployment
2. Deployment Overview readiness / coverage / baseline
3. Change Impact golden scenario
4. Global search
5. Evidence + Requirements filtered to DEP-0017
6. Readiness + Impact reports from the same core

Later baseline/data/documentation commits also run through the same CI pipeline.

## Demo path

```
DEP-0017 Deployment Overview
        ↓
Evidence / Requirements
        ↓
CHG-0005 Change Impact
        ↓
Named human review / re-approval
        ↓
Safety Lead final change approval
        ↓
New frozen baseline
        ↓
Reports / Share View
```

## Product decisions made

- Keep `ConfigurationSnapshot + ConfigItem`; do not introduce a mutable Configuration row.
- Keep Requirements inside EvidenceItem for now.
- Do not add Evidence→Requirement traceability before real validation.
- Keep first real-data onboarding manual if necessary.
- Do not build Git/Drive/ROS/fleet integrations until repeated manual work identifies the first valuable connector.
- Elaris signals review; humans approve.

## Remaining external dependency

**Evidence Map semantics must be validated with Humandroid using one real requirement/evidence chain.**

This is intentionally marked as waiting on partner feedback. It does not justify inventing a schema relationship in advance.

## Sprint 01 engineering outcome

The demo increment is technically ready when the final branch CI is green.

The next product milestone is not “more features”; it is:

> select one real Humandroid deployment, receive the first P0 artifacts, and replace demo assumptions with real data.
