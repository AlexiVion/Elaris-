# Siglo 21 Field Runbook V0

## Goal

Return from the first authorized session with:

**one encrypted Dataset #001 of normal Unitree G1 operation plus corrected robot/configuration facts.**

Do not attempt predictive maintenance during the session.

## Before touching the robot

Record with the university contact:

- date/session owner;
- exact robot label/asset identity;
- G1 / G1 EDU / other exact variant if known;
- firmware/software information available;
- hand configuration;
- university operator responsible for robot motion;
- approved network interface/access method;
- approved capture duration;
- approved data categories;
- agreed stop signal.

Do not copy passwords, SSH keys or unrelated credentials into Elaris.

## Stage 0 — Local preflight

On Linux:

~~~bash
export ELARIS_UNITREE_PYTHON="<field-kit-venv>/bin/python"
bash scripts/field-kit/preflight_live_linux.sh <iface>
~~~

Required result:

~~~text
FIELD READY: YES
FIELD KIT PREFLIGHT COMPLETE
~~~

If not green, do not proceed to live inspect.

## Stage 1 — Connect physically

Only after the university authorizes the network connection:

1. connect the laptop to the approved robot/network port;
2. confirm the operating system still sees the approved interface;
3. do not change robot network settings unless the university explicitly asks and supervises;
4. do not run packet capture or network scanning outside the agreed SDK2/DDS path.

## Stage 2 — Inspect only

Run:

~~~bash
pnpm edge inspect-unitree --interface <iface> --hz 20
~~~

Expected safety statement:

~~~text
Mode: READ ONLY
No robot command was sent.
No data was written to disk.
~~~

Record:

- whether `rt/lowstate` is readable;
- observed normalized component count;
- observed signal types;
- any missing/empty motor slots;
- whether the real DOF differs from the public 29-slot map;
- any hand/state channels the university says are present.

STOP if inspect causes unexpected robot behavior or if the bridge cannot remain subscriber-only.

## Stage 3 — Human go/no-go

Before capture, show the university contact what Elaris intends to collect:

~~~text
joint position
joint velocity
joint acceleration if reported
estimated torque
motor temperatures
motor voltage
motor state code
IMU orientation/angular velocity
system mode/tick
~~~

Confirm again:

- no camera;
- no microphone;
- no wireless remote bytes;
- no command channels;
- no cloud upload.

Only continue after explicit go-ahead.

## Stage 4 — Baseline capture

Set a strong local passphrase in the shell. Do not write it into scripts or Git.

~~~bash
export ELARIS_EDGE_PASSPHRASE='<strong-local-secret>'
~~~

Start with a short window:

~~~bash
pnpm edge capture-unitree \
  --interface <iface> \
  --robot-id <university-approved-id> \
  --purpose component-health-baseline \
  --duration 60 \
  --hz 20
~~~

Recommended first sequence, controlled entirely by the university operator:

1. idle/standing;
2. simple authorized movement;
3. repeatable movement if available.

Elaris does not command any of those movements.

## Stage 5 — Stop and verify

After capture:

- disconnect/stop according to university procedure;
- verify the session is FINALIZED;
- verify classification is SENSITIVE;
- verify export approval is NOT_APPROVED;
- record frame/event counts;
- do not upload anything.

Review locally:

~~~bash
pnpm edge review captures/<CAP-ID> --sample 5
~~~

## Stage 6 — University review / export decision

Export approval is a separate act.

Do not run `approve-export` automatically.

If the agreed process requires university review first, keep the dataset encrypted and NOT_APPROVED until that review is complete.

Only after authorization:

~~~bash
pnpm edge approve-export captures/<CAP-ID> \
  --reviewer '<authorized-reviewer>' \
  --reason '<approved research purpose>'
~~~

This command still does not upload anything.

## Immediate stop conditions

Stop if:

- university contact says stop;
- unexpected robot motion occurs;
- command/control behavior appears;
- wrong robot or interface is connected;
- unexpected image/audio/personal data appears;
- capture scope is exceeded;
- disk/encryption/session finalization fails;
- physical robot state differs materially from assumptions and the university wants re-review.

## Session success criteria

Success is **not** 'AI predicts a failure'.

Success is:

- exact robot facts improved;
- read-only path confirmed;
- no control command emitted;
- one bounded encrypted baseline captured;
- provenance preserved from OEM field to Elaris signal;
- dataset remains under explicit human export control;
- clear list of missing data for Component Health V1.
