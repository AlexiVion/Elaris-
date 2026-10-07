# A13 — Maintenance / Repair / Field Service

**Lifecycle:** Maintenance  
**Evidence status:** `ARCHETYPE_HYPOTHESIS` unless a pilot explicitly proves otherwise.

## Role
Inspects, services, repairs or replaces components and records what changed.

## Decisions
- inspect/service target
- intervention delta
- checks before return to operation

## Triggers
- alert/observation
- scheduled service
- failure
- incident
- replacement

## Inputs
- component/config identity
- telemetry/evidence
- service history
- OEM guidance
- context

## Outputs
- inspection finding
- work performed
- parts/config delta
- test result
- service sign-off

## Pain hypothesis
- service records detached from software/config
- free-text findings
- poor before/after reconstruction

## Authority boundary
Qualified human/organization owns service decision; Elaris does not declare fit-for-service autonomously.

## Elaris relationship
**Primary:** [Service & Configuration History](../../product/service-configuration-history/README.md), [Component Health](../../product/component-health/README.md)

**Relevant:** [Deployment Control / Deployment & Change Evidence](../../product/deployment-control/README.md), [Operational Readiness](../../product/operational-readiness/README.md), [Incident Reconstruction](../../product/incident-reconstruction/README.md), [Product & Field Evidence](../../product/product-field-evidence/README.md)

## Artifacts to request
- work order
- inspection sheet
- parts record
- test/calibration result
- service sign-off

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
