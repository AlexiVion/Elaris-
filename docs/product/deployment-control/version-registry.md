# Deployment Control / Deployment & Change Evidence — Version Registry

**Source of truth for this product's planned version states.**

## Current product axes
- Product evidence: `PILOT / LIVE REFERENCE PRODUCT`
- Engineering: existing state only where explicitly supported below.
- Data/evidence: do not promote synthetic/demo data to real evidence.
- Authority/data use: actor/data-owner decisions remain separate.
- Commercial: no paid/validated claim unless explicitly recorded.

| Version | Scope | State | Evidence required to change state |
|---|---|---|---|
| V0.1 | Deployment truth foundation | `IMPLEMENTED_REFERENCE` | Canonical configuration can be reconstructed deterministically. |
| V0.2 | Evidence + baseline graph | `IMPLEMENTED_REFERENCE` | One coherent deployment package can be rendered from shared truth. |
| V0.3 | Change Evidence engine | `IMPLEMENTED_REFERENCE` | Golden deterministic change scenario remains reproducible. |
| V0.4 | Operator workbench + outputs | `IMPLEMENTED_REFERENCE` | End-to-end demo is coherent; no claim of field validation. |
| V0.5 | Real Deployment Reconciliation | `PROPOSED_NEXT` | Real config, deployment, evidence and gaps are represented without invented facts. |
| V0.6 | Real Change Case | `PROPOSED` | Named reviewers confirm impact/re-test/re-approval workflow. |
| V0.7 | Source-system intake | `DEFERRED_UNTIL_PAIN` | At least two repeated manual intake events justify an integration. |
| V0.8 | Cross-product evidence links | `PROPOSED` | No duplicate system-of-record; links preserve provenance/authority. |
| V0.9 | Secure partner pilot | `PROPOSED` | Partner security/data requirements are explicit and tested. |
| V1.0 | Repeatable paid Deployment Control | `VISION` | At least one paid customer and repeated workflow with measured value. |
| V1.5 | Multi-OEM / multi-source | `VISION` | Second real OEM/source required by customer demand. |
| V2.0 | Change intelligence | `RESEARCH_ONLY` | Repeated outcome-linked changes and governed reuse rights. |

## State discipline
`IMPLEMENTED_REFERENCE` records functionality present in the repository; it is not equivalent to actor validation or commercial release.

All future transitions require PR evidence and named owner review.
