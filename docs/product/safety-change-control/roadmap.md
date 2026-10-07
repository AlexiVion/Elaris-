# Safety Change Control — Version Roadmap

**Rule:** roadmap defines scopes and gates; it does not authorize implementation automatically.

| Version | Scope | Increment | Result | Status | Gate |
|---|:---:|---|---|---|---|
| V0.1 | A | **Safety change lens** | Read-only view of change/evidence/approval relationships | `CONCEPT_PROTOTYPE` | Clear non-claims and shared truth only. |
| V0.2 | B | **Real safety-change reconstruction** | One real change + hazard/test/approval artifact set | `PROPOSED_NEXT` | Safety actor confirms actual process and decision points. |
| V0.3 | B | **Hazard/Control/Review contract** | Define actor-specific objects only from real artifacts | `PROPOSED` | Schema proposal maps 1:1 to recurring records. |
| V0.4 | B | **Deterministic safety-impact mapping** | Change slots/components → candidate reviews/re-tests | `PROPOSED` | Practitioner-reviewed golden cases; suggestions not conclusions. |
| V0.5 | B | **Safety workbench** | Queue of affected hazards/controls/tests/approvals | `PROPOSED` | One case operated end-to-end. |
| V0.6 | B | **Re-test + re-approval evidence** | Persist named actions, evidence and decision history | `PROPOSED` | Old approvals remain immutable; new decisions are explicit. |
| V0.7 | B | **Incident-triggered review** | Incident facts can reopen relevant safety review | `PROPOSED` | Real incident/change case validates semantics. |
| V0.8 | B | **Safety change pack** | Controlled report for internal/assurance use | `PROPOSED` | Reviewer/data owner approves output. |
| V0.9 | C | **Repeated safety workflows** | Templates/rules learned across repeated real changes | `PROPOSED` | At least 3 comparable reviews, no unsafe generalization. |
| V1.0 | C | **Paid Safety Change Control** | Repeatable human-authority workflow | `VISION` | Paid customer + named safety owner + repeated value. |
| V1.5 | C | **Standards/assurance linkage** | Trace requirements/evidence without auto-compliance claims | `RESEARCH_ONLY` | Real assessor/safety demand. |

## Scope A — current assets / offline
### V0.1 — Safety change lens
**Result:** Read-only view of change/evidence/approval relationships  
**Status:** `CONCEPT_PROTOTYPE`  
**Gate:** Clear non-claims and shared truth only.


## Scope B — requires real actor/case/artifact
### V0.2 — Real safety-change reconstruction
**Result:** One real change + hazard/test/approval artifact set  
**Status:** `PROPOSED_NEXT`  
**Gate:** Safety actor confirms actual process and decision points.

### V0.3 — Hazard/Control/Review contract
**Result:** Define actor-specific objects only from real artifacts  
**Status:** `PROPOSED`  
**Gate:** Schema proposal maps 1:1 to recurring records.

### V0.4 — Deterministic safety-impact mapping
**Result:** Change slots/components → candidate reviews/re-tests  
**Status:** `PROPOSED`  
**Gate:** Practitioner-reviewed golden cases; suggestions not conclusions.

### V0.5 — Safety workbench
**Result:** Queue of affected hazards/controls/tests/approvals  
**Status:** `PROPOSED`  
**Gate:** One case operated end-to-end.

### V0.6 — Re-test + re-approval evidence
**Result:** Persist named actions, evidence and decision history  
**Status:** `PROPOSED`  
**Gate:** Old approvals remain immutable; new decisions are explicit.

### V0.7 — Incident-triggered review
**Result:** Incident facts can reopen relevant safety review  
**Status:** `PROPOSED`  
**Gate:** Real incident/change case validates semantics.

### V0.8 — Safety change pack
**Result:** Controlled report for internal/assurance use  
**Status:** `PROPOSED`  
**Gate:** Reviewer/data owner approves output.


## Scope C — repetition / commercial / scale
### V0.9 — Repeated safety workflows
**Result:** Templates/rules learned across repeated real changes  
**Status:** `PROPOSED`  
**Gate:** At least 3 comparable reviews, no unsafe generalization.

### V1.0 — Paid Safety Change Control
**Result:** Repeatable human-authority workflow  
**Status:** `VISION`  
**Gate:** Paid customer + named safety owner + repeated value.

### V1.5 — Standards/assurance linkage
**Result:** Trace requirements/evidence without auto-compliance claims  
**Status:** `RESEARCH_ONLY`  
**Gate:** Real assessor/safety demand.


## Stop rule
If a gate fails, mark the version BLOCKED/MODIFY/MERGE/KILL rather than advancing numerically.
