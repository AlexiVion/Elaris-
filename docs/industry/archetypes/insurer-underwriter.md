# A15 — Insurer / MGA / MGU / Underwriter / Risk Engineer

**Lifecycle:** Risk selection  
**Evidence status:** `ARCHETYPE_HYPOTHESIS` unless a pilot explicitly proves otherwise.

## Role
Evaluates exposure/evidence for human underwriting/referral/condition decisions.

## Decisions
- understanding of exposure
- open questions/conditions
- material-change re-review

## Triggers
- submission
- renewal
- referral
- material change
- incident/loss

## Inputs
- technical submission
- deployment/config
- evidence
- controls
- incident/loss history

## Outputs
- questions
- conditions
- referral
- authorized underwriting decision

## Pain hypothesis
- submission differs from deployed truth
- post-review change invisible
- provenance varies

## Authority boundary
Authorized underwriter decides; Elaris never quotes, binds or decides coverage.

## Elaris relationship
**Primary:** [Underwriting Workspace](../../product/underwriting-workspace/README.md)

**Relevant:** [Placement Workspace](../../product/placement-workspace/README.md), [Portfolio / Accumulation Intelligence](../../product/portfolio-accumulation-intelligence/README.md), [Risk Intelligence](../../product/risk-intelligence/README.md), [Incident Reconstruction](../../product/incident-reconstruction/README.md)

## Artifacts to request
- underwriting file
- risk engineering report
- conditions
- decision record
- renewal review

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
