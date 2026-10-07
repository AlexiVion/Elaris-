# A17 — Finance / Leasing / Economic Owner

**Lifecycle:** Asset finance  
**Evidence status:** `ARCHETYPE_HYPOTHESIS` unless a pilot explicitly proves otherwise.

## Role
Provides capital or owns economic exposure to Physical AI assets.

## Decisions
- financed asset/config
- technical event affecting continuity/value
- evidence for covenant/service/remarketing

## Triggers
- origination
- deployment
- service/failure
- material change
- default/remarketing
- renewal

## Inputs
- asset identity
- deployment/config
- service/incident history
- evidence
- valid condition indicators

## Outputs
- asset monitoring record
- information request
- condition review
- continuity/remarketing decision

## Pain hypothesis
- economic asset identity disconnected from config
- events arrive late
- condition evidence inconsistent

## Authority boundary
Financial decisions remain with lender/lessor; Elaris does not value assets or make credit decisions.

## Elaris relationship
**Primary:** [Asset Monitoring](../../product/asset-monitoring/README.md)

**Relevant:** [Deployment Control / Deployment & Change Evidence](../../product/deployment-control/README.md), [Service & Configuration History](../../product/service-configuration-history/README.md), [Component Health](../../product/component-health/README.md), [Incident Reconstruction](../../product/incident-reconstruction/README.md)

## Artifacts to request
- asset schedule
- lease/loan conditions
- condition report
- service history

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
