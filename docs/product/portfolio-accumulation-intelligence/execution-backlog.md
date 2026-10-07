# Portfolio / Accumulation Intelligence — Execution Backlog

| ID | Version | Work package | Acceptance | Dependency |
|---|---|---|---|---|
| PA-010 | V0.1 | Portfolio data contract | Contract identifies required fields and permission boundaries. | Portfolio plan accepted |
| PA-020 | V0.2 | Governed sample dataset | Enough records to test normalization without customer leakage. | PA-010 |
| PA-030 | V0.3 | Dependency taxonomy | Taxonomy validated against real portfolio records. | PA-020 |
| PA-040 | V0.4 | Accumulation Engine | Reproducible outputs; missing data explicit. | PA-030 |
| PA-050 | V0.5 | Portfolio Workbench | Portfolio actor validates decision usefulness. | PA-040 |
| PA-060 | V0.6 | Advisory/change propagation | One real systemic-change exercise. | PA-050 |
| PA-070 | V0.7 | Incident/outcome aggregation | Outcome semantics and rights validated. | PA-060 |
| PA-080 | V0.8 | Scenario overlays | Scenario provenance/model governance. | PA-070 |
| PA-090 | V0.9 | Capacity workflow integration | Real capacity workflow. | PA-080 |
| PA-100 | V1.0 | Paid Portfolio Intelligence | Paid portfolio actor + recurring decisions. | PA-090 |
| PA-110 | V1.5 | Cross-portfolio benchmarks | Large governed dataset. | PA-100 |

## Rules
- One implementation scope per PR.
- Synthetic UI cannot satisfy a real-actor/artifact gate.
- Actor-specific schema waits for recurring real objects.
- Engineering verification is not data/export or human authority approval.
- Reuse shared truth; do not create product-specific copies.

## Immediate next
Do not build beyond the data contract until a real portfolio/capacity actor and authorized multi-account data exist.
