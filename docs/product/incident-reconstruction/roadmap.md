# Incident Reconstruction — Version Roadmap

**Rule:** roadmap defines scopes and gates; it does not authorize implementation automatically.

| Version | Scope | Increment | Result | Status | Gate |
|---|:---:|---|---|---|---|
| V0.1 | A | **Incident lens** | Visual state-at-time and evidence prototype | `CONCEPT_PROTOTYPE` | No causation/liability claims. |
| V0.2 | B | **Real chronology reconstruction** | One real incident/near-miss with source artifacts | `PROPOSED_NEXT` | Investigators confirm first-hour workflow and gaps. |
| V0.3 | B | **Reconstruction Domain Contract** | SourceRef/Event/ClockContext/Unknown/Assertion candidates | `PROPOSED` | Maps real evidence and uncertainty. |
| V0.4 | A/B | **State-at-time engine** | Recover baseline/config/change/service context deterministically | `PROPOSED` | Golden replay reconstructs exact historical state. |
| V0.5 | B | **Timeline workbench** | Multiple sources, clocks, gaps and assertions | `PROPOSED` | Real chronology navigable without hiding uncertainty. |
| V0.6 | B | **Custody/provenance layer** | Source/derivative hashes, access/export review | `PROPOSED` | Evidence lineage verified and human-reviewed. |
| V0.7 | B | **Investigation findings** | Record questions, hypotheses, human-confirmed facts separately | `PROPOSED` | Evidence classes prevent inference→fact promotion. |
| V0.8 | B | **Controlled reconstruction report** | Audience-specific report with sources/unknowns | `PROPOSED` | Data/legal approval for recipient. |
| V0.9 | C | **Multi-source connectors** | Logs/fleet/service imports based on repeated incidents | `DEFERRED` | At least two real reconstructions justify sources. |
| V1.0 | C | **Paid Reconstruction Workspace** | Repeatable incident reconstruction service/product | `VISION` | Paid/repeated use and measurable time saved. |
| V1.5 | C | **Cross-incident learning** | Pattern discovery separated from causation | `RESEARCH_ONLY` | Governed incident cohort and reuse rights. |

## Scope A — current assets / offline
### V0.1 — Incident lens
**Result:** Visual state-at-time and evidence prototype  
**Status:** `CONCEPT_PROTOTYPE`  
**Gate:** No causation/liability claims.

### V0.4 — State-at-time engine
**Result:** Recover baseline/config/change/service context deterministically  
**Status:** `PROPOSED`  
**Gate:** Golden replay reconstructs exact historical state.


## Scope B — requires real actor/case/artifact
### V0.2 — Real chronology reconstruction
**Result:** One real incident/near-miss with source artifacts  
**Status:** `PROPOSED_NEXT`  
**Gate:** Investigators confirm first-hour workflow and gaps.

### V0.3 — Reconstruction Domain Contract
**Result:** SourceRef/Event/ClockContext/Unknown/Assertion candidates  
**Status:** `PROPOSED`  
**Gate:** Maps real evidence and uncertainty.

### V0.4 — State-at-time engine
**Result:** Recover baseline/config/change/service context deterministically  
**Status:** `PROPOSED`  
**Gate:** Golden replay reconstructs exact historical state.

### V0.5 — Timeline workbench
**Result:** Multiple sources, clocks, gaps and assertions  
**Status:** `PROPOSED`  
**Gate:** Real chronology navigable without hiding uncertainty.

### V0.6 — Custody/provenance layer
**Result:** Source/derivative hashes, access/export review  
**Status:** `PROPOSED`  
**Gate:** Evidence lineage verified and human-reviewed.

### V0.7 — Investigation findings
**Result:** Record questions, hypotheses, human-confirmed facts separately  
**Status:** `PROPOSED`  
**Gate:** Evidence classes prevent inference→fact promotion.

### V0.8 — Controlled reconstruction report
**Result:** Audience-specific report with sources/unknowns  
**Status:** `PROPOSED`  
**Gate:** Data/legal approval for recipient.


## Scope C — repetition / commercial / scale
### V0.9 — Multi-source connectors
**Result:** Logs/fleet/service imports based on repeated incidents  
**Status:** `DEFERRED`  
**Gate:** At least two real reconstructions justify sources.

### V1.0 — Paid Reconstruction Workspace
**Result:** Repeatable incident reconstruction service/product  
**Status:** `VISION`  
**Gate:** Paid/repeated use and measurable time saved.

### V1.5 — Cross-incident learning
**Result:** Pattern discovery separated from causation  
**Status:** `RESEARCH_ONLY`  
**Gate:** Governed incident cohort and reuse rights.


## Stop rule
If a gate fails, mark the version BLOCKED/MODIFY/MERGE/KILL rather than advancing numerically.
