# Deployment Control / Deployment & Change Evidence — Version Roadmap

**Rule:** roadmap defines scopes and gates; it does not authorize implementation automatically.

| Version | Scope | Increment | Result | Status | Gate |
|---|:---:|---|---|---|---|
| V0.1 | A | **Deployment truth foundation** | Robot/configuration/deployment identity and versioned snapshots | `IMPLEMENTED_REFERENCE` | Canonical configuration can be reconstructed deterministically. |
| V0.2 | A | **Evidence + baseline graph** | Evidence, requirements, approvals and frozen baseline linked to deployment | `IMPLEMENTED_REFERENCE` | One coherent deployment package can be rendered from shared truth. |
| V0.3 | A | **Change Evidence engine** | Before/after diff + deterministic impact items + review gating | `IMPLEMENTED_REFERENCE` | Golden deterministic change scenario remains reproducible. |
| V0.4 | A | **Operator workbench + outputs** | Home/queues/details/reports/share/audit around reference workflow | `IMPLEMENTED_REFERENCE` | End-to-end demo is coherent; no claim of field validation. |
| V0.5 | B | **Real Institutional Placement Reconciliation** | Represent the Humandroid Unitree G1 hosted at Universidad Siglo 21 under institutional agreement, with no invented customer/task | `IN_PROGRESS` | V0.5.1 semantics verified + V0.5.2 authorized real baseline completed. |
| V0.5.1 | B | **Placement Context Semantics** | Generalize provider/host/customer/task context without breaking commercial deployments | `IMPLEMENTED_PENDING_LOCAL_VERIFICATION` | Migration + deterministic/integration/E2E gates pass. |
| V0.5.2 | B | **Siglo 21 Real Baseline** | Attach authorized real configuration/evidence refs to the institutional placement | `BLOCKED_ON_V0.5.1_AND_DATA_REVIEW` | Authorized evidence baseline is reproducible without false acceptance claims. |
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
### V0.5 — Real Institutional Placement Reconciliation
**Selected case:** [Siglo 21 / Humandroid Institutional Placement](cases/siglo21-humandroid-institutional-placement-v0.md)  
**Result:** Represent the real Humandroid Unitree G1 hosted at Universidad Siglo 21 without inventing a commercial customer or production task.  
**Status:** `IN_PROGRESS`  
**Gate:** provider/owner context, host institution/site, configuration, evidence and unknowns are representable without fake commercial/production semantics.

**Known domain gap:** the current schema requires `Customer`, `Site.customerId` and `Task` for every `Deployment`. V0.5 must generalize placement context before importing the case.

### V0.5.1 — Placement Context Semantics

**Technical plan:** [v0.5.1-placement-context-semantics.md](v0.5.1-placement-context-semantics.md)

**Result:** Define and implement the smallest domain/schema generalization required by the Siglo 21 case: provider/host relationship, non-commercial placement, optional task/commercial context and explicit placement kind.  
**Status:** `BLOCKED_ON_V0.5.1_AND_DATA_REVIEW`  
**Gate:** migration + deterministic tests prove both the existing commercial golden scenario and the institutional placement can coexist without semantic fiction.

### V0.5.2 — Siglo 21 Real Baseline

**Result:** Materialize the real placement/configuration baseline and attach authorized existing evidence references; unknown fields remain explicit.  
**Status:** `PLANNED_WITHIN_V0.5`  
**Gate:** baseline reconstructs the selected real case and does not imply production acceptance/safety/customer approval.

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
