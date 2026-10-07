# A09 — Safety / EHS

**Lifecycle:** Cross-cutting safety  
**Evidence status:** `ARCHETYPE_HYPOTHESIS` unless a pilot explicitly proves otherwise.

## Role
Evaluates hazards, controls, tests and safety-related change.

## Decisions
- hazards/controls/tests to re-review
- continued validity of safety acceptance
- additional evidence

## Triggers
- new deployment
- hazard review
- material change
- incident

## Inputs
- hazard analysis
- change diff
- test evidence
- operating limits
- incident findings

## Outputs
- review findings
- required controls/tests
- named safety decision

## Pain hypothesis
- manual trace from change to safety evidence
- missing config context
- weak re-test linkage

## Authority boundary
Human safety authority; Elaris never declares safe/certified.

## Elaris relationship
**Primary:** [Safety Change Control](../../product/safety-change-control/README.md)

**Relevant:** [Deployment Control / Deployment & Change Evidence](../../product/deployment-control/README.md), [Operational Readiness](../../product/operational-readiness/README.md), [Evidence Review](../../product/evidence-review/README.md), [Incident Reconstruction](../../product/incident-reconstruction/README.md), [Component Health](../../product/component-health/README.md)

## Artifacts to request
- risk assessment
- hazard log
- validation test
- safety-case excerpt
- approval/waiver

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
