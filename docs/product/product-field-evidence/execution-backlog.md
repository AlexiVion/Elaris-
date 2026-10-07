# Product & Field Evidence — Execution Backlog

| ID | Version | Work package | Acceptance | Dependency |
|---|---|---|---|---|
| PF-010 | V0.1 | Product identity contract | Stable IDs can reference existing config without new duplicated robot truth. | Portfolio plan accepted |
| PF-020 | V0.2 | Real release/advisory reconstruction | Vendor actor confirms affected-unit workflow and artifacts. | PF-010 |
| PF-030 | V0.3 | Release Evidence Pack | One real release package reconstructed with provenance. | PF-020 |
| PF-040 | V0.4 | Affected Deployment Engine | Golden cases avoid false matches and preserve unknowns. | PF-030 |
| PF-050 | V0.5 | Vendor Workbench | Real vendor can inspect one case end-to-end. | PF-040 |
| PF-060 | V0.6 | Advisory / notification workflow | No automated recall; recipient list traceable. | PF-050 |
| PF-070 | V0.7 | Field Feedback Loop | At least one field outcome returns to vendor context. | PF-060 |
| PF-080 | V0.8 | Controlled partner evidence share | Data owners authorize sharing. | PF-070 |
| PF-090 | V0.9 | PLM/release integrations | At least two repeated workflows require source integration. | PF-080 |
| PF-100 | V1.0 | Paid Product & Field Evidence | Paid vendor/OEM + repeated cases. | PF-090 |
| PF-110 | V1.5 | Multi-vendor dependency graph | Multiple real vendors/configs and stable identifiers. | PF-100 |

## Rules
- One implementation scope per PR.
- Synthetic UI cannot satisfy a real-actor/artifact gate.
- Actor-specific schema waits for recurring real objects.
- Engineering verification is not data/export or human authority approval.
- Reuse shared truth; do not create product-specific copies.

## Immediate next
Find one real vendor/OEM release or advisory and trace exactly how affected deployed systems are identified today.
