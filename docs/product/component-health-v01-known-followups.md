# Component Health V0.1 — Known Follow-ups

These items are known engineering improvements.

They do not block commercial validation of the Field Evidence Audit.

## P1 — phase coverage semantics

Observed samples may exceed the reported phase frame denominator at a phase
boundary.

Do not hide this by clamping coverage to 100%.

Frame and sample inclusion rules must use the same boundary semantics.

## P1 — observed telemetry window

Store separately:

- declared phase start;
- declared phase end;
- observed telemetry start;
- observed telemetry end;
- observed frame count;
- phase completeness.

This is especially important for salvaged OPEN captures.

## P1 — large capture review

The generic capture review path should stream large encrypted telemetry files
rather than materializing the entire payload as one string.

## P1 — client-safe report

Introduce an explicit human-reviewed export step that separates:

- SENSITIVE engineering evidence;
- APPROVED derived client-facing material.

## P2 — repeated baselines

Collect repeated comparable sessions before defining thresholds or trend rules.

No predictive or diagnostic interpretation is permitted from the current
single-session evidence.
