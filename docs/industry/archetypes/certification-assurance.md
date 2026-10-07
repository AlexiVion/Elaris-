# A11 — Test Lab / Certification / Conformity / Independent Assurance

**Lifecycle:** Cross-cutting assurance  
**Evidence status:** `ARCHETYPE_HYPOTHESIS` unless a pilot explicitly proves otherwise.

## Role
Reviews scope/evidence, raises findings and records independent decisions.

## Decisions
- assessment scope
- evidence sufficiency
- open findings
- change impact to prior assessment

## Triggers
- assessment request
- evidence submission
- finding response
- material change
- reassessment

## Inputs
- scope/config
- requirements mapping
- test evidence
- technical dossier
- change history

## Outputs
- findings
- assessment report
- certificate/attestation if authorized
- reassessment request

## Pain hypothesis
- scope/version drift
- manual change reconstruction
- finding closure lacks lineage

## Authority boundary
Only authorized body issues formal decisions; Elaris records but does not certify.

## Elaris relationship
**Primary:** [Evidence Review](../../product/evidence-review/README.md)

**Relevant:** [Deployment Control / Deployment & Change Evidence](../../product/deployment-control/README.md), [Safety Change Control](../../product/safety-change-control/README.md), [Operational Readiness](../../product/operational-readiness/README.md), [Product & Field Evidence](../../product/product-field-evidence/README.md)

## Artifacts to request
- scope statement
- test report
- technical file
- finding log
- assessment/certificate

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
