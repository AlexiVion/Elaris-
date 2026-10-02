# Elaris Component Health V0 — Humandroid Pilot

## Status
**HYPOTHESIS · DEMO READY V0 · NO FIELD VALIDATION YET**

## Product thesis
Elaris Component Health helps Humandroid identify components that deserve attention, understand the evidence behind a signal, and capture the inspection/service/replacement outcome inside the exact technical history of the robot.

It is not predictive maintenance yet.

## V0 workflow
```text
Fleet Health
→ Robot Health
→ Component Detail
→ Health signal / evidence
→ Human review
→ Inspection / Service
→ Repair / replacement
→ Configuration change
→ Impact / revalidation checks
→ Named Return-to-Service
→ Outcome retained
```

## Demo scenario
Public scenario context:
- Humandroid
- HMND-0002
- Unitree G1
- TGN
- Valve operation

All component serials, health metrics, telemetry values, anomaly/deviation values, error events, maintenance events, replacements and return-to-service outcomes are synthetic demo data.

## Screens
1. Fleet Health
2. Robots
3. HMND-0002 Robot Health
4. Left knee actuator Component Detail
5. Attention queue
6. Service event SV-0014
7. Return-to-Service RTS-0007
8. Reports / outputs

## V0 intelligence
Allowed:
- deterministic thresholds/rules;
- trend/deviation presentation;
- component identity + history;
- human-facing evidence;
- presentation-only local interaction.

Not implemented or claimed:
- failure probability;
- remaining useful life;
- autonomous maintenance decisions;
- cross-fleet trained anomaly model;
- persistent telemetry ingestion;
- new Prisma schema.

## Human authority
Humandroid humans decide whether to continue operation, inspect, maintain, replace, perform required tests or return a robot to service. Elaris records the workflow and evidence.

## Validation meeting
Do not ask “Do you like it?”

Ask Humandroid to show the last real time a component degraded, failed, was inspected or replaced.

For one case identify:
- robot and component;
- exact configuration;
- first symptom;
- data available before the event;
- logs / telemetry retained;
- current monitoring tool;
- inspection and maintenance process;
- replacement history;
- decision authority;
- downtime / economic consequence;
- post-service checks;
- OEM support/RMA evidence.

## Required validation package
**1 real robot + 1 real component + 1 real event + real data/tools/process.**

## GO criteria
Continue if component/service uncertainty has meaningful cost, usable data exists, data can be tied to exact robot/configuration/time, a human decision changes because of the information, and Elaris adds continuity not already solved by Robots ID/OEM tooling.

## MODIFY / MERGE criteria
Modify if the real need is mainly service/configuration history, or if OEM tools already generate the signals and Elaris is more useful as the provenance/change layer.

## KILL criteria
Kill the standalone hypothesis if existing tools already solve component prognostics plus service/configuration linkage, Humandroid cannot access useful data, component events are too rare/cheap, only generic fleet alerting remains, or physical component identity/history cannot be reconstructed.

## Engineering boundary
No new persistent shared schema in V0. Use explicit synthetic demo data in `lib/demo/component-health.ts`. Backend expansion requires field evidence.

A shared read-only integration boundary now exists in `lib/robot-adapters/`. Robot Adapter V0 normalizes OEM-specific robot state into an Elaris telemetry contract without adding persistence or robot control. The first concrete adapter targets Unitree G1 public SDK2 state structures; live DDS/ROS2 connectivity is intentionally deferred to the Edge Collector work and an authorized university session.
