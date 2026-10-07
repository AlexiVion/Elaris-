# Asset Monitoring — Execution Backlog

| ID | Version | Work package | Acceptance | Dependency |
|---|---|---|---|---|
| AM-010 | V0.1 | Asset relationship model | Stable linkage supports historical lookup. | Portfolio plan accepted |
| AM-020 | V0.2 | Real financed-asset case | Economic owner identifies material technical events and artifacts. | AM-010 |
| AM-030 | V0.3 | Material Event Contract | No automatic economic materiality. | AM-020 |
| AM-040 | V0.4 | Asset History Engine | Historical state reproducible. | AM-030 |
| AM-050 | V0.5 | Economic Owner Workbench | One real asset case navigable. | AM-040 |
| AM-060 | V0.6 | Condition / covenant review | No valuation/credit decision produced. | AM-050 |
| AM-070 | V0.7 | Service/incident/change feed | Real events update owner view with provenance. | AM-060 |
| AM-080 | V0.8 | Controlled asset evidence pack | Data rights verified. | AM-070 |
| AM-090 | V0.9 | Portfolio view | Multiple real financed assets. | AM-080 |
| AM-100 | V1.0 | Paid Asset Monitoring | Paid lender/lessor and repeated use. | AM-090 |
| AM-110 | V1.5 | Finance system integration | Validated system-of-record need. | AM-100 |

## Rules
- One implementation scope per PR.
- Synthetic UI cannot satisfy a real-actor/artifact gate.
- Actor-specific schema waits for recurring real objects.
- Engineering verification is not data/export or human authority approval.
- Reuse shared truth; do not create product-specific copies.

## Immediate next
Interview a leasing/asset-finance actor using one actual robotics/automation asset before defining economic metrics.
