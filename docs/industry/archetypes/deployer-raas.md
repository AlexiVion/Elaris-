# A05 — Deployer / RaaS Operator

**Lifecycle:** Deployment / fleet ownership  
**Evidence status:** `ARCHETYPE_HYPOTHESIS` unless a pilot explicitly proves otherwise.

## Role
Owns/operates robot deployments across sites and coordinates continuity, rollout and service.

## Decisions
- config by site
- rollout target
- required service/evidence before continuation

## Triggers
- go-live
- fleet rollout
- change
- incident
- maintenance
- renewal

## Inputs
- deployment/config truth
- site conditions
- service records
- evidence/approvals
- operational events

## Outputs
- deployment state
- rollout decision
- service/hold decision
- customer evidence

## Pain hypothesis
- fleet truth diverges
- rollout/evidence disconnected
- service outcomes not linked to config

## Authority boundary
Controls deployment/operations subject to customer, safety and regulation.

## Elaris relationship
**Primary:** [Deployment Control / Deployment & Change Evidence](../../product/deployment-control/README.md)

**Relevant:** [Component Health](../../product/component-health/README.md), [Service & Configuration History](../../product/service-configuration-history/README.md), [Operational Readiness](../../product/operational-readiness/README.md), [Asset Monitoring](../../product/asset-monitoring/README.md), [Incident Reconstruction](../../product/incident-reconstruction/README.md)

## Artifacts to request
- fleet roster
- runbook
- rollout record
- service record
- site acceptance

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
