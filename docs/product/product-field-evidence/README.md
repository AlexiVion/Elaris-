# Product & Field Evidence

**Product status:** `HYPOTHESIS · SPEC ONLY`  
**Primary actor:** [A01](../../industry/archetypes/component-supplier.md) · [A02](../../industry/archetypes/robot-oem.md) · [A03](../../industry/archetypes/ai-software-provider.md)

## Core decision
> Which product/version/lot/build is deployed where, what authoritative evidence belongs to it, and who may be affected by a release, revision or advisory?

## Triggers
- new product/revision/release
- firmware/model/software release
- field advisory
- RMA/quality event
- customer evidence request

## Evidence today
No dedicated product application exists yet. Elaris already has versioned configuration identity, robot adapter semantics, field evidence provenance and change relationships that can form the substrate.

## Shared Elaris truth
Organization, Robot, ConfigurationSnapshot/ConfigItem, Deployment, Evidence, Change, Incident, Audit.

## Deterministic core
Product/version identity, deployment mapping, affected-system query, immutable release/evidence references, before/after deployment diff.

## AI role
Extract release notes/specs, suggest mappings and summarize field feedback. AI cannot declare affected deployment without deterministic identity evidence.

## Human authority
Vendor/OEM/software-provider humans own releases/advisories; integrator/customer humans decide downstream action.

## Horizontal leverage
Component Health proved OEM semantics verification, field evidence capture, source lineage and exact robot/component mapping patterns.

## Boundaries
Not PLM, source-code hosting, OEM support portal, SBOM scanner or automatic recall authority.

## Planning
- [Roadmap](roadmap.md)
- [Version Registry](version-registry.md)
- [Execution Backlog](execution-backlog.md)
- [Portfolio method](../../portfolio/planning-method.md)

## Next action
Find one real vendor/OEM release or advisory and trace exactly how affected deployed systems are identified today.
