# Siglo 21 Linux Partner Handoff V0

## Purpose

Prepare the native-Linux field host for the first authorized Unitree G1 session.

This handoff assumes the Windows/WSL development path is already verified. WSL is not approved as the live DDS host for Field Kit V0.

## Safety boundary

Before any live robot access:

- use native Linux with direct NIC access;
- keep Elaris READ ONLY;
- do not publish to `rt/lowcmd` or `rt/arm_sdk`;
- do not run robot capture before the no-robot preflight is green;
- do not connect to the university robot/network without explicit authorization;
- do not enable cloud upload.

## 1. Clone the field branch

~~~bash
git clone --branch feat/siglo21-field-kit-v0 https://github.com/AlexiVion/Elaris-.git
cd Elaris-
~~~

## 2. Install basic host prerequisites

Ubuntu/Debian example:

~~~bash
sudo apt-get update
sudo apt-get install -y git python3 python3-venv python3-pip build-essential cmake iproute2 nodejs npm
sudo npm install -g pnpm@9.15.4
~~~

If Node is already managed by another source, keep the existing Node/npm pair and only ensure `pnpm 9.15.4` is available.

## 3. Prepare Unitree SDK2 + CycloneDDS

~~~bash
bash scripts/field-kit/setup_unitree_linux.sh
source .field-kit/env.sh
pnpm install
~~~

Expected software result:

~~~text
unitree_sdk2py import: OK
cyclonedds import: OK
FIELD KIT PYTHON READY
~~~

No robot connection is attempted by setup.

## 4. Identify the direct Ethernet interface

~~~bash
ip -brief link
ip -brief addr
~~~

Choose the physical interface that will be authorized for the robot network, for example `enp3s0` or `eth0`.

Do not use WSL or a NAT-only virtual interface.

## 5. Run the no-robot native-Linux preflight

~~~bash
source .field-kit/env.sh
bash scripts/field-kit/preflight_live_linux.sh <interface>
~~~

Required before any live inspect:

~~~text
PASS: interface exists
PASS: bridge
PASS: cyclonedds
PASS: network_interface
PASS: python
PASS: unitree_sdk2py
LIVE ROBOT HOST READY: YES
FIELD KIT PREFLIGHT COMPLETE
~~~

If this is not green, stop and report the full output.

## 6. First authorized robot step

Only after university authorization and after the native-Linux preflight is green:

~~~bash
pnpm edge inspect-unitree --interface <interface> --hz 20
~~~

This is the first live step. It must remain subscriber-only and must not write a capture dataset.

Do not proceed to `capture-unitree` until the inspect output has been reviewed.

## What to send back to Alexi

Send the full outputs of:

~~~bash
uname -a
ip -brief link
ip -brief addr
source .field-kit/env.sh
pnpm edge doctor-unitree --interface <interface>
bash scripts/field-kit/preflight_live_linux.sh <interface>
~~~

Do not send passwords, university credentials, SSH keys, or private robot credentials.
