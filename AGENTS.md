# Elaris — Agent Operating Contract

> **MANDATORY FIRST READ**
>
> Every AI coding/research agent working in this repository must read this file **before making changes**.
> Human contributors should use the same rules.

This file is the entry point for how Elaris is organized, how decisions are sourced, how the architecture works, and how Alexi + Juanma collaborate safely in one repository.

---

## 1. Source-of-truth hierarchy

When sources disagree, use this order:

1. **Notion — product strategy and discovery**
   - Canonical workspace: https://app.notion.com/p/00-HOME-3ebbeb945fd6802dbae4f253211db396?pvs=25
   - Actor maps, product hypotheses, validation plans, interview findings and product direction live here.
2. **GitHub `main` — accepted implementation**
   - `main` is the only canonical code state.
   - A branch is work in progress, never canonical until merged.
3. **Repository `docs/` — durable architecture and operating protocols**
   - Architecture, SOPs, product implementation boundaries and engineering decisions.
4. **GitHub Issues — executable work units**
   - Every code task should have one issue with owner, scope and acceptance criteria.
5. **Pull Requests — integration record**
   - Why a change was made, what changed, verification, review and merge history.

Do not silently resolve contradictions. If Notion strategy and code disagree, report the mismatch and identify which layer needs updating.

---

## 2. Mandatory reading order for an agent

Before changing code:

1. Read this `AGENTS.md`.
2. Read `docs/README.md`.
3. Read `docs/architecture/platform-product-architecture.md`.
4. Read the relevant product/pilot/platform docs for the task.
5. Read the GitHub Issue defining the task.
6. Inspect open Pull Requests that may touch the same area.
7. Inspect the current implementation before proposing changes.

Do not start coding from a chat summary alone.

---

## 3. Collaboration model

Elaris uses **one canonical repository** shared by Alexi and Juanma.

The model is:

```text
                         canonical repository
                               main
                                │
               ┌────────────────┴────────────────┐
               │                                 │
        Alexi task branch                 Juanma task branch
        feat/... / fix/...                feat/... / docs/...
               │                                 │
               └──────────── Pull Requests ──────┘
                                │
                        review + CI + tests
                                │
                               main
```

Rules:

- Never develop directly on `main`.
- One task = one branch = one Pull Request.
- Branch from an up-to-date `main`.
- Keep branches short-lived.
- The other founder reviews by default.
- CI must be green before merge.
- Use **Squash and Merge** for normal feature/fix PRs.
- The initial repository migration may use a merge commit to preserve imported history.
- After merge, both contributors sync `main` before starting new work.
- Do not maintain two independent long-lived Elaris repositories.

Full protocol: `docs/team/COLLABORATION_WORKFLOW.md` and `docs/team/GIT_SOP.md`.

---

## 4. Current product architecture

### Navigation hierarchy

Elaris is platform-first.

```text
/
└── Elaris Platform Home
    ├── /platform/deployment-control
    ├── /platform/operational-readiness
    ├── /platform/safety-change-control
    ├── /platform/evidence-review
    ├── /platform/placement-workspace
    ├── /platform/underwriting-workspace
    └── /platform/incident-reconstruction
```

A product is a **full-screen application**.

The platform shell must not wrap a product.

Each product owns:
- its sidebar/navigation;
- its Home/work queue;
- its decision workflow;
- its actor-specific terminology;
- its reports/outputs;
- future actor-specific permissions/writes.

The platform/shared substrate owns:
- common identities;
- versioned technical truth;
- provenance;
- cross-product historical relationships.

### Reference product

**Deployment Control / Deployment & Change Evidence** is the reference application for Robotics Integrator / Deployer.

Its current full product experience is the UI/UX depth benchmark for all actor demos.

---

## 5. Shared domain substrate

The current core is approximately:

```text
Organization
  ↓
Robot
  ↓
ConfigurationSnapshot + ConfigItem
  ↓
Deployment
  ↓
Baseline
  ↓
Evidence / Requirement
  ↓
Approval
  ↓
Change + ImpactItem
  ↓
Incident
  ↓
Audit / Share
```

Important architectural rules:

