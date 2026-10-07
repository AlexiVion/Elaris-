# A01 — Component / Subsystem / Material Supplier

**Lifecycle:** Upstream supply  
**Evidence status:** `ARCHETYPE_HYPOTHESIS` unless a pilot explicitly proves otherwise.

## Role
Provides physical components, subsystems, materials, firmware-bearing modules or end-effectors.

## Decisions
- product/version/lot release
- affected deployments after defect/advisory
- evidence accompanying a change

## Triggers
- revision/release
- quality escape
- RMA/failure
- customer evidence request

## Inputs
- part/version/lot identity
- specifications/limits
- test/calibration evidence
- release notes/advisories
- field feedback

## Outputs
- release package
- technical evidence
- advisory
- corrective action/RMA

## Pain hypothesis
- version-to-deployment visibility
- field feedback loses config context
- manual evidence redistribution

## Authority boundary
Owns product release/support; does not approve downstream deployment.

## Elaris relationship
**Primary:** [Product & Field Evidence](../../product/product-field-evidence/README.md)

**Relevant:** [Deployment Control / Deployment & Change Evidence](../../product/deployment-control/README.md), [Service & Configuration History](../../product/service-configuration-history/README.md), [Component Health](../../product/component-health/README.md), [Incident Reconstruction](../../product/incident-reconstruction/README.md), [Evidence Review](../../product/evidence-review/README.md)

## Artifacts to request
- release note/ECN
- datasheet
- test report
- calibration record
- advisory/RMA

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
