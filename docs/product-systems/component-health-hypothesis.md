# Product System Hypothesis — Component Health

## Status

**NEW HYPOTHESIS · NO DEMO · NO VALIDATION**

This idea comes from the current founder discussion: Elaris could potentially help an integrator/operator detect component degradation or predict failures.

It is **not** currently a validated Elaris product.

Do not build predictive-maintenance infrastructure until the required real data and workflow are understood.

## Primary actor

Initial hypothesis:

- Robotics Integrator / Deployer
- Operator
- Maintenance / Field Service

The primary buyer/user is not yet known.

## Problem / decision

Candidate problem:

> **Which robot components show credible degradation/failure signals, and what inspection, maintenance or replacement action should happen next?**

This wording must be validated.

## Trigger

Possible triggers:
- telemetry drift;
- threshold breach;
- unusual event;
- accumulated cycles/hours;
- repeated service observation;
- component replacement;
- scheduled inspection.

Actual trigger model is unknown.

## Inputs

### Potential shared Elaris inputs

- Robot identity
- exact configuration
- component/version identity
- deployment/task/site context
- configuration changes
- incident history
- service/change evidence where available

### Major external inputs likely required

Potentially:
- sensor/telemetry streams;
- actuator/motor/current/temperature/vibration data;
- error/event logs;
- duty cycles;
- runtime/cycle count;
- maintenance/repair records;
- component replacements;
- failure labels/outcomes.

**We do not yet know what Humandroid captures or retains.**

Without sufficient longitudinal data, predictive failure modeling may be impossible or misleading.

## Candidate system process

This is a hypothesis only:

```text
Robot/component identity
        ↓
usage + telemetry + service history
        ↓
normalize against exact configuration/context
        ↓
detect anomaly / degradation pattern
        ↓
estimate signal + uncertainty
        ↓
human maintenance review
        ↓
inspect / test / continue / replace
        ↓
record real outcome
        ↓
improve future model
```

## AI / model role

Possible model families depend entirely on available data:

- anomaly detection;
- time-series forecasting;
- survival / remaining-useful-life estimation;
- failure classification;
- multimodal maintenance analysis.

Do **not** decide model architecture before seeing real data.

An LLM by itself is not a credible predictive-maintenance model.

LLMs may still help with:
- service-note extraction;
- log summarization;
- retrieving historical cases;
- explaining model signals to a technician.

## Deterministic logic

Likely deterministic pieces:
- component identity/version;
- configuration timeline;
- runtime/cycle aggregation;
- maintenance event history;
- threshold rules;
- provenance of telemetry/model input.

## Human authority

A model signal should not automatically declare a component failed or safe.

The operational action belongs to the qualified integrator/operator/maintenance person.

## Candidate outputs

Potentially:
- Component Health View
- Inspection Required alert
- degradation/anomaly signal
- maintenance recommendation
- component history
- replacement record
- model evidence/provenance record

Which outputs matter is not known.

## Why this could fit Elaris

Elaris already cares about:
- exact component/configuration identity;
- what changed;
- deployment context;
- incidents;
- historical reconstruction.

Component Health could add an operational/outcome layer that later becomes useful to:
- Deployment Control;
- Service History;
- Operational Readiness;
- Underwriting;
- Incident Reconstruction;
- future Risk Intelligence.

That cross-product value is only a thesis today.

## Why this might *not* be an Elaris product

Potential reasons:
- robot OEM already solves it better;
- telemetry ownership/access is unavailable;
- failures are too rare for useful modeling;
- heterogeneous robots/components prevent transferable models;
- integrators do not own maintenance;
- the real need is fleet observability, which Elaris explicitly does not aim to replace;
- it is a feature/integration inside Service & Configuration History rather than a standalone product.

## Humandroid discovery plan

Do not pitch “AI failure prediction” first.

Ask:

1. **Mostrame la última vez que un componente empezó a fallar o tuvo que ser reemplazado.**
2. How did you first know something was wrong?
3. What data existed before the failure?
4. Which logs/telemetry are stored?
5. For how long?
6. Can data be tied to exact robot/component/version?
7. How many comparable events exist?
8. What does the technician inspect?
9. Who decides replace vs continue?
10. What is the economic consequence of unexpected failure?
11. What tools already monitor this?
12. Would an early warning change an actual decision?

Request, if they can share safely:
- telemetry/log sample;
- maintenance/service record;
- component replacement history;
- incident/failure chronology;
- list of data available by robot/component.

## Validation gates

### Gate 1 — Problem exists

Repeated real failures/maintenance uncertainty create meaningful cost.

### Gate 2 — Data exists

Enough historical input and outcome data exists to test a useful signal.

### Gate 3 — Identity/provenance exists

Inputs can be linked to exact robot/component/configuration/context.

### Gate 4 — Decision exists

A real person can take a different action because of the signal.

### Gate 5 — Elaris fit

The workflow benefits from Elaris shared technical truth rather than merely duplicating an OEM/fleet-monitoring product.

Only after these gates should we create a demo/model experiment.

## Next action

Run the Humandroid discovery conversation and request one real component-failure/maintenance case plus the data that existed before it.
