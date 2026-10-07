# Placement Workspace

**Product status:** `HYPOTHESIS · DEMO READY`  
**Primary actor:** [A14](../../industry/archetypes/broker-pas.md)

## Core decision
> How do we assemble and maintain the technical risk submission, resolve missing information and answer markets without rebuilding the story?

## Triggers
- new insurance need
- placement
- market question
- material change
- renewal
- loss

## Evidence today
Full realistic demo exists, including submissions/questions/renewals. Broker workflow is not yet field-validated. Shared Elaris technical truth can reduce repeated reconstruction if real broker artifacts confirm it.

## Shared Elaris truth
Organization, Robot, Deployment, Configuration, Evidence, Change, Incident, Share.

## Deterministic core
Version lookup, before/after change summary, provenance, submission version identity. Insurance decision logic is not deterministic Elaris authority.

## AI role
Extract client intake, draft evidence-backed answers, map market questions to existing facts, summarize renewal changes.

## Human authority
Broker/client decides what is submitted; insurer decides quote/coverage. Elaris does not place risk or bind.

## Component Health leverage
Component Health demonstrates controlled evidence/export and technical provenance; Deployment Control supplies reusable exposure truth.

## Boundaries
Not broker of record, policy admin, rating engine, coverage advice or underwriting authority.

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
Use the existing demo to reconstruct one real technical placement; do not deepen backend first.
