# A02 — Robot OEM

**Lifecycle:** Robot manufacture  
**Evidence status:** `ARCHETYPE_HYPOTHESIS` unless a pilot explicitly proves otherwise.

## Role
Designs, manufactures and supports robot platform, firmware and OEM interfaces.

## Decisions
- supported hardware/firmware configs
- revision changes
- service action
- authoritative telemetry semantics

## Triggers
- robot release
- firmware update
- service bulletin
- field failure
- integration request

## Inputs
- BOM/config
- firmware/SDK
- OEM telemetry
- test evidence
- service history

## Outputs
- release/support package
- SDK contract
- service bulletin
- repair guidance

## Pain hypothesis
- downstream configs invisible
- semantics fragmented
- field evidence lacks provenance

## Authority boundary
Authority for OEM specifications/support, not site acceptance/certification.

## Elaris relationship
**Primary:** [Product & Field Evidence](../../product/product-field-evidence/README.md)

**Relevant:** [Deployment Control / Deployment & Change Evidence](../../product/deployment-control/README.md), [Component Health](../../product/component-health/README.md), [Service & Configuration History](../../product/service-configuration-history/README.md), [Incident Reconstruction](../../product/incident-reconstruction/README.md), [Cyber / OT Change Assurance](../../product/cyber-ot-change-assurance/README.md)

## Artifacts to request
- BOM/config manifest
- firmware release
- SDK docs
- service bulletin
- diagnostic record

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
