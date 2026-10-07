# A14 — Insurance Broker / PAS / Wholesale Broker

**Lifecycle:** Risk placement  
**Evidence status:** `ARCHETYPE_HYPOTHESIS` unless a pilot explicitly proves otherwise.

## Role
Builds market-facing submission, gathers missing information and coordinates markets/renewals.

## Decisions
- technical risk description
- missing information
- changes to disclose

## Triggers
- new placement
- renewal
- market question
- material change
- loss

## Inputs
- deployment/exposure truth
- evidence
- incident history
- client answers
- coverage context

## Outputs
- submission
- information request
- market response
- renewal change summary

## Pain hypothesis
- technical story rebuilt repeatedly
- questions bounce via email
- renewal comparison hard

## Authority boundary
Controls submission workflow but does not underwrite/bind unless separately authorized.

## Elaris relationship
**Primary:** [Placement Workspace](../../product/placement-workspace/README.md)

**Relevant:** [Deployment Control / Deployment & Change Evidence](../../product/deployment-control/README.md), [Underwriting Workspace](../../product/underwriting-workspace/README.md), [Incident Reconstruction](../../product/incident-reconstruction/README.md), [Asset Monitoring](../../product/asset-monitoring/README.md)

## Artifacts to request
- submission
- proposal form
- market Q&A
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
