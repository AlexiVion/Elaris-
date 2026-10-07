# Placement Workspace — Execution Backlog

Tasks are ordered by evidence dependency, not feature desirability.

| ID | Version | Task | Acceptance | Dependency |
|---|---|---|---|---|
| PL-010 | V0.1 | Full discovery demo | Coherent demo clearly marked hypothesis/synthetic workflow. | Portfolio plan accepted |
| PL-020 | V0.2 | Real placement reconstruction | Broker confirms pains, repeated questions and artifacts. | PL-010 |
| PL-030 | V0.3 | Submission Domain Contract | Objects recur and ownership is clear. | PL-020 |
| PL-040 | V0.4 | Technical Pack Builder | Real placement reduces reconstruction without invented facts. | PL-030 |
| PL-050 | V0.5 | Missing Information workflow | Broker operates a real request loop. | PL-040 |
| PL-060 | V0.6 | Market Q&A | Real market questions handled with provenance. | PL-050 |
| PL-070 | V0.7 | Renewal Change Summary | Real renewal validates material-change workflow. | PL-060 |
| PL-080 | V0.8 | Controlled market share | Data owner approval and broker workflow validated. | PL-070 |
| PL-090 | V0.9 | Broker integrations | Repeated manual source-system friction. | PL-080 |
| PL-100 | V1.0 | Paid Placement Workspace | Paid broker/PAS + repeated submissions/renewal. | PL-090 |
| PL-110 | V1.5 | Multi-market knowledge | Sufficient approved placements. | PL-100 |

## Operating rules
- One implementation scope per PR.
- Real-actor/artifact gates cannot be replaced by synthetic UI.
- Actor-specific persistence waits for recurring real objects.
- Human authority and data/export approval are separate from engineering PASS.
- Shared primitives are reused; shared truth is never copied into actor silos.

## Immediate next
Use the existing demo to reconstruct one real technical placement; do not deepen backend first.
