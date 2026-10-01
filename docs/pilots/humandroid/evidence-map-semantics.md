# Humandroid — Minimum Evidence Map Semantics

## Status

**Proposed for pilot validation. Not yet a claim about Humandroid's real workflow.**

This document defines the smallest semantics we can safely use in the demo before Humandroid validates a real evidence-to-requirement traceability model.

## What we know today

The current MVP already knows:

- which deployment an item belongs to;
- whether an item is Evidence or Requirement;
- its scope slots;
- source;
- owner;
- status;
- criticality;
- URI / file hash when available.

That is enough to show **evidence context**, but not enough to claim explicit requirement traceability.

## What we must NOT claim yet

Until Humandroid validates the relationship, Elaris must not state:

> Evidence A proves Requirement B.

The current model does not contain a direct `Evidence → supports → Requirement` relation.

## Pilot-safe Evidence Map v0

For Sprint 01, the UI may show:

```
Deployment
├── Requirements
│   ├── requirement
│   ├── scope
│   ├── owner
│   └── status
│
└── Evidence
    ├── evidence item
    ├── scope
    ├── owner
    ├── source
    └── status
```

Items may be visually grouped by common deployment and configuration scope.

That grouping means:

> “These items concern the same deployment / configuration area.”

It does **not** mean:

> “This evidence formally satisfies that requirement.”

## Relationship to validate with Humandroid

For one real requirement, ask:

1. What exact evidence is used to satisfy or review it?
2. Can one evidence item support multiple requirements?
3. Can one requirement require multiple evidence items?
4. Who decides that the relationship is valid?
5. Is the relationship version-specific?
6. Does a configuration change invalidate the link or only trigger review?
7. Does the customer use the same relationship as Humandroid internally?

## Candidate future relation

Only if real data confirms it:

```
EvidenceLink
- evidenceId
- requirementId
- relation: SUPPORTS | PARTIALLY_SUPPORTS | REFERENCES
- scope / version context
- confirmedBy
- confirmedAt
- status
```

This is a candidate, **not an implementation commitment**.

## Sprint 01 decision

- Keep the existing schema.
- Do not invent traceability.
- Demo Evidence and Requirements together using deployment + scope context.
- Ask Humandroid to validate one real requirement/evidence chain.
- Build a first-class relation only after that validation.

## Definition of Done

This spike is technically complete when:
- the safe demo semantics are documented;
- the product does not overclaim evidence traceability;
- the exact validation questions are prepared.

The task remains externally **Waiting** until Humandroid validates or rejects the proposed relationship.
