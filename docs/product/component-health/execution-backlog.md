# Component Health — Execution Backlog

| ID | Version | Work package | Acceptance | Dependency |
|---|---|---|---|---|
| CH-010 | V0.1 | Observed Baseline + Field Evidence | Real capture chain works without command/control. | Portfolio plan accepted |
| CH-020 | V0.2 | Real-data-derived demo | UI reflects supported sanitized aggregates and explicit boundaries. | CH-010 |
| CH-030 | V0.2.1 | Provenance / hygiene closeout | No synthetic legacy claim leaks into active workflow. | CH-020 |
| CH-040 | V0.3 | Reproducible Evidence Engine | Repeated run gives deterministic output on real private dataset. | CH-030 |
| CH-050 | V0.4 | Private Audit Workbench | Real private evidence can be reviewed without hardcoded active data. | CH-040 |
| CH-060 | V0.4.1 | Human Review & Persistence | Save→refresh persistence and gates validated. | CH-050 |
| CH-070 | V0.4.2 | Technical Semantics | 29-DOF context resolved; unresolved physical wrist remains explicit. | CH-060 |
| CH-080 | V0.4.3 | Offline Robustness & Field Instrumentation | 36/36 CH tests, build PASS; physical questions gated on next robot session. | CH-070 |
| CH-090 | V0.5 | Delivery & Export | Data owner approves recipient/purpose; no sensitive leak. | CH-080 |
| CH-100 | V0.6 | Comparable Sessions | 2+ comparable captures same robot/config/context. | CH-090 |
| CH-110 | V0.7 | Field Audit Operations | At least two repeated audits. | CH-100 |
| CH-120 | V0.8 | Service Findings & Outcomes | Real maintenance/service case and named authority. | CH-110 |
| CH-130 | V0.9 | Secure Partner Pilot | Partner security/data requirements validated. | CH-120 |
| CH-140 | V1.0 | Repeatable Paid Field Evidence | ≥1 paid pilot and repeated delivery with clear limits. | CH-130 |
| CH-150 | V1.5 | Multi-OEM | Second OEM demanded and field-tested. | CH-140 |
| CH-160 | V2.0 | Component Evidence Operations | Findings lead to measured human actions/outcomes. | CH-150 |
| CH-170 | V2.5 | Reliability Cohorts | Sufficient governed cohort. | CH-160 |
| CH-180 | V3.0 | Optional Prognostic Intelligence | Failure/service labels, censoring/exposure, temporal validation and governance. | CH-170 |

## Rules
- One implementation scope per PR.
- Synthetic UI cannot satisfy a real-actor/artifact gate.
- Actor-specific schema waits for recurring real objects.
- Engineering verification is not data/export or human authority approval.
- Reuse shared truth; do not create product-specific copies.

## Immediate next
Keep engineering parked at V0.4.3 until robot access enables CH-G1-002; parallel work may plan V0.5 data/export governance but cannot approve export.
