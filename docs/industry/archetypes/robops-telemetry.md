# A19 — RobOps / Fleet / Telemetry / Observability Provider

**Lifecycle:** Operational tooling  
**Evidence status:** `ARCHETYPE_HYPOTHESIS` unless a pilot explicitly proves otherwise.

## Role
Provides runtime telemetry, fleet operations, alerts or robot-management systems as evidence sources.

## Decisions
- runtime state
- alerts needing response
- retained/exportable history

## Triggers
- runtime event
- alert
- fleet action
- integration/export request

## Inputs
- robot telemetry
- runtime state
- logs
- fleet metadata

## Outputs
- alerts
- dashboards
- telemetry/history
- operational actions in own system

## Pain hypothesis
- runtime tools lack evidence/approval context
- identity/version semantics vary
- retention incomplete

## Authority boundary
Operational tooling authority only; Elaris must not replace fleet monitoring/control.

## Elaris relationship
**Primary:** None assigned yet.

**Relevant:** [Component Health](../../product/component-health/README.md), [Service & Configuration History](../../product/service-configuration-history/README.md), [Incident Reconstruction](../../product/incident-reconstruction/README.md), [Deployment Control / Deployment & Change Evidence](../../product/deployment-control/README.md), [Risk Intelligence](../../product/risk-intelligence/README.md)

## Artifacts to request
- telemetry export
- alert/event
- fleet inventory
- runtime log

## Discovery
Start with: **“Mostrame la última vez que tomaron esta decisión con un sistema Physical AI real.”**

Reconstruct trigger, owner, source systems, artifacts, missing/repeated information, authority, output and what later change reopens the work.

## Validation gates
1. One real person/organization.
2. One recent real decision end-to-end.
3. At least one artifact set.
4. Named human authority and non-claims.
5. Mapping to shared Elaris truth without copying it.
6. Persistence/integration only after recurrence.

## Kill / merge
If there is no distinct recurring job, merge the use case into the adjacent Product System instead of creating another product.
