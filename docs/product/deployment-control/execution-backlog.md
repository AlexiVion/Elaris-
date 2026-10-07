# Deployment Control / Deployment & Change Evidence — Execution Backlog

Tasks are ordered by evidence dependency, not feature desirability.

| ID | Version | Task | Acceptance | Dependency |
|---|---|---|---|---|
| DC-010 | V0.1 | Deployment truth foundation | Canonical configuration can be reconstructed deterministically. | Portfolio plan accepted |
| DC-020 | V0.2 | Evidence + baseline graph | One coherent deployment package can be rendered from shared truth. | DC-010 |
| DC-030 | V0.3 | Change Evidence engine | Golden deterministic change scenario remains reproducible. | DC-020 |
| DC-040 | V0.4 | Operator workbench + outputs | End-to-end demo is coherent; no claim of field validation. | DC-030 |
| DC-050 | V0.5 | Real Deployment Reconciliation | Real config, deployment, evidence and gaps are represented without invented facts. | DC-040 |
| DC-060 | V0.6 | Real Change Case | Named reviewers confirm impact/re-test/re-approval workflow. | DC-050 |
| DC-070 | V0.7 | Source-system intake | At least two repeated manual intake events justify an integration. | DC-060 |
| DC-080 | V0.8 | Cross-product evidence links | No duplicate system-of-record; links preserve provenance/authority. | DC-070 |
| DC-090 | V0.9 | Secure partner pilot | Partner security/data requirements are explicit and tested. | DC-080 |
| DC-100 | V1.0 | Repeatable paid Deployment Control | At least one paid customer and repeated workflow with measured value. | DC-090 |
| DC-110 | V1.5 | Multi-OEM / multi-source | Second real OEM/source required by customer demand. | DC-100 |
| DC-120 | V2.0 | Change intelligence | Repeated outcome-linked changes and governed reuse rights. | DC-110 |

## Operating rules
- One implementation scope per PR.
- Real-actor/artifact gates cannot be replaced by synthetic UI.
- Actor-specific persistence waits for recurring real objects.
- Human authority and data/export approval are separate from engineering PASS.
- Shared primitives are reused; shared truth is never copied into actor silos.

## Immediate next
Execute V0.5 with one real Humandroid deployment before adding new generic features.
