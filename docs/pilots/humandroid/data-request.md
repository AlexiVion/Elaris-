# Humandroid — Data Request

## Principle

Ask only for what is needed to reconstruct one real deployment. We do **not** need all source code or all telemetry to start.

## P0 — Required to start

### Robot
- manufacturer and model;
- serial/alias if shareable;
- major components;
- hands/end-effectors;
- relevant compute.

### Configuration
- installed hardware;
- relevant firmware;
- OS / SDK if relevant;
- control software;
- model / skill / autonomy stack;
- versions Humandroid considers operationally important.

### Deployment
- customer or anonymized customer;
- site/type of site;
- task;
- environment;
- operating mode;
- human exposure;
- known operating limits.

### Evidence
Examples of real artifacts:
- integration tests;
- checklists;
- manuals;
- test reports;
- safety-related documents;
- customer questionnaires;
- acceptance documents;
- available certification/conformity material.

### Requirements
- customer requirements;
- safety/EHS requirements;
- IT/cyber requirements;
- Humandroid internal deployment conditions.

### Change
One concrete example:
- BrainCo ↔ Inspire;
- firmware update;
- software/skill update;
- task change;
- environment change.

We need: **before + after + what Humandroid did next.**

## P1 — Very useful

- approvals/sign-offs;
- owner by step;
- maintenance records;
- known failures / near misses;
- incident records;
- configuration history;
- documents previously sent to clients;
- broker/insurance requests, if they happened.

## P2 — Only if useful

- logs;
- ROS bags;
- telemetry snapshots;
- photos/video;
- network diagrams;
- repository metadata;
- fleet/API exports.

## Accepted formats

PDF, Excel/CSV, Word, screenshots, folders, exports, links, JSON, notes, or an explanation paired with an artifact.

## Do not request initially

- all source code;
- credentials / API keys;
- continuous full telemetry;
- unnecessary personal data;
- customer-confidential information Humandroid cannot share.

## Workflow questions

For each important fact/artifact:

1. Where does it live today?
2. Who creates it?
3. Who updates it?
4. Who asks for it?
5. How long does it take to find/prepare?
6. What happens if it is missing?
7. Is it requested again elsewhere?
8. What must be revisited when something changes?

## Data-request Definition of Done

We can reconstruct:

**Robot + Configuration + Deployment + Evidence + Requirement + Change**

without inventing critical facts.
