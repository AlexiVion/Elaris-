# Operational Readiness — Version Roadmap

**Rule:** roadmap defines scopes and gates; it does not authorize implementation automatically.

| Version | Scope | Increment | Result | Status | Gate |
|---|:---:|---|---|---|---|
| V0.1 | A | **Readiness lens** | Read-only acceptance view over current shared deployment truth | `CONCEPT_PROTOTYPE` | Prototype exposes missing/review/ready without inventing compliance. |
| V0.2 | B | **Real go-live reconstruction** | Reconstruct one recent enterprise robot acceptance from real artifacts | `PROPOSED_NEXT` | Actor confirms actual gates, owners, artifacts and outputs. |
| V0.3 | B | **Acceptance Domain Contract** | Versioned Gate/Condition/AcceptanceDecision hypothesis contract | `PROPOSED` | Objects match real artifacts and authority boundaries. |
| V0.4 | A/B | **Deterministic Readiness Engine** | Actor-validated rules calculate gate state and config drift | `PROPOSED` | Golden cases reviewed by buyer/operator; no compliance score. |
| V0.5 | B | **Acceptance Workbench** | Queue, gate detail, evidence gaps, condition tracking | `PROPOSED` | One real case can be reviewed end-to-end without spreadsheets. |
| V0.6 | B | **Human acceptance persistence** | Named decision, conditions, expiry/review triggers, audit history | `PROPOSED` | Save→reopen preserves authority and exact baseline. |
| V0.7 | B | **Change / re-acceptance** | Material change reopens only affected acceptance gates | `PROPOSED` | Real change demonstrates re-review semantics. |
| V0.8 | B | **Readiness Pack delivery** | Controlled internal/external pack tied to accepted baseline | `PROPOSED` | Data owner approves recipient/purpose. |
| V0.9 | C | **Multi-site templates** | Reusable but site-specific acceptance templates | `PROPOSED` | Repeated sites show stable common core plus local variance. |
| V1.0 | C | **Paid readiness workflow** | Repeatable go-live/change acceptance for defined buyer ICP | `VISION` | Paid repeated use and measurable cycle-time reduction. |
| V1.5 | C | **Enterprise integrations** | Procurement/EHS/CMDB integrations justified by recurrence | `VISION` | Validated source-system pain and security requirements. |

## Scope A — current assets / offline
### V0.1 — Readiness lens
**Result:** Read-only acceptance view over current shared deployment truth  
**Status:** `CONCEPT_PROTOTYPE`  
**Gate:** Prototype exposes missing/review/ready without inventing compliance.

### V0.4 — Deterministic Readiness Engine
**Result:** Actor-validated rules calculate gate state and config drift  
**Status:** `PROPOSED`  
**Gate:** Golden cases reviewed by buyer/operator; no compliance score.


## Scope B — requires real actor/case/artifact
### V0.2 — Real go-live reconstruction
**Result:** Reconstruct one recent enterprise robot acceptance from real artifacts  
**Status:** `PROPOSED_NEXT`  
**Gate:** Actor confirms actual gates, owners, artifacts and outputs.

### V0.3 — Acceptance Domain Contract
**Result:** Versioned Gate/Condition/AcceptanceDecision hypothesis contract  
**Status:** `PROPOSED`  
**Gate:** Objects match real artifacts and authority boundaries.

### V0.4 — Deterministic Readiness Engine
**Result:** Actor-validated rules calculate gate state and config drift  
**Status:** `PROPOSED`  
**Gate:** Golden cases reviewed by buyer/operator; no compliance score.

### V0.5 — Acceptance Workbench
**Result:** Queue, gate detail, evidence gaps, condition tracking  
**Status:** `PROPOSED`  
**Gate:** One real case can be reviewed end-to-end without spreadsheets.

### V0.6 — Human acceptance persistence
**Result:** Named decision, conditions, expiry/review triggers, audit history  
**Status:** `PROPOSED`  
**Gate:** Save→reopen preserves authority and exact baseline.

### V0.7 — Change / re-acceptance
**Result:** Material change reopens only affected acceptance gates  
**Status:** `PROPOSED`  
**Gate:** Real change demonstrates re-review semantics.

### V0.8 — Readiness Pack delivery
**Result:** Controlled internal/external pack tied to accepted baseline  
**Status:** `PROPOSED`  
**Gate:** Data owner approves recipient/purpose.


## Scope C — repetition / commercial / scale
### V0.9 — Multi-site templates
**Result:** Reusable but site-specific acceptance templates  
**Status:** `PROPOSED`  
**Gate:** Repeated sites show stable common core plus local variance.

### V1.0 — Paid readiness workflow
**Result:** Repeatable go-live/change acceptance for defined buyer ICP  
**Status:** `VISION`  
**Gate:** Paid repeated use and measurable cycle-time reduction.

### V1.5 — Enterprise integrations
**Result:** Procurement/EHS/CMDB integrations justified by recurrence  
**Status:** `VISION`  
**Gate:** Validated source-system pain and security requirements.


## Stop rule
If a gate fails, mark the version BLOCKED/MODIFY/MERGE/KILL rather than advancing numerically.
