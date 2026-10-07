# A10 — Cyber / IT / OT Security

**Lifecycle:** Cross-cutting cyber/OT  
**Evidence status:** `ARCHETYPE_HYPOTHESIS` unless a pilot explicitly proves otherwise.

## Role
Owns/reviews network connectivity, identities, software exposure, remote access and controls.

## Decisions
- connectivity/access/software change requiring review
- network admission
- required controls/exceptions

## Triggers
- site onboarding
- network change
- software update
- remote access
- security advisory

## Inputs
- network architecture
- asset/software identity
- SBOM/version
- access paths
- vulnerability evidence

## Outputs
- security review
- required controls
- exception/approval
- re-review trigger

## Pain hypothesis
- poor versioning of robot software/network
- missing deployment context
- exceptions outlive configs

## Authority boundary
Cyber/OT authority within organization, not robot safety authority.

## Elaris relationship
**Primary:** [Cyber / OT Change Assurance](../../product/cyber-ot-change-assurance/README.md)

**Relevant:** [Deployment Control / Deployment & Change Evidence](../../product/deployment-control/README.md), [Operational Readiness](../../product/operational-readiness/README.md), [Product & Field Evidence](../../product/product-field-evidence/README.md), [Incident Reconstruction](../../product/incident-reconstruction/README.md)

## Artifacts to request
- network diagram
- asset inventory
- SBOM
- security assessment
- exception ticket

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
