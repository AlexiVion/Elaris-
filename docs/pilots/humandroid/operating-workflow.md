# Humandroid — Operating Workflow

## 0 — Select

Choose one real deployment.

Output: selected deployment + Humandroid owner + concrete pilot objective.

## 1 — Intake

Receive artifacts in their current format.

For every artifact record:
- source;
- owner;
- received date;
- confidentiality;
- probable related object.

## 2 — Normalize

Convert raw information into canonical objects:

Robot · Configuration · Deployment · Evidence · Requirement · Approval · Change · Incident

AI may propose extraction/links later. Critical facts require human confirmation.

## 3 — Baseline

Create a reference snapshot:

> “This is how this robot is configured for this deployment.”

Never silently overwrite it. A meaningful change creates a new configuration version.

## 4 — Evidence mapping

Link:
- evidence → configuration;
- evidence → deployment;
- evidence → requirement;
- approval → requirement / deployment;
- tests → component/version/task.

Output: **Evidence Map**.

## 5 — Gap analysis

Classify:
- Ready
- Missing
- Review required
- Not applicable
- Unknown

No universal risk score.

## 6 — Change

Record:

**Before → Change → After**

Example: BrainCo Revo2 → Inspire RH56DFX.

## 7 — Change impact

Using known relationships and rules, surface:
- evidence potentially impacted;
- requirements potentially impacted;
- approvals potentially impacted;
- tests to consider re-running;
- documents to consider updating.

Nothing is automatically invalidated.

## 8 — Outputs

Generate from the same core:
- System Passport;
- Deployment Record;
- Evidence Map;
- Readiness View;
- Change Impact;
- actor-specific view.

## 9 — Humandroid review

Humandroid confirms/corrects:
- configuration;
- relationships;
- false-positive impacts;
- missing information;
- actual usefulness.

## 10 — Learn

Record:
- what was manual;
- what repeated;
- what data was missing;
- which relations were useful;
- what should be automated next.

## Automation rule

**Do not automate because it is possible. Automate when a step repeats and has demonstrated operational value.**
