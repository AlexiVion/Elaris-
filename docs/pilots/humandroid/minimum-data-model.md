# Humandroid — Minimum Data Model

## Existing repo model

The repo already contains the key product objects. We should evolve it, not replace it.

### Canonical objects

| Object | Purpose |
| --- | --- |
| Robot | Individual physical asset |
| ConfigurationSnapshot + ConfigItem | Versioned system configuration |
| Deployment | Real use of a configured system |
| EvidenceItem | Evidence or requirement linked to a deployment |
| Approval | Human decision / sign-off |
| Change | Before/after configuration transition |
| ImpactItem | Affected item produced by impact analysis |
| Incident | Operational event tied to the active deployment state |
| Baseline | Frozen deployment/config/evidence/approval state |
| AuditEvent | Append-only history |

## Minimum relationships

- Robot → has ConfigurationSnapshots
- Deployment → uses Robot(s)
- Deployment → has active Baseline
- Baseline → freezes ConfigurationSnapshot + task/environment/evidence/approval state
- EvidenceItem → applies to Deployment and scoped config slots
- Approval → applies to Deployment and scoped config slots
- Change → transforms Snapshot A → Snapshot B
- Change → creates ImpactItems
- Incident → records active baseline/snapshot at event time

## Provenance requirement for the pilot

The current schema already carries parts of provenance:

- EvidenceItem.source
- EvidenceItem.ownerPersonId
- EvidenceItem.uri
- EvidenceItem.fileSha256
- timestamps
- ConfigurationSnapshot.createdById / createdAt
- AuditEvent

For real Humandroid data we should validate whether we additionally need:
- source-system identifier;
- external source ID;
- confirmation state;
- valid-from / valid-to;
- document/version identifier separate from title.

Do not add those fields until the pilot shows they are needed.

## Requirements modeling decision

Today, requirements are represented as **EvidenceItem(category = REQUIREMENT)**.

That is acceptable for the demo because requirements and evidence share readiness/scope/status behavior.

During the Humandroid pilot we must validate whether this becomes awkward. If requirements need independent relationships, lifecycle or traceability, promote them into a dedicated Requirement model.

## Configuration model

The repo already has the right core abstraction:

ConfigurationSnapshot
→ ConfigItems by slot
→ immutable-ish historical snapshots
→ before/after diff
→ Baseline

This is stronger than a single mutable Configuration row and should be preserved.

## Change Impact v0

Keep deterministic rules as the authoritative core.

Examples:
- HANDS changed → hand-scoped tests/evidence require review;
- FIRMWARE / CONTROL_STACK / NETWORK_PROFILE changed → cyber-impact confirmation;
- safety-relevant hardware change with shared human exposure → raise affected risk-assessment severity;
- changed slot intersects approval scope → re-approval impact.

AI may later help discover candidate relationships, but should not silently make certification/safety decisions.


## Approval re-review semantics

For the pilot, an Approval row represents a named historical decision and is not silently rewritten when configuration changes.

If a change intersects an approval's scope:

1. the impact engine emits an `APPROVAL / RE_APPROVE` ImpactItem referencing that approval;
2. the ImpactItem remains open until the **named approver** records the re-review;
3. another role cannot satisfy that approval on the approver's behalf;
4. approval ImpactItems cannot be waived through the generic waiver path;
5. final Safety Lead change approval is blocked until all affected approvals are resolved.

This avoids duplicate Approval rows and readiness double-counting while preserving the original named decision and a separate audited re-review obligation.
