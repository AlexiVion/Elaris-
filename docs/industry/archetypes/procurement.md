# A07 — Procurement / Strategic Sourcing

**Lifecycle:** Cross-cutting procurement  
**Evidence status:** `ARCHETYPE_HYPOTHESIS` unless a pilot explicitly proves otherwise.

## Role
Runs vendor selection, contractual requirements, evidence collection and purchasing/renewal gates.

## Decisions
- package complete enough to contract
- conditions to close
- changes affecting contract/renewal

## Triggers
- RFP/RFQ
- vendor onboarding
- contract
- renewal
- material change

## Inputs
- technical specs
- requirements
- evidence/certificates
- supplier responses
- commercial/legal conditions

## Outputs
- requirements list
- clarification
- award/renewal record
- contract conditions

## Pain hypothesis
- unstructured evidence
- requirements lose deployment traceability
- renewal repeats intake

## Authority boundary
Commercial sourcing authority; technical judgments remain with specialists.

## Elaris relationship
**Primary:** [Operational Readiness](../../product/operational-readiness/README.md)

**Relevant:** [Deployment Control / Deployment & Change Evidence](../../product/deployment-control/README.md), [Evidence Review](../../product/evidence-review/README.md), [Placement Workspace](../../product/placement-workspace/README.md), [Asset Monitoring](../../product/asset-monitoring/README.md)

## Artifacts to request
- RFP/RFQ
- requirements matrix
- supplier questionnaire
- contract schedule
- renewal pack

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
