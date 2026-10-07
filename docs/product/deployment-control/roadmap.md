# Deployment Control / Deployment & Change Evidence — Version Roadmap

**Rule:** roadmap defines scopes and gates; it does not authorize implementation automatically.

| Version | Scope | Increment | Result | Status | Gate |
|---|:---:|---|---|---|---|
| V0.1 | A | **Deployment truth foundation** | Robot/configuration/deployment identity and versioned snapshots | `IMPLEMENTED_REFERENCE` | Canonical configuration can be reconstructed deterministically. |
| V0.2 | A | **Evidence + baseline graph** | Evidence, requirements, approvals and frozen baseline linked to deployment | `IMPLEMENTED_REFERENCE` | One coherent deployment package can be rendered from shared truth. |
| V0.3 | A | **Change Evidence engine** | Before/after diff + deterministic impact items + review gating | `IMPLEMENTED_REFERENCE` | Golden deterministic change scenario remains reproducible. |
| V0.4 | A | **Operator workbench + outputs** | Home/queues/details/reports/share/audit around reference workflow | `IMPLEMENTED_REFERENCE` | End-to-end demo is coherent; no claim of field validation. |
| V0.5 | B | **Real Deployment Reconciliation** | Ingest/reconcile one real Humandroid deployment and artifact set | `PROPOSED_NEXT` | Real config, deployment, evidence and gaps are represented without invented facts. |
| V0.6 | B | **Real Change Case** | Reconstruct or observe one material change and its real human review | `PROPOSED` | Named reviewers confirm impact/re-test/re-approval workflow. |
| V0.7 | B | **Source-system intake** | Target only repeated painful sources: Git/Drive/PLM/fleet/export | `DEFERRED_UNTIL_PAIN` | At least two repeated manual intake events justify an integration. |
| V0.8 | B | **Cross-product evidence links** | Component Health/service/safety/readiness outputs attach to same deployment truth | `PROPOSED` | No duplicate system-of-record; links preserve provenance/authority. |
| V0.9 | C | **Secure partner pilot** | Auth, org isolation, retention, access/export controls required by real partner | `PROPOSED` | Partner security/data requirements are explicit and tested. |
| V1.0 | C | **Repeatable paid Deployment Control** | Repeatable onboarding→baseline→change→review→report for defined ICP | `VISION` | At least one paid customer and repeated workflow with measured value. |
| V1.5 | C | **Multi-OEM / multi-source** | Multiple robot/software ecosystems normalized by capability | `VISION` | Second real OEM/source required by customer demand. |
| V2.0 | C | **Change intelligence** | Cross-deployment change patterns/outcomes inform planning without automating authority | `RESEARCH_ONLY` | Repeated outcome-linked changes and governed reuse rights. |

## Scope A — current assets / offline
### V0.1 — Deployment truth foundation
**Result:** Robot/configuration/deployment identity and versioned snapshots  
**Status:** `IMPLEMENTED_REFERENCE`  
**Gate:** Canonical configuration can be reconstructed deterministically.

### V0.2 — Evidence + baseline graph
**Result:** Evidence, requirements, approvals and frozen baseline linked to deployment  
**Status:** `IMPLEMENTED_REFERENCE`  
**Gate:** One coherent deployment package can be rendered from shared truth.

### V0.3 — Change Evidence engine
**Result:** Before/after diff + deterministic impact items + review gating  
**Status:** `IMPLEMENTED_REFERENCE`  
**Gate:** Golden deterministic change scenario remains reproducible.

### V0.4 — Operator workbench + outputs
**Result:** Home/queues/details/reports/share/audit around reference workflow  
**Status:** `IMPLEMENTED_REFERENCE`  
**Gate:** End-to-end demo is coherent; no claim of field validation.


## Scope B — requires real actor/case/artifact
### V0.5 — Real Deployment Reconciliation
**Result:** Ingest/reconcile one real Humandroid deployment and artifact set  
**Status:** `PROPOSED_NEXT`  
**Gate:** Real config, deployment, evidence and gaps are represented without invented facts.

### V0.6 — Real Change Case
**Result:** Reconstruct or observe one material change and its real human review  
**Status:** `PROPOSED`  
**Gate:** Named reviewers confirm impact/re-test/re-approval workflow.

### V0.7 — Source-system intake
**Result:** Target only repeated painful sources: Git/Drive/PLM/fleet/export  
**Status:** `DEFERRED_UNTIL_PAIN`  
**Gate:** At least two repeated manual intake events justify an integration.

### V0.8 — Cross-product evidence links
**Result:** Component Health/service/safety/readiness outputs attach to same deployment truth  
**Status:** `PROPOSED`  
**Gate:** No duplicate system-of-record; links preserve provenance/authority.


## Scope C — repetition / commercial / scale
### V0.9 — Secure partner pilot
**Result:** Auth, org isolation, retention, access/export controls required by real partner  
**Status:** `PROPOSED`  
**Gate:** Partner security/data requirements are explicit and tested.

### V1.0 — Repeatable paid Deployment Control
**Result:** Repeatable onboarding→baseline→change→review→report for defined ICP  
**Status:** `VISION`  
**Gate:** At least one paid customer and repeated workflow with measured value.

### V1.5 — Multi-OEM / multi-source
**Result:** Multiple robot/software ecosystems normalized by capability  
**Status:** `VISION`  
**Gate:** Second real OEM/source required by customer demand.

### V2.0 — Change intelligence
**Result:** Cross-deployment change patterns/outcomes inform planning without automating authority  
**Status:** `RESEARCH_ONLY`  
**Gate:** Repeated outcome-linked changes and governed reuse rights.


## Stop rule
If a gate fails, mark the version BLOCKED/MODIFY/MERGE/KILL rather than advancing numerically.
