# Product System — Deployment Control

## Status

**PILOT / LIVE REFERENCE PRODUCT**

Deployment Control is the current reference Elaris product and the depth benchmark for other product demos.

Humandroid is the first design/pilot partner.

## Primary actor

Robotics Integrator / Solution Provider / Deployer / RaaS operator.

## Problem / decision

> **What system is actually deployed, under which configuration, what evidence and approvals support it, and what deserves review when it changes?**

## Trigger

- new deployment;
- new configuration;
- hardware/software/task/environment change;
- evidence change;
- incident.

## Inputs

### Shared Elaris inputs

- Organization
- Robot
- ConfigurationSnapshot / ConfigItem
- Deployment / task / site
- Baseline
- Evidence / Requirement
- Approval
- Change / ImpactItem
- Incident
- Audit / Share

### External inputs

Initially manual/assisted intake of real deployment artifacts.

Future integrations only after repeated source-system pain is observed.

## System process

```text
Real system / deployment
        ↓
capture exact configuration
        ↓
link deployment context
        ↓
link evidence + requirements + named approvals
        ↓
freeze baseline
        ↓
change occurs
        ↓
before/after diff
        ↓
deterministic impact rules
        ↓
human review / re-test / re-approval
        ↓
new baseline
        ↓
reports / share / historical reconstruction
```

## AI role

AI is optional support around the deterministic core.

Potential roles:
- extract data from documents;
- suggest links/classifications;
- summarize evidence;
- assist intake;
- help find relevant records.

AI is **not** the authority for:
- change approval;
- safety acceptance;
- certification;
- engineering judgment.

## Deterministic logic

Current deterministic engine includes:
- configuration hashing;
- before/after diff;
- impact rules;
- readiness;
- evidence coverage.

This logic must remain reproducible and DB-independent where practical.

## Human authority

Named humans record approvals/reviews.

Elaris never says:
- “Elaris approved”;
- “certified”;
- “safe”;
- “compliant” as an automated conclusion.

## Outputs

- System Passport
- Deployment Readiness Pack
- Change Impact Report
- read-only Share View
- reconstructable baseline/configuration history

## Shared data reused

Deployment Control is currently the principal producer/consumer of the shared technical substrate.

## New data created

High-value structured facts include:
- exact configuration snapshots;
- baselines;
- explicit change diffs;
- impact/review history;
- evidence relationships;
- approval history;
- incident-to-configuration linkage.

These facts are candidates for reuse by other Product Systems.

## Product boundaries

### This product is

Versioned deployment/change/evidence coordination infrastructure.

### This product is not

- PLM;
- fleet telemetry/observability;
- CMMS;
- robot control;
- safety certification authority;
- automated risk score.

## Current next validation

Selected real case: **Humandroid Unitree G1 hosted at Universidad Siglo 21 under an institutional agreement**.

This is not a task-specific production deployment and must not be forced into a fictional customer/task model.

Current sequence:

1. generalize placement context so provider/host/customer/task are semantically distinct;
2. represent the real Siglo 21 placement without fake commercial facts;
3. attach authorized existing field-evidence references;
4. freeze a real reference baseline;
5. only after that, observe or reconstruct a real material change;
6. compare Elaris against Humandroid's actual process.

See `docs/product/deployment-control/cases/siglo21-humandroid-institutional-placement-v0.md` and `docs/product/deployment-control/v0.5.1-placement-context-semantics.md`.

## Next adjacent hypothesis

**Component Health** should be investigated with Humandroid as a separate Product System hypothesis, not silently added as a Deployment Control feature.

See [Component Health](component-health-hypothesis.md).
