# Siglo 21 — Elaris Edge Capture Protocol V0

## Purpose

Technical protocol for an initial Component Health data-acquisition session on the university's Unitree G1.

This is intended to support the institutional collaboration / convenio process.

## Session objective

The first session is not a failure-prediction experiment.

Its objective is to:

1. confirm the exact robot variant/configuration;
2. confirm the authorized read-only interface;
3. inspect available state data;
4. capture a small normal-operation baseline dataset;
5. leave the university with no autonomous Elaris control path and no automatic cloud transfer.

## Required authorization

Before connecting:

- university owner/contact authorizes the session;
- exact robot is identified;
- approved network interface/access method is provided;
- approved data categories are agreed;
- capture duration is agreed;
- responsible Elaris operator is named;
- university contact can stop the session at any time.

No credentials should be copied into Elaris source code or committed to GitHub.

## V0 technical boundary

~~~text
Robot
  ↓
authorized network
  ↓
subscriber-only Unitree SDK2 bridge
  ↓
Elaris Robot Adapter
  ↓
encrypted local capture
~~~

No command publisher is used.

V0 does not:

- disable or modify the robot's motion system;
- publish to rt/lowcmd;
- publish to rt/arm_sdk;
- operate locomotion;
- move arms/hands;
- collect camera video;
- collect microphone audio;
- inspect unrelated network traffic;
- upload capture data to cloud during the session.

## Suggested first session

### Stage A — Inspect

Duration: approximately 5–10 minutes.

Confirm:

- G1 / G1 EDU variant;
- software/firmware information available to the university;
- active joint configuration;
- hand configuration;
- rt/lowstate availability;
- signals that actually contain meaningful values.

No capture dataset is required in this stage.

### Stage B — Baseline capture

Suggested controlled phases:

- idle / standing;
- simple authorized movement already operated by the university;
- repeatable movement sequence if the university chooses to perform one.

Elaris does not command the movement.

Recommended initial sampling: 20 Hz.

Recommended first capture windows: short, clearly bounded sessions rather than continuous logging.

## Data classification

All captured robot state is treated as **SENSITIVE** until reviewed.

Capture is local and encrypted.

Export is NOT APPROVED by default.

## Post-session workflow

~~~text
capture stops
   ↓
dataset finalized
   ↓
checksums generated
   ↓
local human review
   ↓
sanitize if needed
   ↓
university / authorized review as agreed
   ↓
explicit export approval
   ↓
only then may approved data enter Elaris analysis
~~~

## Stop conditions

Stop immediately if:

- university contact requests it;
- unexpected command/control behavior appears;
- the collector cannot maintain read-only operation;
- the wrong robot/network is connected;
- unexpected personal/audio/video data appears;
- capture exceeds the agreed scope;
- SDK/robot behavior is materially different from the documented assumption.

## First useful output

A successful first session should produce:

- exact robot/configuration observations;
- readable state channels;
- component mapping corrections;
- one encrypted normal-operation dataset;
- a list of missing signals needed for Component Health;
- no robot-control change.

The result is evidence for the next Component Health iteration, not proof that predictive maintenance is feasible.