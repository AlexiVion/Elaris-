# 15 — Component Health Validation Record

## Purpose

Use the real session to decide what Component Health should become.

The question is not "did telemetry arrive?"

The question is:

> Can Elaris connect trustworthy component evidence to a real maintenance/service decision better than the existing tools/process?

## Validation unit

Target:

**1 real robot + 1 real component + 1 real event + real data/tools/process around that event.**

The Siglo 21 baseline session may satisfy only the real-robot/data part. A real degradation/service event may still require Humandroid or another operational partner.

## A. Identity / provenance

- exact robot identity reconstructable: YES / NO / PARTIAL
- exact configuration reconstructable: YES / NO / PARTIAL
- component identity reconstructable: YES / NO / PARTIAL
- timestamp provenance credible: YES / NO
- source channel/field provenance preserved: YES / NO

## B. Useful state data

Observed availability:

- joint position: YES / NO
- joint velocity: YES / NO
- joint acceleration: YES / NO
- estimated torque: YES / NO
- temperature: YES / NO
- voltage: YES / NO
- motor state/status: YES / NO
- IMU: YES / NO
- runtime/control mode: YES / NO
- desired position/velocity/torque: YES / NO
- controller version: YES / NO
- policy/model version: YES / NO

## C. Component-level usefulness

Select one component candidate:

- component: __________________
- stable component mapping possible: YES / NO
- relevant signals available: __________________
- signals meaningful across repeated operation: UNKNOWN / YES / NO
- service/inspection history available: UNKNOWN / YES / NO
- replacement outcome available: UNKNOWN / YES / NO

## D. Existing workflow

Ask a real operator/integrator:

- How do you currently notice component problems?
- Which tool shows the first symptom?
- What gets stored?
- Who inspects?
- Who decides continue vs service vs replace?
- Can a signal be tied to exact component/configuration?
- What happens after service?
- How is return-to-service decided?
- What information is repeatedly hard to reconstruct?

Record answers/evidence:

____________________________________________________________

## E. Decision value

Would Elaris change a real decision?

- earlier inspection: YES / NO / UNKNOWN
- better evidence before replacement: YES / NO / UNKNOWN
- configuration-aware diagnosis/review: YES / NO / UNKNOWN
- easier service history reconstruction: YES / NO / UNKNOWN
- better return-to-service evidence: YES / NO / UNKNOWN

## F. Product gate

### GO
Continue Component Health as a Product System if:
- component/service uncertainty has meaningful cost;
- usable data exists;
- evidence can be tied to robot/configuration/time;
- a human decision can improve;
- Elaris adds continuity not already solved by OEM tooling.

### MODIFY / MERGE
Modify or merge the hypothesis if the real value is mostly:
- service/configuration history;
- provenance;
- evidence continuity;
- integration of OEM signals rather than proprietary anomaly detection.

### KILL
Kill the standalone hypothesis if:
- existing tooling already solves the end-to-end job;
- data access is not viable;
- component events are too rare/cheap;
- Elaris adds only generic dashboarding;
- physical identity/history cannot be reconstructed.

## Current decision

- [ ] GO
- [ ] MODIFY
- [ ] MERGE
- [ ] KILL
- [ ] INSUFFICIENT EVIDENCE

Reason:

____________________________________________________________

Decision owners: Alexi Vion / Juan Martín Rossi
Date: __________________
