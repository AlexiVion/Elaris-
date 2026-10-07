# A03 — AI / Software / Model Provider

**Lifecycle:** AI / software supply  
**Evidence status:** `ARCHETYPE_HYPOTHESIS` unless a pilot explicitly proves otherwise.

## Role
Provides control software, autonomy, models, policies, perception or orchestration.

## Decisions
- release build/model/policy
- runtime assumptions
- affected deployments after change

## Triggers
- release/model update
- dependency change
- bug/security advisory
- performance finding

## Inputs
- commit/build/model identity
- runtime dependencies
- evaluation evidence
- deployment context
- feedback

## Outputs
- release artifact
- model/evaluation report
- change note
- rollback guidance

## Pain hypothesis
- software identity detached from physical deployment
- evaluation disconnected from runtime context
- hard downstream reconciliation

## Authority boundary
Owns software/model release; deployment acceptance remains actor-specific.

## Elaris relationship
**Primary:** [Product & Field Evidence](../../product/product-field-evidence/README.md)

**Relevant:** [Deployment Control / Deployment & Change Evidence](../../product/deployment-control/README.md), [Cyber / OT Change Assurance](../../product/cyber-ot-change-assurance/README.md), [Safety Change Control](../../product/safety-change-control/README.md), [Incident Reconstruction](../../product/incident-reconstruction/README.md), [Risk Intelligence](../../product/risk-intelligence/README.md)

## Artifacts to request
- release manifest
- model/evaluation report
- SBOM
- build record
- advisory

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
