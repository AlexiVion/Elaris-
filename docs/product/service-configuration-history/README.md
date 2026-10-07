# Service & Configuration History

**Product status:** `HYPOTHESIS · SPEC ONLY WITH STRONG ADJACENT ENGINEERING`  
**Primary actor:** [A13](../../industry/archetypes/maintenance-field-service.md)

## Core decision
> What intervention occurred, what exact hardware/software/configuration changed, what evidence was produced, and what must humans check before return to operation?

## Triggers
- inspection request
- scheduled service
- failure/observation
- component replacement
- firmware/software service
- post-incident repair

## Evidence today
No validated standalone service product yet. Component Health already exercised component identity, human review, service/change/RTS concepts and real field evidence, but actual work-order/service records were not validated.

## Shared Elaris truth
Robot, Configuration, Deployment, Change, Evidence, Incident, Approval/Audit plus Component Health evidence references.

## Deterministic core
Before/after configuration, part/version identity, service-event chronology, required evidence completeness, links to affected deployment/baseline.

## AI role
Extract service notes and parts, summarize history, retrieve similar prior interventions. AI cannot decide repair sufficiency or return-to-service.

## Human authority
Qualified technician/service organization plus site/safety/customer authorities as applicable.

## Horizontal leverage
This is the closest adjacent product to Component Health: reuse component mapping, evidence engine, review states, service/change boundaries and field protocol directly.

## Boundaries
Not CMMS replacement, OEM repair authority, autonomous maintenance recommendation or fit-for-service certification.

## Planning
- [Roadmap](roadmap.md)
- [Version Registry](version-registry.md)
- [Execution Backlog](execution-backlog.md)
- [Portfolio method](../../portfolio/planning-method.md)

## Next action
Obtain one real work order/component intervention; this should be the first adjacent product explored after Deployment Control.
