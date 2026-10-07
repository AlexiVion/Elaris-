# Component Health — Version Roadmap

| Version | Scope | Increment | Result | Status | Gate |
|---|:---:|---|---|---|---|
| V0.1 | A | **Observed Baseline + Field Evidence** | Real G1 read-only capture and descriptive component evidence | `VERIFIED_LOCAL` | Real capture chain works without command/control. |
| V0.2 | A | **Real-data-derived demo** | 29-slot/phase evidence made navigable without health claim | `VERIFIED_LOCAL` | UI reflects supported sanitized aggregates and explicit boundaries. |
| V0.2.1 | A | **Provenance / hygiene closeout** | Source/derivative boundaries, routes, timing/coverage hygiene | `VERIFIED_LOCAL` | No synthetic legacy claim leaks into active workflow. |
| V0.3 | A | **Reproducible Evidence Engine** | Deterministic private 29×phase analysis with checksums/provenance | `VERIFIED_LOCAL` | Repeated run gives deterministic output on real private dataset. |
| V0.4 | A | **Private Audit Workbench** | Artifact-backed sessions/components/phases/quality/report navigation | `VERIFIED_LOCAL` | Real private evidence can be reviewed without hardcoded active data. |
| V0.4.1 | A | **Human Review & Persistence** | Review queue/status/dispositions persisted without diagnosis | `INTERNAL_STABLE` | Save→refresh persistence and gates validated. |
| V0.4.2 | A | **Technical Semantics** | Unitree mapping/config/OEM field semantics verified where public evidence supports | `VERIFIED_LOCAL` | 29-DOF context resolved; unresolved physical wrist remains explicit. |
| V0.4.3 | A | **Offline Robustness & Field Instrumentation** | Frame provenance, lifecycle diagnostics, component probe, replay, CH-G1-002 protocol | `VERIFIED_LOCAL_READY_FOR_FIELD` | 36/36 CH tests, build PASS; physical questions gated on next robot session. |
| V0.5 | B | **Delivery & Export** | Human-approved versioned evidence package/client handoff | `DRAFT` | Data owner approves recipient/purpose; no sensitive leak. |
| V0.6 | B | **Comparable Sessions** | Like-for-like session history and comparison | `PROPOSED` | 2+ comparable captures same robot/config/context. |
| V0.7 | B | **Field Audit Operations** | Repeatable intake/capture/QA/review/delivery runbook and cost metrics | `PROPOSED` | At least two repeated audits. |
| V0.8 | B | **Service Findings & Outcomes** | Finding→human disposition→service/action→outcome | `PROPOSED` | Real maintenance/service case and named authority. |
| V0.9 | C | **Secure Partner Pilot** | Auth/org isolation/retention/audit for real partner | `PROPOSED` | Partner security/data requirements validated. |
| V1.0 | C | **Repeatable Paid Field Evidence** | Defined ICP buys/repeats evidence audit workflow | `VISION` | ≥1 paid pilot and repeated delivery with clear limits. |
| V1.5 | C | **Multi-OEM** | Second real adapter/config semantics | `VISION` | Second OEM demanded and field-tested. |
| V2.0 | C | **Component Evidence Operations** | Validated rules + service/change/outcome integration | `VISION` | Findings lead to measured human actions/outcomes. |
| V2.5 | C | **Reliability Cohorts** | Comparable cross-session/fleet evidence | `VISION` | Sufficient governed cohort. |
| V3.0 | C | **Optional Prognostic Intelligence** | Calibrated/backtested models only if data justifies | `RESEARCH_ONLY` | Failure/service labels, censoring/exposure, temporal validation and governance. |

## Scope A — current assets / offline
### V0.1 — Observed Baseline + Field Evidence
**Result:** Real G1 read-only capture and descriptive component evidence  
**Status:** `VERIFIED_LOCAL`  
**Gate:** Real capture chain works without command/control.

