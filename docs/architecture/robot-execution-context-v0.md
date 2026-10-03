# Robot Execution Context V0

## Status

**SHARED INTEGRATION CONTRACT · OPTIONAL · READ-ONLY**

Robot Execution Context is not a Product System and does not create a new persistence layer.

It is optional provenance attached to normalized telemetry when a robot/controller stack exposes enough information to identify what software/control context was active when the signal was observed.

## Why it exists

A physical signal can be ambiguous without knowing what the controller was asking the robot to do.

For example, an elevated joint torque may be:
- a normal response to a demanding command;
- a tracking deviation between desired and actual state;
- an operating-mode effect;
- or evidence that deserves human review.

Elaris should preserve available context before interpreting the signal.

## Contract

`RobotExecutionContext` currently supports:

~~~text
sourceStack
controlMode
controllerId
controllerVersion
policyId
policyVersion
~~~

Every field is optional.

The object may be absent entirely.

## Boundary

Execution context is descriptive only.

It does not:
- allow command publication;
- enable actuation;
- load or execute policies;
- train models;
- change robot state;
- make a safety decision.

The existing `ReadOnlyRobotTransport` contract remains unchanged.

## Actual vs desired signals

When the source runtime exposes both observed and desired values, adapters should keep them distinct:

~~~text
joint.position.actual
joint.position.desired
joint.velocity.actual
joint.velocity.desired
joint.torque.actual
joint.torque.desired
~~~

A deterministic tracking delta can later be computed as:

~~~text
tracking_delta = actual - desired
~~~

The delta is evidence for review, not a diagnosis.

Adapters must not fabricate desired values when they are not exposed by the source.

## Persistence rule

V0 does not add Prisma models or shared database fields for this context.

First validate:
1. the fields exist in real Humandroid/robot runtime data;
2. they can be tied to the same timestamp/window as telemetry;
3. they change an actual Component Health or reconstruction decision;
4. their identity/version semantics are stable enough to persist.

Until then the context belongs to capture/normalized telemetry only.

## Reference stack

Humandroid's reported use of the TienKung ecosystem motivated this addition.

See `docs/architecture/humandroid-tienkung-reference-stack.md`.

The architectural lesson is vendor-neutral: Elaris should know what was executing when a signal was observed, without becoming the training/control system itself.
