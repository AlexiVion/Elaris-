# Incident Reconstruction

**Product status:** `HYPOTHESIS · VISUAL PROTOTYPE`  
**Primary actor:** [A18](../../industry/archetypes/claims-forensics.md)

## Core decision
> What exactly was deployed, what changed, what happened when, which evidence is reliable, and what remains unknown at incident time?

## Triggers
- incident
- claim
- near miss
- dispute
- internal/regulatory investigation

## Evidence today
Visual prototype exists. Shared baselines/config/change/incident data plus Component Health timing/provenance patterns create a strong technical foundation, but no real incident reconstruction has validated the workflow.

## Shared Elaris truth
Incident, Robot, Deployment, Baseline, Configuration, Change, Evidence, Approval, Audit.

## Deterministic core
State-at-time reconstruction, config/baseline lookup, event ordering where clocks permit, provenance integrity and source-gap detection.

## AI role
Timeline summarization, document/log extraction, source cross-reference suggestions. No causation/liability conclusion.

## Human authority
Human investigator, claims professional, forensic expert or legal authority.

## Component Health leverage
CH V0.4.3 capture lifecycle, timing provenance and diagnostics directly inform multi-source reconstruction design.

## Boundaries
Not legal causation engine, claims adjudicator, black-box recorder or forensic acquisition replacement.

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
Reconstruct one real incident or near-miss before building persistent forensic entities.
