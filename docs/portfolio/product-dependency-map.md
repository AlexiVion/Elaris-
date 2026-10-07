# Elaris — Product Dependency & Flywheel Map

## Layer model

```text
L0 — Shared technical truth / enabling infrastructure
Robot · Configuration · Deployment · Baseline · Evidence · Change · Incident
Robot Adapter · Edge Collector · provenance · deterministic engines
                           │
                           ▼
L1 — System / operational truth products
Deployment Control
Component Health
Service & Configuration History
Product & Field Evidence
                           │
                           ▼
L2 — Acceptance / assurance products
Operational Readiness
Safety Change Control
Evidence Review
Cyber / OT Change Assurance
Incident Reconstruction
                           │
                           ▼
L3 — Economic / risk workflow products
Placement Workspace
Underwriting Workspace
Asset Monitoring
                           │
                           ▼
L4 — Portfolio / intelligence
Portfolio / Accumulation Intelligence
Risk Intelligence
```

Layer is a dependency heuristic, not a commercial ranking. Products can be sold independently if their actor/job is validated.

## Product facts created and downstream leverage

| Product | Reuses | New structured facts it may create | High-value downstream consumers |
|---|---|---|---|
| Deployment Control | identity/config/evidence | baselines, change diffs, impact/review history | almost all products |
| Component Health | robot/config/deployment | capture/analysis evidence, quality/review state, component observations | Service, Readiness, Incident, Product Evidence, future Intelligence |
| Service & Configuration History | config/change/CH evidence | intervention, parts/config delta, inspection/test/outcome | Deployment, Readiness, Asset, Incident, Product Evidence |
| Product & Field Evidence | config/deployments/field feedback | releases, advisories, affected-system links | Deployment, Cyber, Safety, Assurance, Portfolio |
| Operational Readiness | deployment/evidence/approvals | acceptance gates, conditions, named decision | Deployment, Buyer, Asset, Placement |
| Safety Change Control | change/evidence | hazards/controls/re-tests/re-approvals if validated | Readiness, Evidence Review, Incident |
| Evidence Review | evidence/requirements/change | assessment scope, findings/corrections/decision if validated | Deployment, Readiness, Safety |
| Cyber / OT | config/software/network change | cyber review, control/exception, named approval if validated | Readiness, Deployment, Underwriting |
| Incident Reconstruction | all historical truth | timeline, unknowns, source assertions, reconstruction | Claims, Underwriting, Product Evidence, Intelligence |
| Placement | technical truth + insurance context | submission versions, market questions/responses | Underwriting, renewal workflow |
| Underwriting | submission + exposure truth | questions, conditions, referral/decision records | Portfolio/Accumulation, renewal |
| Asset Monitoring | asset + technical history | economic-owner review/material-event records | finance portfolio, placement/underwriting where authorized |
| Portfolio/Accumulation | authorized normalized exposures | concentration/dependency views | capacity/reinsurance, Risk Intelligence |
| Risk Intelligence | governed cross-product outcomes | cohorts, benchmarks, model evidence if justified | product feedback loops |

## Dependency rules

1. A downstream product references upstream truth; it does not fork it.
2. A product may create actor-specific records, but they become shared only after recurrence and stable semantics.
3. Data access rights do not propagate automatically because a relationship exists.
4. A downstream decision never retroactively changes the provenance of upstream evidence.
5. Cross-product intelligence must preserve product, actor, configuration, time and evidence class.

## Highest-leverage near-term loops

### Deployment → Service → Deployment
Change/service history improves baseline truth; service never creates a parallel configuration record.

### Component Health → Service → Outcome
Observed evidence opens a human service question; service outcome becomes future evidence without converting the original signal into diagnosis.

### Deployment → Readiness → Change → Re-readiness
Accepted baseline gives a stable comparison point; material changes reopen human gates.

### Product Evidence → Deployment footprint → Advisory
Version identity can locate potentially affected systems; human/vendor authority controls actual advisory action.

### Deployment / Incident → Insurance
Broker/underwriter views can reuse exact technical truth instead of reconstructing it from static submissions.

## Long-term flywheel boundary

The flywheel is not a data moat until Elaris has repeated, permissioned, comparable outcomes across customers. Until then it is an architecture hypothesis.
