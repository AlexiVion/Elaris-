# Safety Change Control

**Product status:** `HYPOTHESIS · VISUAL PROTOTYPE`  
**Primary actor:** [A09](../../industry/archetypes/safety-ehs.md)

## Core decision
> Which hazards, controls, tests, evidence and named safety decisions deserve review after a system change?

## Triggers
- new deployment
- hardware/software/task/site change
- hazard/control update
- incident
- re-test

## Evidence today
Visual prototype plus reusable deterministic Change Evidence. No real safety practitioner workflow/artifact set has yet validated the proposed hazard/control objects.

## Shared Elaris truth
Configuration, Baseline, Requirement, Evidence, Approval, Change, Incident, Audit.

## Deterministic core
Change diff, scope matching, evidence staleness, review-state propagation; safety semantics/rules require human validation.

## AI role
Extract/summarize hazard documents and suggest affected links. Never determine safety acceptability or close hazards.

## Human authority
Named Safety/EHS practitioner according to organization. Elaris never declares SAFE, CERTIFIED or compliant.

## Component Health leverage
Deployment Control gives exact change; Component Health gives evidence provenance/review discipline and explicit non-claim semantics.

## Boundaries
Not safety case authoring authority, certification body, autonomous risk assessment or regulatory advice.

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
Do not persist Hazard/Control entities until a real Safety/EHS artifact set is reviewed.
