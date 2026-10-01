# Humandroid — Demo & Delivery Plan

## Goal of the next demo

Humandroid should understand in under 10 minutes:

1. what it receives;
2. what information enters Elaris;
3. what Elaris does with that information;
4. what operational result comes out.

## Demo dataset

Until real data arrives, use the existing clearly-labeled demo scenario:

- Unitree G1;
- BrainCo Revo2 initial configuration;
- Humandroid Control stack;
- task and environment;
- tests/evidence;
- requirements/approvals;
- change BrainCo Revo2 → Inspire RH56DFX.

The current repo already contains this golden scenario around **DEP-0017 / CHG-0005**.

## Exact demo routes

### 1. Deployment Overview
Open:

`/deployments/DEP-0017`

Show:
- robot;
- active configuration snapshot;
- task;
- environment;
- readiness;
- evidence coverage;
- requirements and approvals;
- recent changes;
- history/baselines.

Message:
> “This is the operational truth of the deployment.”

### 2. Evidence / Requirements
Open:

`/evidence?deployment=DEP-0017`

and

`/requirements?deployment=DEP-0017`

Show evidence and requirements with:
- scope;
- source;
- owner;
- criticality;
- status;
- reference URI/hash.

Message:
> “We do not only store documents; we know what they apply to.”

### 3. Change Impact
Open:

`/changes/CHG-0005`

Show:
- BrainCo Revo2 → Inspire RH56DFX;
- before / after;
- affected evidence;
- affected requirements;
- affected approvals;
- recommended actions;
- human review state.

Message:
> “When the system changes, Elaris tells you what deserves review.”

### 4. Reports / actor output
Open:

`/reports`

Use:
- System Passport;
- Deployment Readiness Pack;
- Change Impact Report;
- Share View.

Message:
> “The same core produces different outputs without rebuilding the dossier.”

## 7-minute demo script

1. **30 sec — Context.** “We start from one real deployment.”
2. **90 sec — Deployment Overview.** Show configuration, task, environment and baseline.
3. **60 sec — Evidence / Requirements.** Show that evidence is scoped, owned and linked.
4. **2 min — Change Impact.** BrainCo → Inspire; explain deterministic impact.
5. **60 sec — Human review.** Show that Elaris does not certify or approve automatically.
6. **60 sec — Reports / Share.** Show reuse of the same underlying record.
7. **60 sec — Ask Humandroid.** “Where does this match your real workflow, and where does it fail?”

## What already works in the repo

The existing MVP already implements:

- robot profiles;
- configuration snapshots;
- deployment baselines;
- evidence / requirements;
- approvals;
- before/after change diff;
- deterministic impact engine;
- readiness / evidence coverage;
- incident linking to active baseline;
- reports;
- share links;
- audit history;
- global search.

The core engine should **not** be rewritten for the pilot.

## Engineering delta before real Humandroid data

### P0 — No code required yet
These can stay manual during the first pilot:

- collecting documents;
- extracting information from files;
- choosing the first real deployment;
- mapping raw artifacts to Elaris objects;
- deciding which evidence really applies;
- loading the initial real dataset.

### P1 — Validate before building
Only implement if Humandroid confirms the need:

1. **Real deployment onboarding UI**
   - today the demo is seeded; there is no self-service “Create robot / deployment / baseline” flow.
   - first pilot can still be operated by Elaris manually.

2. **Provenance extensions**
   - current schema already has source, owner, URI, SHA-256 and timestamps.
   - validate whether we need source-system ID, external ID, confirmation state or validity windows.

3. **Requirement model**
   - today requirements are EvidenceItems with `category = REQUIREMENT`.
   - split into a dedicated model only if real workflow requires it.

4. **Operating mode vocabulary**
   - current values are SUPERVISED / AUTONOMOUS_ZONED / TELEOPERATED.
   - add MIXED only if Humandroid actually uses a mixed mode we cannot represent cleanly.

5. **Actor-specific UI**
   - reports/share already cover much of the need.
   - build dedicated Customer / Safety interfaces only after seeing who actually consumes them.

6. **Integrations**
   - Git / Drive / ROS / fleet integrations remain out until repeated manual work identifies the first valuable connector.

## What can remain manual in the pilot

- initial document extraction;
- mapping raw artifacts to Elaris objects;
- deciding which evidence is actually relevant;
- initial seed/onboarding;
- some report preparation.

## Next meeting objective

Do not run another broad conceptual presentation.

Get a concrete decision:

> **“We choose this deployment and these first artifacts to build the pilot together.”**

## Ideal close

Leave with:
- selected deployment;
- Humandroid owner;
- P0 data list approved;
- first artifacts available;
- review date;
- first deliverable chosen.

## Build rule

A new feature enters the Humandroid MVP only if we can answer:

1. Which real Humandroid workflow step does it serve?
2. Which input triggers it?
3. Which decision/output does it improve?
4. What pilot evidence justifies building it?
5. Can we keep it manual for the first iteration?
