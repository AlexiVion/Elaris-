# Product & Field Evidence — Version Roadmap

| Version | Scope | Increment | Result | Status | Gate |
|---|:---:|---|---|---|---|
| V0.1 | A | **Product identity contract** | Vendor/product/version/lot/build references mapped to shared configuration | `DRAFT` | Stable IDs can reference existing config without new duplicated robot truth. |
| V0.2 | B | **Real release/advisory reconstruction** | One OEM/component/software release or advisory mapped to real deployments | `PROPOSED_NEXT` | Vendor actor confirms affected-unit workflow and artifacts. |
| V0.3 | B | **Release Evidence Pack** | Versioned release metadata + supporting evidence + authoritative source refs | `PROPOSED` | One real release package reconstructed with provenance. |
| V0.4 | A/B | **Affected Deployment Engine** | Deterministic query from changed product/version to deployed configs | `PROPOSED` | Golden cases avoid false matches and preserve unknowns. |
| V0.5 | B | **Vendor Workbench** | Releases, deployed footprint, open evidence requests/advisories | `PROPOSED` | Real vendor can inspect one case end-to-end. |
| V0.6 | B | **Advisory / notification workflow** | Human-approved advisory scoped to proven affected deployments | `PROPOSED` | No automated recall; recipient list traceable. |
| V0.7 | B | **Field Feedback Loop** | Service/incidents/component evidence linked back to exact product version | `PROPOSED` | At least one field outcome returns to vendor context. |
| V0.8 | B | **Controlled partner evidence share** | Purpose/audience/export governance for release evidence | `PROPOSED` | Data owners authorize sharing. |
| V0.9 | C | **PLM/release integrations** | Integrate only repeated source-system pain | `DEFERRED` | At least two repeated workflows require source integration. |
| V1.0 | C | **Paid Product & Field Evidence** | Repeatable release→deployment→field-feedback workflow | `VISION` | Paid vendor/OEM + repeated cases. |
| V1.5 | C | **Multi-vendor dependency graph** | Track shared dependencies across products without inventing causation | `RESEARCH_ONLY` | Multiple real vendors/configs and stable identifiers. |

## Scope A — current assets / offline
### V0.1 — Product identity contract
**Result:** Vendor/product/version/lot/build references mapped to shared configuration  
**Status:** `DRAFT`  
**Gate:** Stable IDs can reference existing config without new duplicated robot truth.

### V0.4 — Affected Deployment Engine
**Result:** Deterministic query from changed product/version to deployed configs  
**Status:** `PROPOSED`  
**Gate:** Golden cases avoid false matches and preserve unknowns.


## Scope B — requires real actor/case/artifact
### V0.2 — Real release/advisory reconstruction
**Result:** One OEM/component/software release or advisory mapped to real deployments  
**Status:** `PROPOSED_NEXT`  
**Gate:** Vendor actor confirms affected-unit workflow and artifacts.

### V0.3 — Release Evidence Pack
**Result:** Versioned release metadata + supporting evidence + authoritative source refs  
**Status:** `PROPOSED`  
**Gate:** One real release package reconstructed with provenance.

### V0.4 — Affected Deployment Engine
**Result:** Deterministic query from changed product/version to deployed configs  
**Status:** `PROPOSED`  
**Gate:** Golden cases avoid false matches and preserve unknowns.

### V0.5 — Vendor Workbench
**Result:** Releases, deployed footprint, open evidence requests/advisories  
**Status:** `PROPOSED`  
**Gate:** Real vendor can inspect one case end-to-end.

### V0.6 — Advisory / notification workflow
**Result:** Human-approved advisory scoped to proven affected deployments  
**Status:** `PROPOSED`  
**Gate:** No automated recall; recipient list traceable.

### V0.7 — Field Feedback Loop
**Result:** Service/incidents/component evidence linked back to exact product version  
**Status:** `PROPOSED`  
**Gate:** At least one field outcome returns to vendor context.

### V0.8 — Controlled partner evidence share
**Result:** Purpose/audience/export governance for release evidence  
**Status:** `PROPOSED`  
**Gate:** Data owners authorize sharing.


## Scope C — repeated cases / commercial / intelligence
### V0.9 — PLM/release integrations
**Result:** Integrate only repeated source-system pain  
**Status:** `DEFERRED`  
**Gate:** At least two repeated workflows require source integration.

### V1.0 — Paid Product & Field Evidence
**Result:** Repeatable release→deployment→field-feedback workflow  
**Status:** `VISION`  
**Gate:** Paid vendor/OEM + repeated cases.

### V1.5 — Multi-vendor dependency graph
**Result:** Track shared dependencies across products without inventing causation  
**Status:** `RESEARCH_ONLY`  
**Gate:** Multiple real vendors/configs and stable identifiers.


## Rule
A later version is not permission to skip an earlier evidence gate. Failed gates result in BLOCKED/MODIFY/MERGE/KILL, not automatic progression.
