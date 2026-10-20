# Elaris Component Health — Comprehensive G1 Field Technical Report (editorial contract)
**Date:** 2026-10-19
**State:** INTERNAL EDITORIAL SPECIFICATION — NO REAL ROBOT DATA STORED IN GIT
**Goal:** build a comprehensive engineering report first. An executive summary, public case study and commercial handoff are separate later deliverables.

## Authoritative source and scope
- Source of truth: private, integrity-verified `field-evidence-v03.json` (Component Health V0.3, SHA verified with companion `checksums.sha256`), NOT the three-page overview PDF.
- Observed case: one Unitree G1 at Siglo 21, 2026-10-06. Source packages: baseline Dataset #001 FINALIZED; Dataset #002 salvage integrity VERIFIED but session OPEN. Do not relabel the latter FINALIZED.
- Two reruns A/B of the same V0.3 input were byte-for-byte identical; never call them separate robot sessions.
- 8 HUMAN_CONFIRMED phases, 29 OEM-indexed G1 joint slots per phase (232 phase/slot positions). Slot availability is not proof of a healthy joint. Primary comparison: `IDLE_BASELINE` in the same Dataset #002; historical Dataset #001 only secondary context.
- Valid signal families: `joint.position`, `joint.velocity`, `joint.torque_estimate`, `motor.voltage`, `motor.temperature.casing`, `motor.temperature.winding`, `motor.state_code`. V0.3 does NOT assess `joint.acceleration` as one of the 7 signals despite its presence in the raw adapter.
- The source V0.3 contract includes every joint/phase `signals` summary (`samples`, `uniqueTimestamps`, `coverage`, `quality`, `min`, `p05`, `mean`, `p50`, `p95`, `max`, `absP95`, `first`, `last`, `delta`), same-session idle comparison (`meanDelta`, `p95Delta`, `absP95Delta`, `absP95Ratio`, `rangeDelta`), any state codes observed, phase quality and discrete findings. Fields absent/null remain absent/null. All metrics require truthful units and semantic caveats.
- Private data classification: SENSITIVE. Development review is not evidence-owner authorization; no external sharing until independent approval for version, recipients, purpose and permitted derivatives. Do not commit detailed real derived tables, PDFs, raw data, private authorization records or absolute file paths in public GitHub.

## Required architecture of the comprehensive report

A. Cover / version control / classification / reviewer record / descriptive scope.
B. Scientific questions, objectives and limits: descriptive observational evidence only; not health diagnosis, service release, safety clearance, OEM compliance, predictive maintenance or actuarial underwriting.
C. System profile: G1 robot model, 29 joint mapping (variant-dependent caveats), owner/host identity only as permitted; firmware/serial/version UNKNOWN unless sourced.
D. Experimental design: read-only SDK2/DDS `rt/lowstate` capture, separate human-authorized movement processes, eight declared operating phases, local encrypted capture, clocks, phase marker revisions and comparison design.
E. Custody, integrity and reproducibility: finalized historical baseline, salvaged OPEN main session, original/derived hashes and distinction between file-integrity and independently proven content equivalence.
F. Session chronology: commanded and observed phase bounds side by side, duration, observed frame count, start lag and end gap, major data gaps; compare declared total, frames inside phase windows and capture total without attributing differences without timestamps.
G. Measurement dictionary: OEM mapping, units, confidence/semantics status, unavailable or uninterpretable channels, accumulation method, percentiles; state codes are raw numeric observations without externally verified enum.
H. Per-phase chapters (8): activity/purpose, recorded operator actions, observability and metrics by component, selected distributions, torque estimate fingerprints relative to same-session idle, data quality, per-phase limitations, permissible conclusions.
I. 29 per-component dossiers: source component ID/name/OEM index, variant-dependent status, table of seven signals for all 8 phases, signal quality/sample/unique timestamps/coverage, summary statistics and same-session idle comparisons, observed state codes, unresolved/OEM semantics, traceable follow-up question. **Never infer a mechanical defect from CONSTANT_ZERO, UNRESOLVED or a ratio.**
J. Cross-phase 29x8 matrix of signal coverage and missingness; side-by-side amplitude/mean/absP95 by phase. Charts may show values only from source, with explicit units, axis scale and caveats; null stays blank.
K. Data quality: group counts and examples, duplicated signal timestamps (not necessarily duplicate frames), constant zeros, OEM semantics, unresolved slots, timestamp continuity, gap end, coverage denominator.
L. Focused analysis of unresolved RightWristYaw / index 28: what is observed, configuration/29 DOF evidence, distinction mapping vs availability vs operational behavior; discriminating next field test under separately authorized human operation.
M. Limited probe and actuation log: shoulder roll and pitch command-vs-observed summaries, bounded locomotion/turning results, code 3104 as unresolved command response; recorder remained read-only.
N. Methodological checks: provenance, technical reproducibility, output checkums, phase-frame allocation and potential 88-frame discrepancy between overview phase counts and salvaged capture total; **the difference is not automatically lost data**.
O. Claims and non-claims register: each reported conclusion labeled `OBSERVED`, `HUMAN_DECLARED`, `DERIVED`, `OEM_CONFIRMED`, `UNRESOLVED`, `NOT_ASSESSED`; include exact source path/analysisId/phase/component/signal.
P. Engineering actions: specific verification question, expected evidence, owner, method, dependencies, urgency defined by data-review needs (not a safety-severity score), close criteria and reason if new capture required.
Q. Conclusions bounded to observed session; no generic robot health verdict.
R. Complete appendices: 29 OEM joint mapping; 8 phase manifest; signal dictionary; all 232 joint/phase table references; data-quality code definitions; processing/software versions; checksum and artifact reference **appropriately redacted for reader**; reviewed factual corrections and document release history.

