# Underwriting Workspace

**Product status:** `HYPOTHESIS · CONCEPT PROTOTYPE`  
**Primary actor:** [A15](../../industry/archetypes/insurer-underwriter.md)

## Core decision
> Do we understand the real deployed exposure enough for a human underwriting decision, what questions/conditions remain, and what later changes deserve re-review?

## Triggers
- new submission
- renewal
- referral
- material change
- incident/loss

## Evidence today
Concept prototype exists. No underwriting file has yet shown which Physical AI attributes actually change a decision. Insurance authority boundaries are explicit.

## Shared Elaris truth
Organization, Robot, Deployment, Configuration, Evidence, Requirement, Change, Incident, Audit.

## Deterministic core
Exposure/config identity, provenance, change history, condition/review status. Pricing/coverage decisions remain outside deterministic core.

## AI role
Summarize technical submission, surface evidence, draft questions, retrieve related changes/incidents. No autonomous underwriting decision.

## Human authority
Authorized underwriter/risk engineer; Elaris never quotes, binds, declines or recommends coverage automatically.

## Component Health leverage
Deployment Control and Component Health can give higher-quality technical truth/change provenance than static submissions, pending real underwriter validation.

## Boundaries
Not policy admin, rating engine, broker, actuarial model or coverage authority.

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
Interview an underwriter with an actual robotics/autonomy file before adding underwriting schema.