### V0.2 — Real-data-derived demo
**Result:** 29-slot/phase evidence made navigable without health claim  
**Status:** `VERIFIED_LOCAL`  
**Gate:** UI reflects supported sanitized aggregates and explicit boundaries.

### V0.2.1 — Provenance / hygiene closeout
**Result:** Source/derivative boundaries, routes, timing/coverage hygiene  
**Status:** `VERIFIED_LOCAL`  
**Gate:** No synthetic legacy claim leaks into active workflow.

### V0.3 — Reproducible Evidence Engine
**Result:** Deterministic private 29×phase analysis with checksums/provenance  
**Status:** `VERIFIED_LOCAL`  
**Gate:** Repeated run gives deterministic output on real private dataset.

### V0.4 — Private Audit Workbench
**Result:** Artifact-backed sessions/components/phases/quality/report navigation  
**Status:** `VERIFIED_LOCAL`  
**Gate:** Real private evidence can be reviewed without hardcoded active data.

### V0.4.1 — Human Review & Persistence
**Result:** Review queue/status/dispositions persisted without diagnosis  
**Status:** `INTERNAL_STABLE`  
**Gate:** Save→refresh persistence and gates validated.

### V0.4.2 — Technical Semantics
**Result:** Unitree mapping/config/OEM field semantics verified where public evidence supports  
**Status:** `VERIFIED_LOCAL`  
**Gate:** 29-DOF context resolved; unresolved physical wrist remains explicit.

### V0.4.3 — Offline Robustness & Field Instrumentation
**Result:** Frame provenance, lifecycle diagnostics, component probe, replay, CH-G1-002 protocol  
**Status:** `VERIFIED_LOCAL_READY_FOR_FIELD`  
**Gate:** 36/36 CH tests, build PASS; physical questions gated on next robot session.


## Scope B — requires real actor/case/artifact
### V0.5 — Delivery & Export
**Result:** Human-approved versioned evidence package/client handoff  
**Status:** `DRAFT`  
**Gate:** Data owner approves recipient/purpose; no sensitive leak.

### V0.6 — Comparable Sessions
**Result:** Like-for-like session history and comparison  
**Status:** `PROPOSED`  
**Gate:** 2+ comparable captures same robot/config/context.

### V0.7 — Field Audit Operations
**Result:** Repeatable intake/capture/QA/review/delivery runbook and cost metrics  
**Status:** `PROPOSED`  
**Gate:** At least two repeated audits.

### V0.8 — Service Findings & Outcomes
**Result:** Finding→human disposition→service/action→outcome  
**Status:** `PROPOSED`  
**Gate:** Real maintenance/service case and named authority.


## Scope C — repeated cases / commercial / intelligence
### V0.9 — Secure Partner Pilot
**Result:** Auth/org isolation/retention/audit for real partner  
**Status:** `PROPOSED`  
**Gate:** Partner security/data requirements validated.

### V1.0 — Repeatable Paid Field Evidence
**Result:** Defined ICP buys/repeats evidence audit workflow  
**Status:** `VISION`  
**Gate:** ≥1 paid pilot and repeated delivery with clear limits.

### V1.5 — Multi-OEM
**Result:** Second real adapter/config semantics  
**Status:** `VISION`  
**Gate:** Second OEM demanded and field-tested.

### V2.0 — Component Evidence Operations
**Result:** Validated rules + service/change/outcome integration  
**Status:** `VISION`  
**Gate:** Findings lead to measured human actions/outcomes.

### V2.5 — Reliability Cohorts
**Result:** Comparable cross-session/fleet evidence  
**Status:** `VISION`  
**Gate:** Sufficient governed cohort.

### V3.0 — Optional Prognostic Intelligence
**Result:** Calibrated/backtested models only if data justifies  
**Status:** `RESEARCH_ONLY`  
**Gate:** Failure/service labels, censoring/exposure, temporal validation and governance.


## Rule
A later version is not permission to skip an earlier evidence gate. Failed gates result in BLOCKED/MODIFY/MERGE/KILL, not automatic progression.
