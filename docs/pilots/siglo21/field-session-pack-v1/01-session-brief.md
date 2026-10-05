# 01 — Session Brief

## Session identity

- **Project:** Elaris
- **Elaris representatives:** Alexi Vion / Juan Martín Rossi
- **Institution:** Universidad Siglo 21
- **Robot:** Unitree G1 family — exact variant to confirm on site
- **Session date:** __________________
- **Session location:** __________________
- **University contact:** __________________
- **University robot operator:** __________________
- **Elaris Technical Operator:** __________________
- **Elaris Session Recorder:** __________________

## Why Elaris is requesting access

Elaris is developing infrastructure and Product Systems for physical-AI / robotics operations.

The immediate research objective is to understand whether real robot state data can support a Component Health workflow that links:

~~~text
robot
→ exact configuration
→ component
→ observed signal
→ human inspection/service
→ configuration change
→ revalidation
→ outcome
~~~

Today the product demonstration uses synthetic telemetry. The next necessary step is a small, controlled real-data acquisition session.

## Objective of this session

1. Confirm the exact Unitree G1 variant/configuration available at Siglo 21.
2. Confirm the authorized read-only SDK2/DDS state path.
3. Verify whether `rt/lowstate` can be read by the Elaris subscriber-only bridge.
4. Observe which state signals are actually populated.
5. If separately approved after inspection, capture one short encrypted normal-operation baseline.
6. Record what evidence is still missing for Component Health validation.

## Explicit non-objectives

This session is not intended to:
- control the robot;
- send commands;
- change firmware or configuration;
- train a model on site;
- predict failures;
- estimate Remaining Useful Life;
- perform safety certification;
- inspect unrelated university network traffic;
- capture cameras or microphones;
- upload robot data automatically.

## Technical safety boundary

~~~text
Robot
  ↓ state only
Unitree SDK2 subscriber
  ↓
Elaris Robot Adapter
  ↓
Edge Collector
  ↓
local encrypted capture
~~~

There is no command publisher in the Elaris V0 bridge.

## Intended first capture

If the inspect stage is successful and the university explicitly authorizes proceeding:

- nominal duration: **60 seconds**;
- nominal sampling cap: **20 Hz**;
- normal operation only;
- movement, if any, controlled exclusively by the university operator;
- local encrypted storage;
- classification: **SENSITIVE**;
- export state after capture: **NOT_APPROVED**.

## Success

Success means obtaining trustworthy facts and a bounded evidence sample.

Success does **not** require demonstrating predictive maintenance.
