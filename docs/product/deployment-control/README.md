# Deployment Control / Deployment & Change Evidence

**Product status:** `PILOT / LIVE REFERENCE PRODUCT`  
**Primary actor:** [A04](../../industry/archetypes/robotics-integrator.md) · [A05](../../industry/archetypes/deployer-raas.md)

## Core decision
> What is actually deployed, under which exact configuration, what evidence/approvals support it, and what deserves review when it changes?

## Triggers
- new deployment
- new configuration
- hardware/software/model/task/environment change
- evidence or approval change
- incident/service event

## Selected first real case

The first real reconciliation case is **the Humandroid Unitree G1 hosted at Universidad Siglo 21 under an institutional agreement**. It is not a task-specific production deployment. This case already exposed a domain-model gap: the current schema requires Customer + Site + Task, which would force invented semantics.

See [Siglo 21 / Humandroid Institutional Placement V0](cases/siglo21-humandroid-institutional-placement-v0.md).

## Evidence today
Reference application already implements versioned configuration snapshots, baselines, evidence/requirements/approvals, deterministic diff/impact/readiness/coverage, change workflow, incidents, reports, share view and audit. Humandroid is the first design/pilot partner. These engineering capabilities do not yet equal a repeated validated commercial workflow.

## Shared Elaris truth
Organization, Robot, ConfigurationSnapshot/ConfigItem, Deployment, Baseline, Evidence, Requirement, Approval, Change/ImpactItem, Incident, Audit, Share.

## Deterministic core
Canonical hashes, before/after diff, impact rules, readiness, evidence coverage, immutable baseline reconstruction.

## AI role
Optional extraction, intake assistance, evidence summarization and suggested linking. AI never approves a change or replaces deterministic impact.

## Human authority
Integrator/deployer humans, Safety Lead, customer engineer and other named reviewers. Elaris never certifies or approves autonomously.

## Component Health leverage
Component Health adds proven provenance, evidence-quality, human-review, field-evidence and artifact-workbench patterns that can deepen Deployment Control without changing its core ownership.

## Boundaries
Not PLM, CMMS, fleet telemetry, robot control, certification authority or automated risk score.

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
Execute V0.5 using the [real Siglo 21 / Humandroid institutional placement](cases/siglo21-humandroid-institutional-placement-v0.md). First correct the domain model so it does not require a fictional commercial Customer or production Task.
