# Elaris Deployment Control

## Product promise

A live record of each deployed robot system:

- what robot it is;
- exactly how it is configured;
- where and for what task it is deployed;
- which evidence and approvals support it;
- what is missing;
- what changed;
- what may need review after a change.

## Core product flow

Configuration snapshot  
→ Deployment baseline  
→ Evidence links  
→ Readiness / gaps  
→ Change diff  
→ Impact analysis  
→ Actor-specific outputs

## Outputs

- System Passport
- Deployment Record
- Evidence Map
- Readiness / Gap View
- Change Impact Report
- Internal / Engineering View
- Customer / Safety View
- Later: Insurance / Claims views when real workflows justify them

## Product principles

- **Layer above existing systems.** Do not replace Git, PLM, fleet management, observability or CMMS.
- **Reference and provenance.** Keep source, owner, version/date and linkage.
- **Versioned truth.** Never silently overwrite the deployed configuration.
- **Deterministic core.** Readiness and impact logic are rules-based and testable.
- **Human authority.** Elaris flags review; it does not certify, approve or declare something safe.
- **Automate repeated work, not hypothetical work.**

## MVP boundary

The current repo already implements most of this product as a local single-tenant demo. The Humandroid branch exists to adapt that product to a real design-partner workflow, not to rebuild it.
