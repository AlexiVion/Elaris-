# Elaris Platform — Wave A Visual Prototype Spec

## Goal

Create four actor-specific, navigable product mockups that feel like real software rather than generic lenses over Deployment Control.

Wave A:

1. Operational Readiness — Enterprise Buyer / Operator / Procurement
2. Safety Change Control — Safety / EHS
3. Evidence Review — Test Lab / Certifier / Independent Assurance
4. Incident Reconstruction — Claims / Forensics / Investigation

Deployment Control remains frozen as the LIVE reference product.

## Product design rule

Each product must answer four questions immediately:

1. What work is waiting for this actor?
2. What record/context are they deciding on?
3. What can they review or decide?
4. What output does their workflow produce?

Every Wave A prototype therefore has:

- actor-specific app shell + navigation;
- Home / Work Queue;
- Primary Record;
- Decision / Review Workflow;
- Output / Record view.

## Data rule

The prototypes reuse the existing Elaris demo core.

Canonical source scenario:

- Deployment: DEP-0017 — Valve Inspection Pilot
- Robot: Unitree G1 / G1 #017
- Active baseline: B-0017-01
- Active snapshot: C004
- Material change: CHG-0005
- Incident: INC-2026-001

No new Prisma schema is introduced.

Where a product needs an object the core does not yet model (Acceptance Gate, Hazard, Assessment, Finding), the UI may create a **presentation-only hypothesis** clearly labeled as prototype/demo data. It must not be persisted or represented as validated customer data.

## Shared visual language

All products share:
- Elaris Platform identity;
- compact left navigation;
- work-queue first information architecture;
- white/neutral enterprise surfaces;
- status pills;
- visible provenance back to the shared deployment record;
- “Prototype hypothesis” labeling where actor-specific objects are simulated.

They do not share the same menu, KPI set or workflow.

---

# 1. Operational Readiness

## Actor
Enterprise Buyer / Operator / Procurement / Site Management.

## Core question
“Can this system enter/continue operating here, under what conditions, and what changed since acceptance?”

## Navigation
- Overview
- Deployments
- Acceptance Gates
- Changes
- Decision Record

## Overview
Show:
- candidate/live deployments;
- missing required information;
- gates requiring attention;
- material change since current baseline;
- buyer-side work queue.

## Deployment Review
DEP-0017:
- supplier / integrator;
- robot + exact configuration;
- site, task, operating mode, human exposure;
- requirements/evidence;
- missing items;
- current named approvals.

## Acceptance Gates
Presentation-only gate model:
- Procurement
- Safety / EHS
- IT / Cyber
- Operations

Gate state is derived from existing demo evidence/requirements where possible:
- Safety: review required
- IT/Cyber: not started
- Procurement/Customer: missing items
- Operations: waiting on open customer approval

## Decision Record
Prototype decision surface:
- Accept
- Accept with conditions
- Review required
- Reject

No persistence in Wave A.

---

# 2. Safety Change Control

## Actor
Safety / EHS / machinery-safety reviewer.

## Core question
“What safety-relevant evidence, controls, tests and decisions deserve review after this change?”

## Navigation
- Safety Overview
- Hazards & Controls
- Change Reviews
- Re-tests
- Decisions

## Safety Overview
Show:
- CHG-0005 as priority review;
- high/medium/low impact items;
- evidence review status;
- open named re-approval;
- incident context.

## Hazards & Controls
Presentation-only view derived from demo context:
- Shared-zone human exposure
- Grasp/contact change
- Emergency stop / safe state
- Operating limits

Each card links to existing evidence/requirements where possible.

## Change Review
Use real CHG-0005:
- BrainCo Revo2 → Inspire RH56DFX
- Humandroid Control v2.3 → v2.4
- affected evidence, requirements, approvals
- explicit “review signal, not automatic invalidation” boundary.

## Re-test Queue
Derived from real impact items with RE_RUN / UPDATE / REVIEW actions.

## Decision
Prototype safety review record; existing named approval truth remains authoritative.

---

# 3. Evidence Review

## Actor
Test Lab / Certification / Conformity / Independent Assurance.

## Core question
“What is the assessment scope, what evidence has been reviewed, what remains open, and what changed after assessment?”

## Navigation
- Assessment Queue
- Assessment
- Evidence Review
- Findings
- Change Since Assessment

## Assessment Queue
Presentation-only assessment:
ASMT-0017 — Valve Inspection Pilot / C004

State:
Awaiting evidence / findings open.

## Assessment Scope
Show:
- system;
- deployment;
- snapshot/baseline;
- task/site;
- scope statement;
- list of applicable demo requirements.

No claim that a real standard applies.

## Evidence Review
Use current Evidence + Requirement records and statuses.
Reviewer outcomes are UI-only:
- Accepted for review
- Needs clarification
- Missing
- Not reviewed

## Findings
Presentation-only findings derived from actual open demo gaps:
- Operator training record missing
- Site acceptance test missing
- Network access review not started

They are explicitly demo findings, not conformity findings issued by a real body.

## Change Since Assessment
CHG-0005 appears as a post-assessment change that may reopen scope.

---

# 4. Incident Reconstruction

## Actor
Claims / Loss Adjuster / Forensic Engineer / Internal Investigation.

## Core question
“What exactly was deployed at the time of the event, what changed before it, and what evidence do we have?”

## Navigation
- Incident Queue
- Incident Overview
- Timeline
- Configuration at Time
- Evidence Room
- Findings

## Incident Queue
Use real demo incidents:
- INC-2026-001 — investigating
- INC-2026-002 — closed

## Incident Overview
For INC-2026-001 show:
- occurrence time;
- severity/status;
- deployment/robot;
- baseline/snapshot at time;
- event description.

## Timeline
Use persisted incident timeline plus prior configuration/change context.

## Configuration at Time
Resolve baseline/snapshot to:
B-0017-01 / C004 and show the relevant robot/deployment context.

## Evidence Room
Presentation surface:
- linked Elaris deployment record;
- baseline snapshot;
- safety evidence;
- incident timeline;
- empty-state cards for logs/media/statements not yet captured.

## Findings
Clear separation:
- Known facts
- Working hypotheses
- Unknowns

No legal causation/liability/coverage determination.

---

# Routing

Wave A should use dedicated static product routes, not the generic horizontal prototype page.

Examples:

- /platform/operational-readiness
- /platform/operational-readiness/deployments/DEP-0017
- /platform/operational-readiness/acceptance

- /platform/safety-change-control
- /platform/safety-change-control/changes/CHG-0005
- /platform/safety-change-control/retests

- /platform/evidence-review
- /platform/evidence-review/assessments/ASMT-0017
- /platform/evidence-review/findings

- /platform/incident-reconstruction
- /platform/incident-reconstruction/incidents/INC-2026-001
- /platform/incident-reconstruction/evidence

## Out of scope

- new write APIs;
- new Prisma models;
- authentication changes;
- generic horizontal CRUD;
- standards applicability engine;
- real certification workflow;
- real insurer/broker workflow;
- new AI features;
- changing Deployment Control.

## Definition of Done

- each Wave A product has its own app-like navigation;
- each product has at least 3 navigable surfaces;
- all reuse the same shared core;
- actor-specific hypothesis data is visibly labeled;
- Deployment Control routes and tests remain intact;
- build/typecheck/unit tests pass;
- Playwright covers the four Wave A entry points and one drill-down flow each.
