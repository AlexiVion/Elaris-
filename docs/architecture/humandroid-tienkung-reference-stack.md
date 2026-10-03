# Humandroid / TienKung Reference Stack

## Purpose

Record what Elaris learned from the public TienKung ecosystem that Humandroid reports using.

This is a **reference integration model**, not a new Elaris Product System and not an Elaris runtime dependency.

## Public stack

The public Open-X-Humanoid repositories show this high-level path:

~~~text
TienKung-Lab
  Isaac Sim / Isaac Lab
  RL + AMP training
  motion retargeting
  Sim2Sim through MuJoCo
        ↓ exported policy
Deploy_Tienkung
  ROS2 Humble
  RL controller
  robot interface / FSM
        ↓
TienKung robot
~~~

Sources:
- https://github.com/Open-X-Humanoid/TienKung-Lab
- https://github.com/Open-X-Humanoid/Deploy_Tienkung

TienKung-Lab is focused on training/simulation/transfer for TienKung locomotion. Deploy_Tienkung contains the ROS2/control-side deployment components for the physical robot.

## Useful observation for Elaris

The public deployment SDK documents robot state/control structures containing concepts such as:

~~~text
actual joint position
actual joint velocity
actual joint torque

desired joint position
desired joint velocity
desired joint torque

IMU data
control state / FSM
controller configuration
~~~

The public control flow also documents states such as STOP, ZERO and MLP.

This means component behavior can be understood with both:
- physical telemetry; and
- the execution/control context active at that time.

## Elaris relationship

Elaris should sit beside the control stack:

~~~text
training / policy
       ↓
controller
       ↓
robot
       │
       ├── physical state
       └── execution context
               ↓
       Elaris Robot Adapter
               ↓
       normalized telemetry
               ↓
       Edge Collector
               ↓
       Component Health / evidence
~~~

Elaris does not need to train or execute the policy.

## What Elaris incorporates now

1. Optional `RobotExecutionContext` in the normalized telemetry contract.
2. Explicit preservation of actual vs desired signals when the source exposes both.
3. Controller/policy/configuration provenance as a Humandroid data-discovery question.
4. TienKung as a future adapter target only after Humandroid's actual runtime/topics/messages are observed.

## What Elaris does not incorporate

- Isaac Lab;
- Isaac Sim;
- RSL-RL;
- MuJoCo training workflow;
- motion retargeting;
- policy training;
- ROS2 control publication;
- TienKung command/control code;
- a TienKung adapter before real runtime evidence exists.

## Future adapter shape

If Humandroid confirms the public stack resembles its production runtime, a future adapter may look like:

~~~text
Humandroid / TienKung ROS2
          ↓
read-only ROS2 transport
          ↓
TienKungAdapter
          ↓
same NormalizedTelemetryEvent contract
~~~

The adapter should map only observed fields/topics that Humandroid authorizes and confirms.

It must remain read-only.

## Component Health implication

For a component such as a knee actuator, the future useful evidence window may contain:

~~~text
component identity
timestamp
actual position / velocity / torque
desired position / velocity / torque
control mode
controller version
policy version
configuration
service / inspection outcome
~~~

This makes it possible to separate a physical deviation from a controller-demand context without claiming that Elaris can automatically diagnose failure.

## Validation rule

Do not infer Humandroid's exact topics, message types, deployment topology or retained history from the public TienKung repositories.

Ask Humandroid to show the real runtime and one real component/event before implementing a production TienKung adapter.
