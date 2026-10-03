# Elaris Docs

This directory is the durable technical and operating knowledge base for the Elaris repository.

> **Agents:** read the repository root [`AGENTS.md`](../AGENTS.md) before using these docs.

## Source-of-truth model

Elaris deliberately separates strategy, implementation and execution records:

| Layer | Canonical source | Purpose |
|---|---|---|
| Product strategy / discovery | Notion | actor maps, hypotheses, interviews, validation, roadmap |
| Accepted code | GitHub `main` | current implementation |
| Architecture / protocols | `docs/` | durable engineering and collaboration rules |
| Tasks | GitHub Issues | owner, scope, acceptance criteria |
| Integration history | Pull Requests | review, verification, rationale |

Canonical Notion home:

https://app.notion.com/p/00-HOME-3ebbeb945fd6802dbae4f253211db396?pvs=25

## Start here

### Team operating system
- [Collaboration Workflow](team/COLLABORATION_WORKFLOW.md)
- [Git Collaboration SOP](team/GIT_SOP.md)

### Architecture
- [Platform → Product Architecture](architecture/platform-product-architecture.md)
- [Current System Design & Humandroid Audit](architecture/system-design.md)
- [Robot Adapter V0](architecture/robot-adapter-v0.md)
- [Robot Execution Context V0](architecture/robot-execution-context-v0.md)
- [Humandroid / TienKung Reference Stack](architecture/humandroid-tienkung-reference-stack.md)
- [Edge Collector V0](architecture/edge-collector-v0.md)

### Company
- [Elaris Overview](company/elaris-overview.md)
- [Physical AI Industry Map](industry/physical-ai-industry-map.md)

### Product Systems
- [Product Systems Overview](product-systems/README.md)
- [Product Systems Registry](product-systems/registry.md)
- [Product System Template](product-systems/product-system-template.md)
- [Deployment Control Product System](product-systems/deployment-control.md)
- [Placement Workspace Product System](product-systems/placement.md)
- [Underwriting Workspace Product System](product-systems/underwriting.md)
- [Component Health V0](product-systems/component-health-hypothesis.md)

### Product
- [Deployment Control](product/deployment-control.md)

### Platform
- [Horizontal Platform v0](platform/horizontal-v0.md)
- [Wave A Visual Prototype Spec](platform/wave-a-visual-prototype-spec.md)
- [Operational Readiness Real Mockup](platform/operational-readiness-real-mockup.md)

### Humandroid Pilot
- [Component Health V0 Product Spec](pilots/humandroid/component-health-v0.md)
- [Pilot Spec](pilots/humandroid/pilot-spec.md)
- [Data Request](pilots/humandroid/data-request.md)
- [Operating Workflow](pilots/humandroid/operating-workflow.md)
- [Minimum Data Model](pilots/humandroid/minimum-data-model.md)
- [Success Criteria](pilots/humandroid/success-criteria.md)
- [Demo & Delivery Plan](pilots/humandroid/demo-delivery-plan.md)
- [Demo Data Audit](pilots/humandroid/demo-data-audit.md)
- [Evidence Map Semantics](pilots/humandroid/evidence-map-semantics.md)
- [7-Minute Demo Script](pilots/humandroid/demo-script.md)

### Siglo 21
- [Robotics Integration V0 — Implementation & Verification Record](pilots/siglo21/robotics-integration-v0-record.md)
- [Siglo 21 Field Kit V0](pilots/siglo21/field-kit-v0.md)
- [Siglo 21 Field Runbook V0](pilots/siglo21/field-runbook-v0.md)
- [Siglo 21 Edge Capture Protocol V0](pilots/siglo21/edge-capture-protocol-v0.md)

### Releases
- [v0.1 Humandroid Pilot Demo](releases/v0.1-humandroid-pilot-demo.md)

## Documentation rules

- Keep architecture/protocol docs short enough to remain usable.
- Update docs in the same PR that changes the documented behavior.
- Do not copy every Notion research page into GitHub.
- Do not use chats as the only record of an important decision.
- If two docs conflict, flag the conflict and update the obsolete one.
