# Elaris Edge Collector V0

## Status

**LOCAL DATA ACQUISITION V0 · READ-ONLY · ENCRYPTED · NO CLOUD UPLOAD**

Edge Collector V0 is the field tool that sits on top of Elaris Robot Adapter.

Its purpose is to let Elaris connect to an authorized robot network, inspect a supported robot, collect only approved state data, normalize it through a Robot Adapter, and save the result locally as an encrypted capture session.

It is shared infrastructure for Component Health. It is not a new Product System.

## Architecture

~~~text
authorized robot network
        ↓
read-only OEM transport
        ↓
Elaris Robot Adapter
        ↓
raw minimized frame + normalized telemetry
        ↓
local encryption
        ↓
capture session
        ↓
human review
        ↓
explicit export approval
~~~

There is no cloud upload path in V0.

## Security defaults

Every capture starts with:

- READ ONLY;
- control commands disabled;
- actuation disabled;
- remote control disabled;
- cloud upload disabled;
- camera/audio disabled;
- telemetry classified SENSITIVE;
- local encrypted storage;
- export NOT APPROVED.

The Unitree bridge imports only ChannelSubscriber and never imports ChannelPublisher.

Known command channels such as rt/lowcmd and rt/arm_sdk remain outside the Elaris read-only contract.

## Data minimization

For Unitree G1 V0, the live bridge exports only a minimized subset of rt/lowstate:

- mode_pr;
- mode_machine;
- tick;
- IMU RPY;
- IMU gyroscope;
- motor q;
- motor dq;
- motor ddq;
- estimated torque;
- motor temperature slots;
- motor voltage;
- motor-state code.

It deliberately excludes:

- wireless remote bytes;
- audio;
- video;
- camera frames;
- microphones;
- command messages;
- unrelated network traffic.

The bridge also rate-limits exported frames. Default is 20 Hz; the V0 hard cap is 100 Hz.

## Capture format

Each session is stored under:

~~~text
captures/
└── CAP-YYYYMMDD-XXXXXX/
    ├── session.public.json
    ├── manifest.enc.json
    ├── raw.ndjson.enc
    ├── telemetry.ndjson.enc
    ├── checksums.sha256
    └── export-approval.enc.json   # only after explicit approval
~~~

The public session file contains only operational capture metadata such as state, counts, classification and encryption salt.

Sensitive robot identity, purpose, channel details, raw frames, normalized telemetry, optional execution context and reviewer approval are encrypted.

Execution context is captured only when the source stack exposes it or an adapter can establish it with provenance. The collector does not fabricate controller, policy or mode metadata.

Encryption:

- AES-256-GCM;
- scrypt-derived session key;
- random per-record IV;
- session salt stored in session.public.json;
- passphrase supplied through ELARIS_EDGE_PASSPHRASE, never CLI arguments.

Captured data is not useful without the passphrase.

## Replay-first workflow

Before touching a physical robot:

~~~powershell
$env:ELARIS_EDGE_PASSPHRASE="use-a-long-local-secret"

pnpm edge capture-replay `
  --fixture apps/edge-collector/fixtures/unitree-g1-synthetic.json `
  --robot-id US21-G1-01 `
  --purpose component-health-baseline
~~~

Then:

~~~powershell
pnpm edge review captures/CAP-... --sample 5
~~~

The capture remains EXPORT APPROVAL: NOT_APPROVED until a human explicitly runs the local approve-export command.

Approval only changes the local record. It does not upload or transmit data.

## Unitree G1 live inspect

Prerequisites:

- authorized access to the robot network;
- official unitree_sdk2_python environment;
- known network interface;
- Python available through ELARIS_UNITREE_PYTHON or python3.

Command:

~~~powershell
pnpm edge inspect-unitree --interface <network-interface> --hz 20
~~~

Inspect mode subscribes only to rt/lowstate, waits for one frame, prints normalized signal names and component count, sends no commands, and writes no robot data to disk.

## Unitree G1 live capture

After inspect succeeds and capture is explicitly authorized:

~~~powershell
$env:ELARIS_EDGE_PASSPHRASE="use-a-long-local-secret"

pnpm edge capture-unitree `
  --interface <network-interface> `
  --robot-id US21-G1-01 `
  --purpose component-health-baseline `
  --duration 60 `
  --hz 20
~~~

Optional flags: --configuration <configuration-id> and --root <capture-root>.

V0 limits a single capture command to 3600 seconds.

## Unitree SDK2 basis

The read-only bridge follows the official public SDK2 Python subscriber pattern:

- ChannelFactoryInitialize(0, networkInterface)
- ChannelSubscriber("rt/lowstate", LowState_)
- subscriber.Init(handler, queueLength)

Official sources:

- https://github.com/unitreerobotics/unitree_sdk2_python/blob/master/example/g1/low_level/g1_low_level_example.py
- https://github.com/unitreerobotics/unitree_sdk2_python/blob/master/unitree_sdk2py/core/channel.py
- https://github.com/unitreerobotics/unitree_sdk2/blob/main/include/unitree/idl/hg/LowState_.hpp
- https://github.com/unitreerobotics/unitree_sdk2/blob/main/include/unitree/idl/hg/MotorState_.hpp

## Current limitation

The exact Universidad Siglo 21 G1 variant, hand configuration, firmware and active DOF are not yet confirmed.

Edge Collector therefore does not claim those facts.

The first authorized inspect session exists specifically to replace those assumptions with observed technical facts.

## What comes after V0

Once Dataset #001 exists:

~~~text
encrypted local capture
        ↓
review + approved export
        ↓
Elaris ingestion
        ↓
real Component Health baseline
        ↓
deviation analysis
        ↓
later anomaly models
~~~

Failure prediction and Remaining Useful Life remain out of scope until longitudinal data and real outcomes support them.

## Field readiness

A dedicated **Siglo 21 Field Kit V0** now wraps the collector with:

- Windows replay/development preflight;
- Linux live-SDK setup;
- no-robot Unitree doctor;
- Linux live preflight;
- on-site field runbook;
- explicit stop conditions and data-approval sequence.

The selected live path targets Linux because Unitree's public SDK2 documentation publishes an Ubuntu/Linux development setup. Windows remains valid for replay, development, encrypted capture review and synthetic validation, but Elaris does not claim native-Windows DDS field readiness.

See:

- `docs/pilots/siglo21/field-kit-v0.md`
- `docs/pilots/siglo21/field-runbook-v0.md`
