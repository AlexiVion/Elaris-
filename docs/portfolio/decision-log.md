# Elaris Portfolio — Decision Log

This file records portfolio-level planning decisions. Product-specific implementation decisions remain in their own PRs/docs.

## PD-001 — Canonical Product System count

**Decision:** 14 Product Systems are recognized as planned as of 2026-10-07.

**Basis:** repository Product Systems Registry + current Platform registry + accepted Component Health work.

**Effect:** products without UI remain in planning; UI presence is not the criterion for existence.

## PD-002 — Change Evidence taxonomy

**Decision:** Change Evidence is not a separate Product System today.

**Reason:** its current actor, data and workflow are inseparable from Deployment Control, while its deterministic primitives are reusable horizontally.

**Reopen when:** a distinct actor/job/budget and independent end-to-end workflow are demonstrated.

## PD-003 — 20 canonical industrial actor archetypes

**Decision:** consolidate the lifecycle/cross-cutting map into 20 actor archetypes.

**Reason:** duplicate labels such as Maintenance are one actor class, while actors with distinct authority (e.g. broker vs underwriter vs reinsurer) remain separate.

## PD-004 — GitHub is canonical for portfolio planning

**Decision:** accepted product inventory, roadmaps, gates, matrices and execution backlogs are versioned in GitHub.

**Notion role:** raw interviews, research and working discovery may remain there, but they change canonical scope only when promoted through GitHub review.

## PD-005 — Component Health is the reusable engineering reference for evidence workflows

**Decision:** reuse its provenance, replay, evidence-engine, workbench, human-review and blocker-discipline patterns.

**Boundary:** do not generalize G1-specific semantics, health labels or field conclusions to other products.

## PD-006 — Horizontal execution waves

**Decision:** planning is horizontal; engineering is sequential/evidence-gated.

Priority wave:
1. Deployment Control
2. Service & Configuration History
3. Product & Field Evidence
4. Operational Readiness
5. Incident Reconstruction
then assurance, insurance/finance, and finally data-dependent intelligence.

## PD-007 — Work-in-progress control

Recommended maximum:
- one deep engineering product;
- one actor-validation/research track;
- one blocked field track.

This prevents the portfolio from becoming many attractive demos with no validated workflows.

## PD-008 — Component Health parking point

**Decision:** V0.4.3 is the current engineering stopping point.

**Blocker:** CH-G1-002 requires physical robot access.

**Allowed parallel work:** planning V0.5 governance/export and horizontal products; no invented physical evidence.
