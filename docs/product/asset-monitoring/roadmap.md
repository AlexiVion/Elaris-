# Asset Monitoring — Version Roadmap

| Version | Scope | Increment | Result | Status | Gate |
|---|:---:|---|---|---|---|
| V0.1 | A | **Asset relationship model** | Map economic asset reference to Robot/config/deployment without duplicating technical truth | `DRAFT` | Stable linkage supports historical lookup. |
| V0.2 | B | **Real financed-asset case** | Reconstruct one financed/leased robotics asset lifecycle | `PROPOSED_NEXT` | Economic owner identifies material technical events and artifacts. |
| V0.3 | B | **Material Event Contract** | Service/change/incident/inspection event semantics validated | `PROPOSED` | No automatic economic materiality. |
| V0.4 | A/B | **Asset History Engine** | Deterministic timeline and technical state-at-date | `PROPOSED` | Historical state reproducible. |
| V0.5 | B | **Economic Owner Workbench** | Portfolio/list, asset detail, open information/review events | `PROPOSED` | One real asset case navigable. |
| V0.6 | B | **Condition / covenant review** | Human review record linked to evidence/config | `PROPOSED` | No valuation/credit decision produced. |
| V0.7 | B | **Service/incident/change feed** | Reuse shared events instead of copying reports | `PROPOSED` | Real events update owner view with provenance. |
| V0.8 | B | **Controlled asset evidence pack** | Inspection/service/config history for authorized recipient | `PROPOSED` | Data rights verified. |
| V0.9 | C | **Portfolio view** | Cross-asset technical events and evidence gaps | `PROPOSED` | Multiple real financed assets. |
| V1.0 | C | **Paid Asset Monitoring** | Repeatable economic-owner technical evidence workflow | `VISION` | Paid lender/lessor and repeated use. |
| V1.5 | C | **Finance system integration** | Integrate asset schedules/workflows when justified | `DEFERRED` | Validated system-of-record need. |

## Scope A — current assets / offline
### V0.1 — Asset relationship model
**Result:** Map economic asset reference to Robot/config/deployment without duplicating technical truth  
**Status:** `DRAFT`  
**Gate:** Stable linkage supports historical lookup.

### V0.4 — Asset History Engine
**Result:** Deterministic timeline and technical state-at-date  
**Status:** `PROPOSED`  
**Gate:** Historical state reproducible.


## Scope B — requires real actor/case/artifact
### V0.2 — Real financed-asset case
**Result:** Reconstruct one financed/leased robotics asset lifecycle  
**Status:** `PROPOSED_NEXT`  
**Gate:** Economic owner identifies material technical events and artifacts.

### V0.3 — Material Event Contract
**Result:** Service/change/incident/inspection event semantics validated  
**Status:** `PROPOSED`  
**Gate:** No automatic economic materiality.

### V0.4 — Asset History Engine
**Result:** Deterministic timeline and technical state-at-date  
**Status:** `PROPOSED`  
**Gate:** Historical state reproducible.

### V0.5 — Economic Owner Workbench
**Result:** Portfolio/list, asset detail, open information/review events  
**Status:** `PROPOSED`  
**Gate:** One real asset case navigable.

### V0.6 — Condition / covenant review
**Result:** Human review record linked to evidence/config  
**Status:** `PROPOSED`  
**Gate:** No valuation/credit decision produced.

### V0.7 — Service/incident/change feed
**Result:** Reuse shared events instead of copying reports  
**Status:** `PROPOSED`  
**Gate:** Real events update owner view with provenance.

### V0.8 — Controlled asset evidence pack
**Result:** Inspection/service/config history for authorized recipient  
**Status:** `PROPOSED`  
**Gate:** Data rights verified.


## Scope C — repeated cases / commercial / intelligence
### V0.9 — Portfolio view
**Result:** Cross-asset technical events and evidence gaps  
**Status:** `PROPOSED`  
**Gate:** Multiple real financed assets.

### V1.0 — Paid Asset Monitoring
**Result:** Repeatable economic-owner technical evidence workflow  
**Status:** `VISION`  
**Gate:** Paid lender/lessor and repeated use.

### V1.5 — Finance system integration
**Result:** Integrate asset schedules/workflows when justified  
**Status:** `DEFERRED`  
**Gate:** Validated system-of-record need.


## Rule
A later version is not permission to skip an earlier evidence gate. Failed gates result in BLOCKED/MODIFY/MERGE/KILL, not automatic progression.
