# Operational Readiness

**Product status:** `HYPOTHESIS · VISUAL PROTOTYPE`  
**Primary actor:** [A06](../../industry/archetypes/enterprise-buyer.md) · [A08](../../industry/archetypes/site-operations.md) · [A07](../../industry/archetypes/procurement.md)

## Core decision
> Can this system enter or continue operation here, under what conditions, what remains open, and what changed since acceptance?

## Triggers
- new pilot/go-live
- site onboarding
- acceptance review
- material change
- return after service
- renewal/expansion

## Evidence today
A visual prototype exists over shared demo truth. The repo has deterministic readiness/coverage concepts, but no real enterprise acceptance workflow has been reconstructed yet.

## Shared Elaris truth
Deployment, Configuration, Baseline, Evidence, Requirement, Approval, Change, Incident, Audit.

## Deterministic core
Gate completeness, required-item status, config-vs-accepted-baseline comparison, expiry/due checks and change deltas. Readiness semantics must be actor-validated.

## AI role
Extraction and summary of acceptance packs; suggested mapping from artifacts to gates. No autonomous acceptance.

## Human authority
Enterprise/site/procurement humans and named specialist approvers; Elaris records acceptance conditions, never decides safe/compliant.

## Component Health leverage
Reuse Component Health evidence quality/provenance and Deployment Control baseline/change truth so acceptance can be tied to exact system state.

## Boundaries
Not safety certification, procurement ERP, fleet control or generic compliance score.

## Product operating model
```text
trigger → exact system/context → evidence/requirements → actor work
→ deterministic/AI assistance → named human decision → versioned output
→ later change/outcome reopens only what is materially affected
```

## Planning
- [Roadmap](roadmap.md)
- [Version Registry](version-registry.md)
- [Execution Backlog](execution-backlog.md)
- [Portfolio method](../../portfolio/planning-method.md)

## Next action
Interview a real buyer/site operator and reconstruct the last robot go-live before persisting Acceptance objects.
