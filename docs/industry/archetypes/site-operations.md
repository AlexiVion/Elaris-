# A08 — Site Operations / Operator

**Lifecycle:** Operation  
**Evidence status:** `ARCHETYPE_HYPOTHESIS` unless a pilot explicitly proves otherwise.

## Role
Runs the site and day-to-day operational constraints.

## Decisions
- operate now
- restrictions/holds
- changes since local acceptance

## Triggers
- shift/startup
- site change
- robot change
- incident
- maintenance return

## Inputs
- accepted config
- operating limits
- site conditions
- open findings
- service/incident state

## Outputs
- operational acceptance/hold
- observations
- incident/service escalation

## Pain hypothesis
- accepted vs current hard to compare
- limits live in documents
- service/change detached

## Authority boundary
Operational authority under site procedures.

## Elaris relationship
**Primary:** [Operational Readiness](../../product/operational-readiness/README.md)

**Relevant:** [Deployment Control / Deployment & Change Evidence](../../product/deployment-control/README.md), [Component Health](../../product/component-health/README.md), [Service & Configuration History](../../product/service-configuration-history/README.md), [Safety Change Control](../../product/safety-change-control/README.md), [Incident Reconstruction](../../product/incident-reconstruction/README.md)

## Artifacts to request
- SOP/runbook
- operation record
- acceptance checklist
- incident report

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