- Configuration is versioned through `ConfigurationSnapshot + ConfigItem`.
- Historical truth must remain reconstructable.
- A new baseline does not overwrite an old baseline.
- Actor-specific products reuse shared facts instead of duplicating them into new silos.
- New actor-specific persistent entities require field evidence before schema expansion.

---

## 6. Deterministic core

`lib/engine/` contains deterministic domain logic for concepts such as:

- configuration hashing;
- configuration diff;
- change impact;
- readiness;
- evidence coverage.

Do not replace deterministic domain logic with an LLM.

AI may assist:
- research;
- extraction;
- drafting;
- classification suggestions;
- workflow acceleration.

AI must not silently become the authority for:
- safety decisions;
- certification/conformity;
- underwriting decisions;
- coverage;
- legal causation;
- final human approvals.

---

## 7. Product discovery boundary

Elaris deliberately builds realistic demos before full backend validation.

A UI object can be **presentation-only** when testing a workflow hypothesis.

Examples:
- Acceptance Gate
- Assessment
- Finding
- Submission
- Market Question
- Underwriting Case
- Condition / Referral
- Hazard / Control

Do not automatically create Prisma models for these.

The sequence is:

```text
Research
→ Demo Product Spec
→ Full realistic demo
→ Interview with real actor
→ "Show me the last time you did this"
→ Real artifacts
→ Correct assumptions
→ Validated spec
→ Persist/build only what repeats
```

Always distinguish:
- real shared demo/core data;
- synthetic demo data;
- validated workflow;
- unvalidated hypothesis.

Never present a synthetic decision, risk score, certification, pricing output or regulatory conclusion as real.

---

## 8. Full demo application standard

A product is **DEMO READY** only when it has comparable depth to Deployment Control.

Minimum:

1. dedicated product shell;
2. full-screen layout;
3. Home;
4. operational KPIs;
5. Attention Required / work queue;
6. primary entity list;
7. primary entity detail;
8. secondary workflow screens;
9. meaningful statuses;
10. drill-down navigation;
11. at least one useful interaction;
12. reports/outputs;
13. coherent cross-page demo dataset;
14. explicit non-claims;
15. scripted end-to-end walkthrough.

A polished single page is not a full demo.

---

## 9. Technology

Current primary stack:

- Next.js
- TypeScript
- Tailwind CSS
- Prisma
- SQLite for the current local/demo environment
- Playwright for end-to-end tests

Do not introduce a new framework, database, state layer or major dependency without a documented reason.

---

## 10. Before coding

An agent must be able to answer:

- What Issue am I implementing?
- Who owns the task?
- What product/actor does it serve?
- Which real or hypothesized workflow is being tested?
- Which files/areas are likely to change?
- Is another open PR touching those files?
- Does this modify the shared substrate or only an actor-specific surface?
- What is the acceptance criterion?
- How will I verify it?

If these are unclear, stop and clarify the task rather than broadening scope.

---

## 11. Before opening a PR

At minimum run the relevant checks.

For the current repository, the complete verification path is:

```bash
pnpm db:reset
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm exec playwright test
```

Use the repository scripts as authoritative if they change.

Never claim CI/tests passed unless there is actual run evidence.

Update documentation when the change alters:
- architecture;
- routing;
- workflow;
- shared domain semantics;
- collaboration protocol;
- product boundaries.

---

## 12. Merge discipline

A PR should not be merged when:

- CI is red;
- acceptance criteria are not met;
- it silently changes architecture;
- it overlaps an active PR without reconciliation;
- demo data is presented as validated reality;
- it adds speculative shared schema without evidence;
- it weakens historical truth/provenance;
- it bypasses named human authority.

When another PR merges first:

1. fetch `main`;
2. merge `origin/main` into the task branch;
3. resolve conflicts intentionally;
4. rerun verification;
5. push the updated branch.

---

## 13. Documentation rule

If an agent learns something durable, it should not remain only in chat.

Put it in the appropriate place:

- strategy/discovery → Notion;
- architecture/protocol → `docs/`;
- work to do → Issue;
- code change rationale/result → PR;
- accepted code → `main`.

The goal is that a new human or AI agent can reconstruct the current state without access to prior chats.
