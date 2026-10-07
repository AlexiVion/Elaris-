# A20 — Data / Risk Intelligence / Analytics

**Lifecycle:** Cross-lifecycle intelligence  
**Evidence status:** `ARCHETYPE_HYPOTHESIS` unless a pilot explicitly proves otherwise.

## Role
Builds normalized datasets, benchmarks and analytical products from governed multi-case evidence/outcomes.

## Decisions
- cohort comparability
- defensible patterns
- allowed reuse purpose

## Triggers
- sufficient governed dataset
- portfolio question
- benchmark request
- model research

## Inputs
- normalized deployments/configs
- evidence quality
- events/outcomes
- permissions/provenance
- cohort metadata

## Outputs
- benchmark
- cohort analysis
- research finding
- model/evaluation if justified

## Pain hypothesis
- heterogeneous data
- selection bias
- missing labels
- permissions differ
- context lost in aggregation

## Authority boundary
Analytics inform humans; correlations cannot become safety/insurance/legal authority.

## Elaris relationship
**Primary:** [Risk Intelligence](../../product/risk-intelligence/README.md)

**Relevant:** [Portfolio / Accumulation Intelligence](../../product/portfolio-accumulation-intelligence/README.md), [Component Health](../../product/component-health/README.md), [Underwriting Workspace](../../product/underwriting-workspace/README.md), [Product & Field Evidence](../../product/product-field-evidence/README.md)

## Artifacts to request
- data dictionary
- cohort definition
- benchmark report
- model card/evaluation

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
