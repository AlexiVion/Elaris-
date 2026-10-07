# Service & Configuration History — Version Roadmap

| Version | Scope | Increment | Result | Status | Gate |
|---|:---:|---|---|---|---|
| V0.1 | A | **Service evidence contract** | Define intervention, finding, action, part/config delta, test evidence and disposition refs | `DRAFT` | Contract reuses shared Change/Evidence instead of duplicating config. |
| V0.2 | B | **Real work-order reconstruction** | One actual repair/replacement from symptom to service close | `PROPOSED_NEXT` | Technician validates steps, artifacts, authority and gaps. |
| V0.3 | A/B | **Service Configuration Delta Engine** | Before/after parts/software/config + linked evidence | `PROPOSED` | Replay/golden cases deterministic. |
| V0.4 | B | **Technician Workbench** | Work queue, robot/component history, intervention detail and evidence | `PROPOSED` | One real intervention can be documented end-to-end. |
| V0.5 | B | **Inspection / disposition persistence** | Observed finding → human disposition → action → verification | `PROPOSED` | Never equates reviewed with healthy/safe. |
| V0.6 | B | **Return-to-operation evidence link** | Generate review bundle for named authority after service | `PROPOSED` | Authority remains external/named; no automatic RTS. |
| V0.7 | B | **Component Health integration** | CH evidence can open service review; outcomes feed component history | `PROPOSED` | One real CH→service→outcome loop. |
| V0.8 | B | **Incident/change reconciliation** | Service event updates same deployment/config history | `PROPOSED` | No parallel service configuration silo. |
| V0.9 | C | **CMMS integration** | Work-order sync only after repeated real need | `DEFERRED` | At least two recurring workflows/source system. |
| V1.0 | C | **Paid Service & Configuration History** | Repeatable service evidence workflow | `VISION` | Paid service/integrator user + repeated interventions. |
| V1.5 | C | **Multi-OEM service normalization** | Capability-based cross-OEM service evidence | `VISION` | Second OEM and real service demand. |

## Scope A — current assets / offline
### V0.1 — Service evidence contract
**Result:** Define intervention, finding, action, part/config delta, test evidence and disposition refs  
**Status:** `DRAFT`  
**Gate:** Contract reuses shared Change/Evidence instead of duplicating config.

### V0.3 — Service Configuration Delta Engine
**Result:** Before/after parts/software/config + linked evidence  
**Status:** `PROPOSED`  
**Gate:** Replay/golden cases deterministic.


## Scope B — requires real actor/case/artifact
### V0.2 — Real work-order reconstruction
**Result:** One actual repair/replacement from symptom to service close  
**Status:** `PROPOSED_NEXT`  
**Gate:** Technician validates steps, artifacts, authority and gaps.

### V0.3 — Service Configuration Delta Engine
**Result:** Before/after parts/software/config + linked evidence  
**Status:** `PROPOSED`  
**Gate:** Replay/golden cases deterministic.

### V0.4 — Technician Workbench
**Result:** Work queue, robot/component history, intervention detail and evidence  
**Status:** `PROPOSED`  
**Gate:** One real intervention can be documented end-to-end.

### V0.5 — Inspection / disposition persistence
**Result:** Observed finding → human disposition → action → verification  
**Status:** `PROPOSED`  
**Gate:** Never equates reviewed with healthy/safe.

### V0.6 — Return-to-operation evidence link
**Result:** Generate review bundle for named authority after service  
**Status:** `PROPOSED`  
**Gate:** Authority remains external/named; no automatic RTS.

### V0.7 — Component Health integration
**Result:** CH evidence can open service review; outcomes feed component history  
**Status:** `PROPOSED`  
**Gate:** One real CH→service→outcome loop.

### V0.8 — Incident/change reconciliation
**Result:** Service event updates same deployment/config history  
**Status:** `PROPOSED`  
**Gate:** No parallel service configuration silo.


## Scope C — repeated cases / commercial / intelligence
### V0.9 — CMMS integration
**Result:** Work-order sync only after repeated real need  
**Status:** `DEFERRED`  
**Gate:** At least two recurring workflows/source system.

### V1.0 — Paid Service & Configuration History
**Result:** Repeatable service evidence workflow  
**Status:** `VISION`  
**Gate:** Paid service/integrator user + repeated interventions.

### V1.5 — Multi-OEM service normalization
**Result:** Capability-based cross-OEM service evidence  
**Status:** `VISION`  
**Gate:** Second OEM and real service demand.


## Rule
A later version is not permission to skip an earlier evidence gate. Failed gates result in BLOCKED/MODIFY/MERGE/KILL, not automatic progression.
