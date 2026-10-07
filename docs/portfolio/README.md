# Elaris — Portfolio Planning System

**Estado:** `PORTFOLIO_PLAN_V1`  
**Base:** `release/component-health-v0.4.3` · 2026-10-07

Elaris expands by Product Systems, not by adding unrelated screens.

```text
Actor → decision → trigger → evidence → process
→ deterministic/AI role → human authority → output → outcome
```

## Canonical 14 Product Systems

| Product | Actor | Status | Core question | Roadmap |
|---|---|---|---|---|
| **Deployment Control / Deployment & Change Evidence** | A04/A05 | PILOT / LIVE REFERENCE | What is actually deployed, what evidence supports it, and what deserves review when it changes? | [roadmap](../product/deployment-control/roadmap.md) |
| **Operational Readiness** | A06/A08/A07 | HYPOTHESIS · VISUAL PROTOTYPE | Can this system enter or continue operation here, under what conditions, and what changed since acceptance? | [roadmap](../product/operational-readiness/roadmap.md) |
| **Safety Change Control** | A09 | HYPOTHESIS · VISUAL PROTOTYPE | Which safety evidence, controls, tests or approvals deserve review after a change? | [roadmap](../product/safety-change-control/roadmap.md) |
| **Evidence Review** | A11 | HYPOTHESIS · VISUAL PROTOTYPE | What is in scope, what evidence supports it, what findings remain, and what changed? | [roadmap](../product/evidence-review/roadmap.md) |
| **Placement Workspace** | A14 | HYPOTHESIS · DEMO READY | How do we build and maintain the technical risk submission and answer markets without rebuilding it? | [roadmap](../product/placement-workspace/roadmap.md) |
| **Underwriting Workspace** | A15 | HYPOTHESIS · CONCEPT PROTOTYPE | Do we understand the deployed exposure enough for a human underwriting decision and later re-review? | [roadmap](../product/underwriting-workspace/roadmap.md) |
| **Incident Reconstruction** | A18 | HYPOTHESIS · VISUAL PROTOTYPE | What exactly was deployed, approved and changed when this incident happened? | [roadmap](../product/incident-reconstruction/roadmap.md) |
| **Product & Field Evidence** | A01/A02/A03 | HYPOTHESIS · SPEC ONLY | Which product/version is deployed where, what evidence belongs to it, and who is affected by a release/change/advisory? | [roadmap](../product/product-field-evidence/roadmap.md) |
| **Cyber / OT Change Assurance** | A10 | HYPOTHESIS · SPEC ONLY | What connectivity, software or access changed and what security review is required? | [roadmap](../product/cyber-ot-change-assurance/roadmap.md) |
| **Service & Configuration History** | A13 | HYPOTHESIS · SPEC ONLY | What intervention occurred, what changed, what evidence was produced, and what must be checked before return to operation? | [roadmap](../product/service-configuration-history/roadmap.md) |
| **Asset Monitoring** | A17 | HYPOTHESIS · SPEC ONLY | What asset do we finance/own, what is its technical state/history, and which events threaten continuity or value? | [roadmap](../product/asset-monitoring/roadmap.md) |
| **Portfolio / Accumulation Intelligence** | A16 | DATA-DEPENDENT FUTURE · CONCEPT ONLY | Where are concentrations and common dependencies across many deployed or insured systems? | [roadmap](../product/portfolio-accumulation-intelligence/roadmap.md) |
| **Risk Intelligence** | A20 | LONG-TERM DATA FLYWHEEL · DO NOT BUILD NOW | Can governed normalized exposure, evidence, events and outcomes produce reusable benchmarks or intelligence? | [roadmap](../product/risk-intelligence/roadmap.md) |
| **Component Health** | A13/A04/A05 | PILOT ENGINEERING · V0.4.3 VERIFIED_LOCAL / READY_FOR_FIELD | Which components deserve attention, what evidence supports that attention, and what happened after human review/service? | [roadmap](../product/component-health/roadmap.md) |

## Change Evidence taxonomy
`Change Evidence` is not Product System #15 today. It is the deterministic core of Deployment Control and a shared capability reused by adjacent products. Split it only if a distinct actor/job/budget is proven.

## Enabling systems, not products
Robot Adapter, Edge Collector, evidence/provenance primitives, deterministic engines, replay, audit/share/report infrastructure and Scenario/WorldModel/Cosmos tracks.

## Index
- [Planning method](planning-method.md)
- [Product catalog](product-catalog.md)
- [Shared capabilities](shared-capabilities.md)
- [Component Health leverage](component-health-leverage-map.md)
- [Product × Actor matrix](product-actor-matrix.md)
- [Execution sequencing](execution-sequencing.md)
- [Industry archetypes](../industry/archetypes/README.md)

This plan authorizes planning, not automatic implementation or external evidence release.
