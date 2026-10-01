# Product System — Underwriting Workspace

## Status

**HYPOTHESIS · CONCEPT PROTOTYPE**

The product thesis is specified, but current UI is not yet at the same full-demo depth as Placement/Deployment Control.

## Primary actor

Insurer / MGA / MGU / Underwriter / Risk Engineer.

## Problem / decision

> **Do we understand the real deployed exposure well enough to make our underwriting decision, what questions/conditions remain, and what later changes deserve re-review?**

## Trigger

- new submission;
- renewal;
- referral;
- material change;
- incident/loss notification.

## Inputs

### Shared Elaris inputs

- Organization
- Robot
- Configuration
- Deployment
- Evidence / Requirement
- Change
- Incident
- Audit

### Insurance-specific hypothesis inputs

- submission;
- requested coverage context;
- broker answers;
- underwriter questions;
- conditions;
- referral/authority context;
- policy/reference metadata.

## System process

```text
Submission arrives
       ↓
reconstruct actual deployed exposure
       ↓
review configuration / task / site / evidence / incidents
       ↓
identify missing information
       ↓
questions to broker/client
       ↓
technical review / referral where needed
       ↓
human underwriting decision + conditions
       ↓
record decision context
       ↓
monitor material technical changes/incidents
       ↓
re-review when relevant
```

## AI role

Potential roles:
- extract structured facts from submissions;
- reconcile submission statements with Elaris deployment facts;
- identify information gaps;
- retrieve relevant evidence;
- draft technical questions;
- summarize material change since prior review.

AI must not autonomously:
- price risk;
- accept/decline risk;
- set coverage;
- bind coverage;
- represent underwriting authority.

## Deterministic logic

Useful deterministic capabilities:
- configuration/version reconstruction;
- technical change diff;
- evidence relationship queries;
- incident chronology;
- versioned decision context.

## Human authority

Underwriting authority remains with the insurer/MGA and named humans.

Elaris records/assists the workflow; it does not make the insurance decision.

## Outputs

- Technical Underwriting File
- Open Questions
- Conditions Record
- Material Change Brief
- versioned human decision record

## Shared data reused

This product tests a central Elaris thesis:

> technical facts produced during real deployments may later support insurance decisions without being recreated from scratch.

## New data created

Potentially:
- Underwriting Case
- Exposure
- Question
- Condition
- Decision
- Coverage/Policy reference
- Referral

Do not add these to shared persistence until field validation.

## Validation plan

### Real actor

Underwriter or risk engineer at insurer/MGA/MGU with responsibility for emerging technology, robotics, industrial risk, product liability, tech E&O/cyber or adjacent exposure.

### Core interview prompt

> **Mostrame el último caso técnico difícil que tuviste que entender para tomar una decisión.**

### Test

- which facts actually change yes/no/terms/referral;
- what information arrives from brokers;
- what is usually missing;
- how technical evidence is assessed;
- what must be monitored after binding;
- whether a configuration/deployment change can be meaningfully mapped to re-review.

### Kill criteria

If exact deployment/configuration evidence rarely changes underwriting work, this should not become a standalone product merely because the UI is plausible.

## Next action

Run an underwriting interview before expanding the backend or implementing automated risk/pricing logic.
