# Portfolio / Accumulation Intelligence — Version Roadmap

| Version | Scope | Increment | Result | Status | Gate |
|---|:---:|---|---|---|---|
| V0.1 | A | **Portfolio data contract** | Define minimum exposure/dependency/provenance schema without building product claims | `RESEARCH_ONLY` | Contract identifies required fields and permission boundaries. |
| V0.2 | C | **Governed sample dataset** | Acquire authorized multi-account/sample portfolio | `BLOCKED_DATA` | Enough records to test normalization without customer leakage. |
| V0.3 | C | **Dependency taxonomy** | Normalize OEM/model/version/software/site/vendor relationships | `BLOCKED_DATA` | Taxonomy validated against real portfolio records. |
| V0.4 | C | **Accumulation Engine** | Deterministic counts/concentrations/common dependencies with quality flags | `PROPOSED_AFTER_DATA` | Reproducible outputs; missing data explicit. |
| V0.5 | C | **Portfolio Workbench** | Explore concentration by technology/version/vendor/deployment dimension | `VISION` | Portfolio actor validates decision usefulness. |
| V0.6 | C | **Advisory/change propagation** | Map systemic release/advisory to authorized portfolio footprint | `VISION` | One real systemic-change exercise. |
| V0.7 | C | **Incident/outcome aggregation** | Aggregate only governed, comparable events | `RESEARCH_ONLY` | Outcome semantics and rights validated. |
| V0.8 | C | **Scenario overlays** | Simulation clearly separated from observed exposure | `RESEARCH_ONLY` | Scenario provenance/model governance. |
| V0.9 | C | **Capacity workflow integration** | Human portfolio decisions can reference evidence, not be automated | `VISION` | Real capacity workflow. |
| V1.0 | C | **Paid Portfolio Intelligence** | Repeatable portfolio/capacity use case | `VISION` | Paid portfolio actor + recurring decisions. |
| V1.5 | C | **Cross-portfolio benchmarks** | Only with sufficient rights/cohort quality | `RESEARCH_ONLY` | Large governed dataset. |

## Scope A — current assets / offline
### V0.1 — Portfolio data contract
**Result:** Define minimum exposure/dependency/provenance schema without building product claims  
**Status:** `RESEARCH_ONLY`  
**Gate:** Contract identifies required fields and permission boundaries.


## Scope B — requires real actor/case/artifact


## Scope C — repeated cases / commercial / intelligence
### V0.2 — Governed sample dataset
**Result:** Acquire authorized multi-account/sample portfolio  
**Status:** `BLOCKED_DATA`  
**Gate:** Enough records to test normalization without customer leakage.

### V0.3 — Dependency taxonomy
**Result:** Normalize OEM/model/version/software/site/vendor relationships  
**Status:** `BLOCKED_DATA`  
**Gate:** Taxonomy validated against real portfolio records.

### V0.4 — Accumulation Engine
**Result:** Deterministic counts/concentrations/common dependencies with quality flags  
**Status:** `PROPOSED_AFTER_DATA`  
**Gate:** Reproducible outputs; missing data explicit.

### V0.5 — Portfolio Workbench
**Result:** Explore concentration by technology/version/vendor/deployment dimension  
**Status:** `VISION`  
**Gate:** Portfolio actor validates decision usefulness.

### V0.6 — Advisory/change propagation
**Result:** Map systemic release/advisory to authorized portfolio footprint  
**Status:** `VISION`  
**Gate:** One real systemic-change exercise.

### V0.7 — Incident/outcome aggregation
**Result:** Aggregate only governed, comparable events  
**Status:** `RESEARCH_ONLY`  
**Gate:** Outcome semantics and rights validated.

### V0.8 — Scenario overlays
**Result:** Simulation clearly separated from observed exposure  
**Status:** `RESEARCH_ONLY`  
**Gate:** Scenario provenance/model governance.

### V0.9 — Capacity workflow integration
**Result:** Human portfolio decisions can reference evidence, not be automated  
**Status:** `VISION`  
**Gate:** Real capacity workflow.

### V1.0 — Paid Portfolio Intelligence
**Result:** Repeatable portfolio/capacity use case  
**Status:** `VISION`  
**Gate:** Paid portfolio actor + recurring decisions.

### V1.5 — Cross-portfolio benchmarks
**Result:** Only with sufficient rights/cohort quality  
**Status:** `RESEARCH_ONLY`  
**Gate:** Large governed dataset.


## Rule
A later version is not permission to skip an earlier evidence gate. Failed gates result in BLOCKED/MODIFY/MERGE/KILL, not automatic progression.
