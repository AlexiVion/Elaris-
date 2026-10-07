# Evidence Review — Version Roadmap

**Rule:** roadmap defines scopes and gates; it does not authorize implementation automatically.

| Version | Scope | Increment | Result | Status | Gate |
|---|:---:|---|---|---|---|
| V0.1 | A | **Assessment lens** | Read-only scope/evidence/findings prototype | `CONCEPT_PROTOTYPE` | No false certification/sufficiency claims. |
| V0.2 | B | **Real assessment reconstruction** | One assessment artifact set and reviewer interview | `PROPOSED_NEXT` | Real scope, evidence, findings and decision lifecycle documented. |
| V0.3 | B | **Assessment Domain Contract** | AssessmentScope, SubmissionRef, Finding, Correction, Decision candidates | `PROPOSED` | Objects proven recurring by artifacts. |
| V0.4 | A/B | **Evidence integrity engine** | Version/provenance/completeness/change-impact checks | `PROPOSED` | Deterministic outputs reproducible and assessor-reviewed. |
| V0.5 | B | **Assessor workbench** | Scope, submitted evidence, findings and corrections | `PROPOSED` | One real case reviewable end-to-end. |
| V0.6 | B | **Finding lifecycle persistence** | Raise/respond/review/close with immutable history | `PROPOSED` | Named assessor authority preserved. |
| V0.7 | B | **Change-triggered reassessment** | Deployment change identifies possibly affected prior scope/evidence | `PROPOSED` | Real change case validates reopen rules. |
| V0.8 | B | **Controlled assessment output** | Review pack/report/share with provenance | `PROPOSED` | Recipient/purpose/data approval passed. |
| V0.9 | C | **Repeated assessment templates** | Reusable scopes/checklists where field evidence supports | `PROPOSED` | Multiple real assessments. |
| V1.0 | C | **Paid Evidence Review Workspace** | Repeatable workflow for defined assurance actor | `VISION` | Paid repeated use. |
| V1.5 | C | **Lab/tool integrations** | Import test/lab systems only when repeated pain exists | `VISION` | Validated integration demand. |

## Scope A — current assets / offline
### V0.1 — Assessment lens
**Result:** Read-only scope/evidence/findings prototype  
**Status:** `CONCEPT_PROTOTYPE`  
**Gate:** No false certification/sufficiency claims.

### V0.4 — Evidence integrity engine
**Result:** Version/provenance/completeness/change-impact checks  
**Status:** `PROPOSED`  
**Gate:** Deterministic outputs reproducible and assessor-reviewed.


## Scope B — requires real actor/case/artifact
### V0.2 — Real assessment reconstruction
**Result:** One assessment artifact set and reviewer interview  
**Status:** `PROPOSED_NEXT`  
**Gate:** Real scope, evidence, findings and decision lifecycle documented.

### V0.3 — Assessment Domain Contract
**Result:** AssessmentScope, SubmissionRef, Finding, Correction, Decision candidates  
**Status:** `PROPOSED`  
**Gate:** Objects proven recurring by artifacts.

### V0.4 — Evidence integrity engine
**Result:** Version/provenance/completeness/change-impact checks  
**Status:** `PROPOSED`  
**Gate:** Deterministic outputs reproducible and assessor-reviewed.

### V0.5 — Assessor workbench
**Result:** Scope, submitted evidence, findings and corrections  
**Status:** `PROPOSED`  
**Gate:** One real case reviewable end-to-end.

### V0.6 — Finding lifecycle persistence
**Result:** Raise/respond/review/close with immutable history  
**Status:** `PROPOSED`  
**Gate:** Named assessor authority preserved.

### V0.7 — Change-triggered reassessment
**Result:** Deployment change identifies possibly affected prior scope/evidence  
**Status:** `PROPOSED`  
**Gate:** Real change case validates reopen rules.

### V0.8 — Controlled assessment output
**Result:** Review pack/report/share with provenance  
**Status:** `PROPOSED`  
**Gate:** Recipient/purpose/data approval passed.


## Scope C — repetition / commercial / scale
### V0.9 — Repeated assessment templates
**Result:** Reusable scopes/checklists where field evidence supports  
**Status:** `PROPOSED`  
**Gate:** Multiple real assessments.

### V1.0 — Paid Evidence Review Workspace
**Result:** Repeatable workflow for defined assurance actor  
**Status:** `VISION`  
**Gate:** Paid repeated use.

### V1.5 — Lab/tool integrations
**Result:** Import test/lab systems only when repeated pain exists  
**Status:** `VISION`  
**Gate:** Validated integration demand.


## Stop rule
If a gate fails, mark the version BLOCKED/MODIFY/MERGE/KILL rather than advancing numerically.