## Observed benchmarks, supplied by existing canonical repo records (not new measurements)

- Dataset #001: 1,031 frames, 248,471 normalized events, 29 joint slots catalogued, 28 usable, one unresolved.
- Dataset #002: 15,000 preserved frames and 3,615,000 normalized events; `OPEN` salvaged with SHA-256 verified; interrupted collector at robot power-off. Dataset #002 is not an orderly finalized capture.
- 8 phase counts in the earlier private draft: 1,498; 6,492; 1,447; 1,522; 933; 953; 1,178; 889 = 14,912 phase-assigned frames. Difference from 15,000 = 88. This is a `RECONCILIATION_REQUIRED` note; determine whether the remaining frames are outside phase windows, on boundaries, excluded by normalization/selection or something else. Do not claim loss or corruption.
- Quality record categories in earlier private draft: 928 OEM semantics not confirmed + 406 duplicated signal timestamp + 272 constant zero + 8 unresolved component slot + 1 phase observation ends before declared end = 1,615 findings. They are **not** faults.
- Documented V0.3 last observed Recovery Idle telemetry: 2026-10-06T15:45:55.399Z vs human-declared end 2026-10-06T15:53:49Z. Gap 473.601 seconds, not proof of hardware fault.
- The legacy PDF first page displayed `Local review authorized by: Todos`. That field is invalid provenance metadata: must **never** be represented as authorization of any person. Keep release gate separate from local technical review.

## Technical acceptance criteria (all required before claiming comprehensive dossier complete)

1. Re-ingest source V0.3 locally after `inspect` verifies all checksums, version, observed classification, 29-slot rows and lineage. No new robot capture needed for existing data.
2. Generate exactly eight per-phase sections and 29 per-component dossiers, cross-checked against 232 phase/component entries, plus all 7 signal families where present; fail if missing/duplicate IDs, divergent robot/session, non-finite computed numbers or out-of-range coverage.
3. Output both reader-friendly technical PDF and machine-readable traceable annex (CSV/JSON) under private workspace; never write source, derived results, or authorization files to Git.
4. Show explicit missing/null data and assumptions. No units assigned to OEM channels whose conversion is not confirmed. No predictive / diagnostic / pass-fail / safety claims.
5. Reconcile observed vs declared timestamps and 14,912 vs 15,000 frame denominator or disclose that reconciliation remains unresolved with reproducible investigation procedure.
6. Human reviewer verifies values, chart axes, units, phase names, notes, important unexpected readings, duplicate finding deduplication, narrative accuracy, document layout and any generated 29x8 cross-section.
7. Private `INTERNAL DRAFT / NOT APPROVED FOR EXPORT` watermark remains even when technically complete. Separate external approval for commercial version.
8. Only run one focused set of test fixtures; avoid repeated full monorepo jobs.
9. Explicitly separate genuine measured outcomes from executed robot commands (a returned code of 0 is not independent position tracking proof).

## Next engineering task

Build a private local **comprehensive technical report renderer** that reads the verified V0.3 pack in place and creates a *new* private output directory. It must not require a repetitive authorization **questionnaire for editing iterations**; instead it truthfully labels internal development drafts as unapproved for any external sharing and does not claim that the owner signed off. The separate `prepare`/external handoff authorization mechanism remains intact. Tests must use synthetic data only. No real data may enter GitHub.

## Editorial quality bar

Depth takes priority over length: include every useful measured datum supported by the source, with tables, selected plots, uncertainty and operational interpretation. Appendices may be extensive. Do not produce a short marketing summary in place of the comprehensive technical report. A later executive report can be derived from a technically reviewed, authorized comprehensive source.
