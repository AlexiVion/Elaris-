# Incident Reconstruction — Execution Backlog

Tasks are ordered by evidence dependency, not feature desirability.

| ID | Version | Task | Acceptance | Dependency |
|---|---|---|---|---|
| IR-010 | V0.1 | Incident lens | No causation/liability claims. | Portfolio plan accepted |
| IR-020 | V0.2 | Real chronology reconstruction | Investigators confirm first-hour workflow and gaps. | IR-010 |
| IR-030 | V0.3 | Reconstruction Domain Contract | Maps real evidence and uncertainty. | IR-020 |
| IR-040 | V0.4 | State-at-time engine | Golden replay reconstructs exact historical state. | IR-030 |
| IR-050 | V0.5 | Timeline workbench | Real chronology navigable without hiding uncertainty. | IR-040 |
| IR-060 | V0.6 | Custody/provenance layer | Evidence lineage verified and human-reviewed. | IR-050 |
| IR-070 | V0.7 | Investigation findings | Evidence classes prevent inference→fact promotion. | IR-060 |
| IR-080 | V0.8 | Controlled reconstruction report | Data/legal approval for recipient. | IR-070 |
| IR-090 | V0.9 | Multi-source connectors | At least two real reconstructions justify sources. | IR-080 |
| IR-100 | V1.0 | Paid Reconstruction Workspace | Paid/repeated use and measurable time saved. | IR-090 |
| IR-110 | V1.5 | Cross-incident learning | Governed incident cohort and reuse rights. | IR-100 |

## Operating rules
- One implementation scope per PR.
- Real-actor/artifact gates cannot be replaced by synthetic UI.
- Actor-specific persistence waits for recurring real objects.
- Human authority and data/export approval are separate from engineering PASS.
- Shared primitives are reused; shared truth is never copied into actor silos.

## Immediate next
Reconstruct one real incident or near-miss before building persistent forensic entities.
