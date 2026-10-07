# Operational Readiness — Execution Backlog

Tasks are ordered by evidence dependency, not feature desirability.

| ID | Version | Task | Acceptance | Dependency |
|---|---|---|---|---|
| OR-010 | V0.1 | Readiness lens | Prototype exposes missing/review/ready without inventing compliance. | Portfolio plan accepted |
| OR-020 | V0.2 | Real go-live reconstruction | Actor confirms actual gates, owners, artifacts and outputs. | OR-010 |
| OR-030 | V0.3 | Acceptance Domain Contract | Objects match real artifacts and authority boundaries. | OR-020 |
| OR-040 | V0.4 | Deterministic Readiness Engine | Golden cases reviewed by buyer/operator; no compliance score. | OR-030 |
| OR-050 | V0.5 | Acceptance Workbench | One real case can be reviewed end-to-end without spreadsheets. | OR-040 |
| OR-060 | V0.6 | Human acceptance persistence | Save→reopen preserves authority and exact baseline. | OR-050 |
| OR-070 | V0.7 | Change / re-acceptance | Real change demonstrates re-review semantics. | OR-060 |
| OR-080 | V0.8 | Readiness Pack delivery | Data owner approves recipient/purpose. | OR-070 |
| OR-090 | V0.9 | Multi-site templates | Repeated sites show stable common core plus local variance. | OR-080 |
| OR-100 | V1.0 | Paid readiness workflow | Paid repeated use and measurable cycle-time reduction. | OR-090 |
| OR-110 | V1.5 | Enterprise integrations | Validated source-system pain and security requirements. | OR-100 |

## Operating rules
- One implementation scope per PR.
- Real-actor/artifact gates cannot be replaced by synthetic UI.
- Actor-specific persistence waits for recurring real objects.
- Human authority and data/export approval are separate from engineering PASS.
- Shared primitives are reused; shared truth is never copied into actor silos.

## Immediate next
Interview a real buyer/site operator and reconstruct the last robot go-live before persisting Acceptance objects.
