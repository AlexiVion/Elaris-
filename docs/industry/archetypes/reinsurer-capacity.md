# A16 — Reinsurer / Capacity / Portfolio Risk

**Lifecycle:** Portfolio / capacity  
**Evidence status:** `ARCHETYPE_HYPOTHESIS` unless a pilot explicitly proves otherwise.

## Role
Looks across risks for accumulation, dependency and systemic exposure.

## Decisions
- concentrations/dependencies
- capacity exposed to common technology
- support for assumptions

## Triggers
- portfolio review
- capacity renewal
- large account
- systemic event/advisory

## Inputs
- normalized exposures
- dependency graph
- authorized insurance metadata
- incident/outcomes

## Outputs
- accumulation view
- portfolio questions
- capacity conditions
- monitoring priorities

## Pain hypothesis
- technical dependencies not normalized
- portfolio lacks exact version context
- systemic change discovered late

## Authority boundary
Portfolio/capacity decisions remain human and insurance-system specific.

## Elaris relationship
**Primary:** [Portfolio / Accumulation Intelligence](../../product/portfolio-accumulation-intelligence/README.md)

**Relevant:** [Underwriting Workspace](../../product/underwriting-workspace/README.md), [Risk Intelligence](../../product/risk-intelligence/README.md), [Product & Field Evidence](../../product/product-field-evidence/README.md), [Incident Reconstruction](../../product/incident-reconstruction/README.md)

## Artifacts to request
- exposure bordereau
- portfolio analysis
- accumulation report
- capacity memo

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
