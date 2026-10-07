# A18 — Claims / Loss Adjuster / Forensic / Investigation

**Lifecycle:** Incident / claim  
**Evidence status:** `ARCHETYPE_HYPOTHESIS` unless a pilot explicitly proves otherwise.

## Role
Reconstructs what happened and under which exact system state.

## Decisions
- active baseline/config
- prior changes
- reliable evidence and gaps

## Triggers
- incident
- claim
- dispute
- investigation
- regulatory/insurer request

## Inputs
- incident chronology
- deployment baseline
- config/change history
- logs/evidence
- approvals/service records

## Outputs
- reconstruction
- evidence index
- open questions
- investigation/claims report

## Pain hypothesis
- state-at-time hard to reconstruct
- clocks/identities differ
- chain of custody fragmented

## Authority boundary
Human investigator/claims authority; Elaris does not determine causation or liability.

## Elaris relationship
**Primary:** [Incident Reconstruction](../../product/incident-reconstruction/README.md)

**Relevant:** [Deployment Control / Deployment & Change Evidence](../../product/deployment-control/README.md), [Component Health](../../product/component-health/README.md), [Service & Configuration History](../../product/service-configuration-history/README.md), [Underwriting Workspace](../../product/underwriting-workspace/README.md), [Risk Intelligence](../../product/risk-intelligence/README.md)

## Artifacts to request
- FNOL/incident report
- timeline
- forensic/log export
- service/change records
- expert report

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
