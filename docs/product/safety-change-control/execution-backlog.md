# Safety Change Control — Execution Backlog

Tasks are ordered by evidence dependency, not feature desirability.

| ID | Version | Task | Acceptance | Dependency |
|---|---|---|---|---|
| SC-010 | V0.1 | Safety change lens | Clear non-claims and shared truth only. | Portfolio plan accepted |
| SC-020 | V0.2 | Real safety-change reconstruction | Safety actor confirms actual process and decision points. | SC-010 |
| SC-030 | V0.3 | Hazard/Control/Review contract | Schema proposal maps 1:1 to recurring records. | SC-020 |
| SC-040 | V0.4 | Deterministic safety-impact mapping | Practitioner-reviewed golden cases; suggestions not conclusions. | SC-030 |
| SC-050 | V0.5 | Safety workbench | One case operated end-to-end. | SC-040 |
| SC-060 | V0.6 | Re-test + re-approval evidence | Old approvals remain immutable; new decisions are explicit. | SC-050 |
| SC-070 | V0.7 | Incident-triggered review | Real incident/change case validates semantics. | SC-060 |
| SC-080 | V0.8 | Safety change pack | Reviewer/data owner approves output. | SC-070 |
| SC-090 | V0.9 | Repeated safety workflows | At least 3 comparable reviews, no unsafe generalization. | SC-080 |
| SC-100 | V1.0 | Paid Safety Change Control | Paid customer + named safety owner + repeated value. | SC-090 |
| SC-110 | V1.5 | Standards/assurance linkage | Real assessor/safety demand. | SC-100 |

## Operating rules
- One implementation scope per PR.
- Real-actor/artifact gates cannot be replaced by synthetic UI.
- Actor-specific persistence waits for recurring real objects.
- Human authority and data/export approval are separate from engineering PASS.
- Shared primitives are reused; shared truth is never copied into actor silos.

## Immediate next
Do not persist Hazard/Control entities until a real Safety/EHS artifact set is reviewed.
