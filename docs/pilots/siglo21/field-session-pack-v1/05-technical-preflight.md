# 05 — Technical Preflight Record

Run this on the Linux field host before `inspect-unitree`.

## Important meaning

A passing preflight means the **host prerequisites** are ready.

It does not prove:
- a real G1 is discoverable;
- Unitree DDS works on the actual robot network;
- `rt/lowstate` is available;
- telemetry is valid.

Those facts are established only during inspect.

## Host identity

- VM/host: __________________
- Linux version: __________________
- Node version: __________________
- pnpm version: __________________
- Python version: __________________
- `ELARIS_UNITREE_PYTHON`: __________________
- robot-facing interface: __________________
- interface physical adapter on Windows/host: __________________

## Before running

~~~bash
cd ~/elaris-field
git status
source .field-kit/env.sh
ip -brief link
ip -brief addr
~~~

Record:

- expected branch/commit: __________________
- working tree acceptable: YES / NO
- intended interface exists: YES / NO

## Elaris preflight

~~~bash
bash scripts/field-kit/preflight_live_linux.sh <iface>
~~~

Expected required evidence includes:

~~~text
PASS: interface link active
PASS: interface multicast capability
Robot connection: NOT ATTEMPTED
Mode: READ ONLY
SOFTWARE READY: YES
NETWORK LINK READY: YES
LIVE ROBOT HOST READY: YES
FIELD KIT PREFLIGHT COMPLETE
No robot connection or command was attempted.
~~~

## Record actual result

- interface exists: PASS / FAIL
- link active: PASS / FAIL
- multicast capable: PASS / FAIL
- Unitree SDK2 Python: PASS / FAIL
- CycloneDDS: PASS / FAIL
- subscriber-only bridge check: PASS / FAIL
- synthetic replay: PASS / FAIL
- SOFTWARE READY: YES / NO
- NETWORK LINK READY: YES / NO
- LIVE ROBOT HOST READY: YES / NO
- preflight capture remains synthetic only: YES / NO

## Gate

Proceed to live inspect only if:
- authorization is confirmed;
- correct physical interface is confirmed;
- required preflight checks are green.

**PRELIGHT GO:** YES / NO

Operator: __________________
Recorder: __________________
Time: __________________
