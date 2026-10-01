# Humandroid Pilot Spec — Elaris Deployment Control

## 1. Objective

Validate Elaris Deployment Control with:

**1 Unitree G1 + 1 configuration + 1 real deployment + 1 real or representative change.**

The pilot should prove whether Elaris improves a real recurring workflow between “the robot works” and “the robot can be deployed and kept valid as it changes”.

## 2. What we offer Humandroid

> A living system that tells Humandroid what is actually deployed, under which configuration, what evidence supports it, what is missing, and what may require review when the system changes.

## 3. Pilot user

Humandroid acts as a robotics integrator / solution provider / deployer.

## 4. Questions the pilot must answer

- What robot and configuration are actually deployed?
- What task and environment apply?
- What tests, documents and requirements support that deployment?
- What is missing or unresolved?
- What changed since the approved/reference baseline?
- What evidence, requirements or approvals may need review because of that change?

## 5. Included scope

- robot identity and major components;
- configuration snapshots;
- firmware/software/model/skill versions that matter;
- task, environment and operating mode;
- customer/internal requirements;
- tests and evidence;
- human approvals;
- gaps/readiness;
- configuration changes;
- deterministic change impact;
- reports/views generated from the same core.

## 6. Out of scope

- robot control;
- replacing Git / ROS / PLM / fleet tools;
- full telemetry ingestion;
- safety certification;
- automatic legal conclusions;
- insurance pricing / risk scores;
- policy sales;
- full multi-tenant SaaS infrastructure;
- general-purpose AI assistant.

## 7. Pilot process

Collect → Structure → Link → Identify gaps → Create baseline → Apply change → Analyze impact → Generate outputs → Humandroid review.

## 8. Deliverables

1. System Passport
2. Deployment Record
3. Evidence Map
4. Readiness / Gap View
5. Change Impact Report
6. At least two actor-specific outputs from the same underlying record

## 9. Change-impact rule

Elaris does not automatically invalidate evidence or approvals.

Allowed outcomes:

- No impact detected
- Potentially impacted
- Review required
- Re-test suggested
- Update required

The final decision remains human.

## 10. Responsibilities

### Humandroid
- choose the real deployment;
- provide/redact artifacts it is allowed to share;
- confirm actual configuration;
- validate or correct Elaris relationships and outputs.

### Elaris
- structure the information;
- preserve provenance and version history;
- link evidence/requirements/approvals;
- identify gaps;
- compute deterministic impact suggestions;
- generate outputs;
- document repeated work that should later be automated.

## 11. Pilot Definition of Done

- a real deployment is selected;
- P0 data is received;
- baseline is reconstructed;
- evidence map is useful;
- gaps are visible;
- one change-impact case is exercised;
- at least two outputs are generated from the same core;
- Humandroid reviews the result;
- we make a continue / modify / kill decision.
