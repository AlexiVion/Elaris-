# Component Health

**Product status:** `PILOT ENGINEERING · V0.4.3 VERIFIED_LOCAL / READY_FOR_FIELD`  
**Primary actor:** [A13](../../industry/archetypes/maintenance-field-service.md) · [A04](../../industry/archetypes/robotics-integrator.md) · [A05](../../industry/archetypes/deployer-raas.md)

## Core decision
> Which components deserve attention, what evidence supports that attention, what remains unknown, and what happened after human inspection/service?

## Triggers
- field evidence session
- telemetry/service observation
- inspection
- component/service event
- configuration change

## Evidence today
Real Unitree G1 read-only datasets exist locally; V0.1–V0.4.3 progressively established baseline/field evidence, real-data demo, provenance hygiene, reproducible Evidence Engine, private Audit Workbench, human review persistence, OEM technical semantics and offline field instrumentation. Current physical blocker: CH-G1-002 requires robot access.

## Shared Elaris truth
Robot, Configuration, Deployment, Change, Evidence, Incident plus private capture/analysis artifacts and human review state.

## Deterministic core
Evidence summaries, data-quality findings, provenance/integrity checks, configuration semantics, replay diagnostics. No health score/failure probability/RUL.

## AI role
Currently not required for core. Future extraction/retrieval/model research only after repeated labeled outcomes justify it.

## Human authority
Technician/integrator/operator/OEM/safety humans according to action. Elaris never declares healthy, safe, certified or ready-for-service autonomously.

## Horizontal leverage
Component Health is the strongest recent engineering pattern source for Elaris horizontal evidence/provenance/review architecture.

## Boundaries
Not fleet observability, robot control, OEM diagnostic authority, autonomous maintenance or predictive-maintenance claim.

## Planning
- [Roadmap](roadmap.md)
- [Version Registry](version-registry.md)
- [Execution Backlog](execution-backlog.md)
- [Portfolio method](../../portfolio/planning-method.md)

## Next action
Keep engineering parked at V0.4.3 until robot access enables CH-G1-002; parallel work may plan V0.5 data/export governance but cannot approve export.
