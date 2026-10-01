# Humandroid — 7-Minute Demo Script

## Goal

In seven minutes, Humandroid should understand:

1. what information enters Elaris;
2. how Elaris structures a deployment;
3. what happens when configuration changes;
4. how human review remains authoritative;
5. how the same core creates reusable outputs.

## 0:00–0:30 — Context

Open `/deployments/DEP-0017`.

Say:

> We start from one deployed system. Elaris keeps the operational truth of what robot is deployed, under which configuration, for what task and environment, and with which evidence and approvals.

Do not explain the entire company vision.

## 0:30–2:00 — Deployment truth

Show:
- G1 #017;
- active baseline B-0017-01;
- active configuration C004;
- task;
- environment;
- operating mode;
- human exposure;
- readiness;
- evidence coverage;
- pending change CHG-0005.

Key line:

> This is the reference state we can reconstruct later instead of relying on folders, memory and screenshots.

## 2:00–3:00 — Evidence & Requirements

Open:
- `/evidence?deployment=DEP-0017`
- `/requirements?deployment=DEP-0017`

Show:
- source;
- owner;
- scope;
- criticality;
- status.

Say:

> We know which deployment and configuration area an item belongs to. We do not yet claim formal evidence-to-requirement traceability until we validate that relationship with your real workflow.

## 3:00–5:00 — Change Impact

Open `/changes/CHG-0005`.

Show:
- BrainCo Revo2 → Inspire RH56DFX;
- Humandroid Control v2.3 → v2.4;
- before / after;
- 3 affected evidence items;
- 3 affected requirements;
- 2 affected approvals;
- recommended actions.

Key line:

> A change does not automatically invalidate anything. Elaris identifies what deserves review and why.

Then show the approval boundary:

> Safety cannot re-approve on behalf of Customer Engineering. Each named approval remains an independent human decision.

## 5:00–6:00 — Human review

Show:
- impact item states;
- re-run;
- review;
- re-approval;
- final change approval gate.

Say:

> The engine is deterministic. Humans remain authoritative.

## 6:00–6:40 — Outputs

Open `/reports`.

Show:
- System Passport;
- Deployment Readiness Pack;
- Change Impact Report;
- Share View.

Say:

> These are different outputs generated from the same deployment truth, not separate dossiers rebuilt manually.

## 6:40–7:00 — Close

Ask:

> Where does this match your current workflow, and where does it fail?

Then ask for the concrete pilot:

> Let us choose one real deployment, one owner, and the first artifacts so we can replace the demo data with your real case.

## Desired meeting outcome

Leave with:
- selected real deployment;
- Humandroid owner;
- P0 artifact list approved;
- first files/access;
- review date;
- one real requirement/evidence chain to validate;
- one representative configuration change.
