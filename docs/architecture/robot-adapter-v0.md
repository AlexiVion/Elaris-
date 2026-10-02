# Elaris Robot Adapter V0

## Status

**SHARED INFRASTRUCTURE V0 · READ-ONLY · UNITREE G1 FIRST ADAPTER**

Robot Adapter is not a new Elaris Product System.

It is shared integration infrastructure that lets Product Systems such as Component Health receive normalized robot data without coupling Elaris to one OEM protocol.

## Purpose

Elaris needs a stable boundary between robot/OEM infrastructure and the Elaris domain.

The contract is:

~~~text
OEM robot / simulator / replay
          ↓
ReadOnlyRobotTransport
          ↓
RobotAdapter
          ↓
normalized telemetry
          ↓
Elaris ingestion / Component Health
~~~

V0 deliberately stops before live ingestion/storage.

It establishes:
- the universal adapter contract;
- a read-only transport boundary;
- normalized telemetry events;
- stable component identities;
- a safe replay transport;
- the first OEM implementation: Unitree G1.

## Safety contract

The core TypeScript transport interface has **no publish/send/control method**.

~~~text
READ
  state / telemetry     allowed

WRITE
  commands              not represented in the interface
  actuation             disabled
  remote control        disabled
~~~

The default security profile is:

- mode: READ_ONLY;
- control commands: DISABLED;
- actuation: DISABLED;
- remote control: DISABLED;
- cloud upload: DISABLED BY DEFAULT;
- raw audio/video: DISABLED BY DEFAULT;
- captured telemetry: SENSITIVE BY DEFAULT.

Known command/control-looking channels are rejected by policy.

This is defense in depth, not a claim that an OEM network is intrinsically safe.

## Universal adapter contract

Each OEM/model adapter implements:

~~~text
supports(robot)
allowedChannels()
blockedChannels()
components()
signals()
discover(readOnlyTransport, robot)
normalize(channel, rawPayload, context)
~~~

The normalized event shape is OEM-independent:

~~~json
{
  "timestamp": "...",
  "captureSessionId": "...",
  "robotId": "...",
  "configurationId": "...",
  "componentId": "...",
  "signal": "joint.velocity",
  "value": 1.25,
  "unit": "rad/s",
  "sensitivity": "SENSITIVE",
  "source": {
    "adapterId": "unitree-g1",
    "transportKind": "dds",
    "channel": "rt/lowstate",
    "rawField": "motor_state[3].dq"
  }
}
~~~

Component Health should reason over this normalized vocabulary rather than over OEM-specific message names.

## Unitree G1 V0

The first concrete adapter is UnitreeG1Adapter.

Public Unitree SDK2 material supports the following implementation assumptions:

- G1 low-state data is exposed on rt/lowstate.
- G1 command data uses rt/lowcmd; Elaris explicitly blocks it.
- Unitree also exposes rt/arm_sdk; Elaris explicitly blocks it.
- public G1 SDK examples define 29 motor indexes for the common G1 control layout;
- low-state motor data includes position, velocity, acceleration, estimated torque, temperature slots, voltage and motor-state code;
- low-state also contains IMU and system/mode fields;
- optional read-only hand state topics include Inspire and Dex3 state channels.

Public references:

- https://github.com/unitreerobotics/unitree_sdk2/blob/main/include/unitree/dds_wrapper/robots/g1/g1_sub.h
- https://github.com/unitreerobotics/unitree_sdk2/blob/main/include/unitree/dds_wrapper/robots/g1/g1_pub.h
- https://github.com/unitreerobotics/unitree_sdk2/blob/main/include/unitree/idl/hg/LowState_.hpp
- https://github.com/unitreerobotics/unitree_sdk2/blob/main/include/unitree/idl/hg/MotorState_.hpp
- https://github.com/unitreerobotics/unitree_sdk2_python/blob/master/example/g1/low_level/g1_low_level_example.py

## Important G1 limitation

Public examples show multiple G1 DOF/configuration possibilities.

The V0 catalog therefore marks waist roll/pitch and some wrist joints as VARIANT_DEPENDENT.

The adapter must **not** infer the university robot's exact variant from public documentation.

The physical discovery session must confirm:
- exact G1 / G1 EDU variant;
- active joints / DOF;
- hand configuration;
- firmware/software;
- readable channels;
- actual component/serial identity where available.

## Replay-first development

ReplayTransport exists so Elaris can test adapter behavior without a physical robot.

It can:
- expose a set of readable channels;
- replay captured/raw frames;
- emit frames to adapter subscribers.

It cannot publish commands.

This is the preferred development path until an authorized Siglo 21 session is available.

## What V0 does not do

V0 does not:
- connect to DDS on the network;
- connect to ROS2;
- store telemetry;
- upload telemetry to cloud;
- collect camera or microphone data;
- control a robot;
- infer failure probability;
- estimate Remaining Useful Life;
- declare a component safe/failed;
- create persistent Component Health schema.

## Next step

Build **Elaris Edge Collector V0** around this contract.

The collector should:

~~~text
authorized robot network
        ↓
OEM read-only transport
        ↓
Robot Adapter
        ↓
local normalized capture
        ↓
encrypted local dataset
        ↓
human review / sanitize
        ↓
explicit export approval
~~~

Before going on-site, the Unitree transport implementation should be prepared against SDK2 public interfaces, but live access remains disabled until the university authorizes the exact network/session.
