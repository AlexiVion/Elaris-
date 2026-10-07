# Evidence Review — Execution Backlog

Tasks are ordered by evidence dependency, not feature desirability.

| ID | Version | Task | Acceptance | Dependency |
|---|---|---|---|---|
| ER-010 | V0.1 | Assessment lens | No false certification/sufficiency claims. | Portfolio plan accepted |
| ER-020 | V0.2 | Real assessment reconstruction | Real scope, evidence, findings and decision lifecycle documented. | ER-010 |
| ER-030 | V0.3 | Assessment Domain Contract | Objects proven recurring by artifacts. | ER-020 |
| ER-040 | V0.4 | Evidence integrity engine | Deterministic outputs reproducible and assessor-reviewed. | ER-030 |
| ER-050 | V0.5 | Assessor workbench | One real case reviewable end-to-end. | ER-040 |
| ER-060 | V0.6 | Finding lifecycle persistence | Named assessor authority preserved. | ER-050 |
| ER-070 | V0.7 | Change-triggered reassessment | Real change case validates reopen rules. | ER-060 |
| ER-080 | V0.8 | Controlled assessment output | Recipient/purpose/data approval passed. | ER-070 |
| ER-090 | V0.9 | Repeated assessment templates | Multiple real assessments. | ER-080 |
| ER-100 | V1.0 | Paid Evidence Review Workspace | Paid repeated use. | ER-090 |
| ER-110 | V1.5 | Lab/tool integrations | Validated integration demand. | ER-100 |

## Operating rules
- One implementation scope per PR.
- Real-actor/artifact gates cannot be replaced by synthetic UI.
- Actor-specific persistence waits for recurring real objects.
- Human authority and data/export approval are separate from engineering PASS.
- Shared primitives are reused; shared truth is never copied into actor silos.

## Immediate next
Obtain one real assessment/finding package before expanding actor-specific persistence.
