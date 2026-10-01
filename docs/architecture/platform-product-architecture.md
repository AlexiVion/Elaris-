# Elaris — Platform → Product Architecture

## Purpose

This document defines the current architectural contract for the Elaris horizontal platform.

The key distinction is:

> **Elaris Platform is the first level. Products are second-level full applications.**

The platform is not a visual wrapper around product screens.

---

## 1. Navigation hierarchy

Canonical route hierarchy:

```text
/
└── Elaris Platform Home
    │
    ├── /platform/deployment-control
    │   ├── home
    │   ├── robots
    │   ├── deployments
    │   ├── evidence
    │   ├── requirements
    │   ├── changes
    │   ├── incidents
    │   └── reports
    │
    ├── /platform/operational-readiness
    ├── /platform/safety-change-control
    ├── /platform/evidence-review
    ├── /platform/placement-workspace
    ├── /platform/underwriting-workspace
    └── /platform/incident-reconstruction
```

### Rule

When the user enters a product:

- the Platform Home shell disappears;
- the product occupies the full viewport;
- the product shows its own navigation;
- the product can provide a clear “Platform” action to return to `/`.

Do not render a product inside a second platform frame.

---

## 2. Reference implementation

**Deployment Control / Deployment & Change Evidence** is the reference product.

It establishes the minimum product depth and visual expectations for demos:

- dedicated sidebar;
- topbar;
- product Home;
- search;
- attention queue;
- entity lists;
- entity details;
- statuses;
- workflow actions;
- reports;
- cross-page data consistency.

Other products may have different information architecture, but not lower product realism when labeled demo-ready.

---

## 3. Shared substrate

The shared Elaris technical truth currently centers on:

```text
Organization
→ Robot
→ ConfigurationSnapshot / ConfigItem
→ Deployment
→ Baseline
→ Evidence / Requirement
→ Approval
→ Change / ImpactItem
→ Incident
→ Audit / Share
```

The shared layer owns:

- identity;
- provenance;
- version history;
- relationships across lifecycle records;
- reconstructable historical state.

Actor products should reference this truth instead of copying it into isolated product silos.

---

## 4. Configuration and historical truth

Configuration is a versioned concept.

Use:

`ConfigurationSnapshot + ConfigItem`

Do not replace this with a single mutable configuration record.

Reason:

- deployment state must be reconstructable;
- incident state must be reconstructable;
- change before/after must be deterministic;
- old approvals/reports must retain the state they referenced.

A new configuration/baseline does not rewrite history.

---

## 5. Deterministic engine

The shared engine is intentionally deterministic for core domain calculations.

Current concepts include:

- configuration hash;
- before/after diff;
- change impact;
- readiness;
- evidence coverage.

LLMs must not replace deterministic domain calculations.

LLM/AI features can exist around the deterministic core for tasks such as extraction, drafting, research assistance or suggested classification.

---

## 6. Actor-product boundary

Each actor product owns:

- navigation;
- work queue;
- actor-specific records;
- decision lens;
- workflows;
- reports;
- terminology;
- eventual actor permissions and write operations.

Examples:

### Deployment Control
Actor:
- integrator / deployer

Question:
- What is actually deployed and what deserves review when it changes?

### Operational Readiness
Actor:
- enterprise buyer / operator

Question:
- Can this system enter or continue operation here, under what conditions, and what changed since acceptance?

### Placement Workspace
Actor:
- insurance broker / PAS

Question:
- How do we build and maintain a reusable technical submission and answer market questions without rebuilding the technical story?

### Underwriting Workspace
Actor:
- insurer / MGA / underwriter

Question:
- What is the actual deployed exposure, what information remains, what human decision is made, and what later changes deserve review?

---

## 7. Hypothesis objects vs shared objects

Not every object shown in a demo belongs in Prisma.

Examples of actor-specific **hypothesis objects**:

- Acceptance Gate
- Acceptance Decision
- Hazard
- Control
- Assessment
- Finding
- Submission
- Market
- Market Question
- Underwriting Case
- Condition
- Referral
- Underwriting Decision

These may be represented in UI/demo data before persistence.

Persist them only when real field work proves:
- the object exists;
- it recurs;
- it has a stable lifecycle;
- it needs durable ownership/provenance;
- persistence creates value.

---

## 8. Demo data contract

Every product demo must distinguish:

### Shared demo truth
Data already represented in Elaris core, for example:
- deployment;
- robot;
- versioned configuration;
- evidence;
- requirement;
- change;
- incident.

### Synthetic actor workflow data
Data invented to make a realistic discovery workflow, for example:
- fictional broker;
- fictional market;
- illustrative submission status;
- illustrative underwriting question.

Synthetic data must never be presented as validated customer behavior or a real regulatory/insurance conclusion.

---

## 9. Product demo standard

A full demo product should include:

- full-screen product shell;
- Home;
- operational metrics;
- Attention Required/work queue;
- primary entity list;
- primary entity detail;
- supporting workflow screens;
- statuses;
- drill-down;
- at least one interaction;
- reports/outputs;
- coherent scenario;
- explicit non-claims.

The goal is not to prove the hypothesis correct.

The goal is to make it concrete enough that a real actor can say:

> “This part is right; this part is wrong; this is missing; we do not work like that.”

---

## 10. Schema-change rule

Before extending shared schema, answer:

1. Which real actor workflow requires this?
2. What real artifact proves the concept?
3. Is it shared across products or actor-specific?
4. Does it require historical versioning?
5. Who owns/authorizes it?
6. Can the first validation remain presentation-only/manual?

If these questions cannot be answered, do not expand the shared core.

---

## 11. Source relationship

- Product strategy and validation plan: canonical Notion workspace.
- Accepted technical implementation: GitHub `main`.
- This document: canonical repository architecture contract.
- Product-specific implementation decisions: relevant docs + PRs.

When architecture changes, update this file in the same Pull Request.
