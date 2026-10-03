# Siglo 21 Field Kit V0

## Status

**FIELD PREPARATION · UNITREE G1 FIRST TARGET · READ-ONLY · LOCAL-FIRST**

This kit prepares one Elaris laptop for the first authorized Universidad Siglo 21 robot session.

It does not authorize access by itself. University authorization, the exact robot, the approved network interface and the agreed capture scope must still be confirmed on site.

## Why the live kit targets Linux

Unitree's public SDK2 material documents a Linux/Ubuntu development path. The C++ SDK publishes an Ubuntu 20.04 prebuild environment, and the Python SDK installation guide uses Linux tooling and requires Python >= 3.8 with CycloneDDS.

Elaris therefore separates:

- **Windows development/replay** — already verified locally;
- **Linux Unitree field path** — the selected SDK2/DDS environment;
- **WSL2** — software preparation/replay only;
- **VirtualBox Ubuntu** — prepared field-host candidate with generic bridged multicast receive validated, but real Unitree DDS still pending.

This avoids pretending that native Windows or WSL2 has been validated for the live DDS path.

### WSL2 status

WSL2 is approved only as a **software preparation/replay environment**, not as the live field host.

On the current Elaris laptop, WSL2 mirrored networking was verified to expose the physical Windows NICs and advertise multicast capability. The Unitree SDK2/CycloneDDS stack also reached `SOFTWARE READY: YES`. However, repeated no-robot multicast probes showed that host-originated multicast was not delivered into WSL, including after:

- enabling mirrored networking;
- verifying matching Windows/WSL interface MAC addresses;
- adding a narrow Hyper-V inbound UDP test rule;
- joining the multicast group on the Windows host.

Because SDK2/DDS discovery depends on reliable multicast behavior, Elaris V0 treats this as sufficient evidence to **reject WSL2 as the live robot host for the first field session**.

The live path therefore requires a **Linux host with an actual robot-facing interface that passes the Elaris live preflight**.

The currently prepared host is the Ubuntu VirtualBox VM described in `virtualbox-field-host-v0.md`. Its Wi-Fi bridged generic IPv4 multicast receive path is validated. The actual Siglo 21 robot-facing Ethernet/DDS path is still unvalidated and must be checked on site before live inspect.

## Field Kit contents

~~~text
scripts/field-kit/
├── preflight_windows.ps1
├── prepare_wsl_software.sh
├── prepare_virtualbox_field_host.ps1
├── setup_unitree_linux.sh
├── preflight_live_linux.sh
├── multicast_receiver.py
├── test_wsl_multicast.ps1
└── test_wsl_multicast_host_join.ps1

apps/edge-collector/
├── unitree_g1_preflight.py
├── unitree_g1_readonly_bridge.py
└── cli.ts

docs/pilots/siglo21/
├── field-kit-v0.md
├── field-runbook-v0.md
└── edge-capture-protocol-v0.md
~~~

## Local preparation — Windows

The Windows machine remains valid for Elaris development, replay, encryption and review.

From PowerShell:

~~~powershell
cd C:\Users\alexi\Documents\Elaris-
git pull
pnpm install
pnpm field:preflight:windows
~~~

PASS means:

- Node/pnpm/git are available;
- Robot Adapter + Edge Collector tests pass;
- synthetic Unitree replay capture works;
- encrypted local capture remains available.

It does **not** mean the physical Unitree DDS path has been verified.

## Live preparation — Linux

Use a **Linux host** with access to the authorized robot network and an interface that passes the Elaris live preflight. Do not use WSL2 for live robot DDS.

The prepared VirtualBox Ubuntu host is acceptable for the next field step only if the actual robot-facing bridged interface is active and passes the same link/multicast/preflight gates on site.

First install basic local prerequisites such as git, Python 3 and Python venv support according to the chosen Linux distribution.

Then from the Elaris repo:

~~~bash
bash scripts/field-kit/setup_unitree_linux.sh
~~~

The setup script:

- creates `.field-kit/unitree-venv`;
- clones the official `unitree_sdk2_python` repo under `.field-kit/vendor/`;
- builds and installs CycloneDDS **0.10.2** locally under `.field-kit/vendor/cyclonedds/install`;
- exports `CYCLONEDDS_HOME`, `CMAKE_PREFIX_PATH` and `LD_LIBRARY_PATH` for that local build;
- installs the SDK in the isolated virtual environment;
- writes `.field-kit/env.sh` so the same pinned environment can be reloaded in a new shell;
- verifies imports for `unitree_sdk2py` and `cyclonedds`;
- does not connect to a robot.

After setup, load the pinned field environment printed by the script:

~~~bash
source .field-kit/env.sh
~~~

List local interfaces:

~~~bash
ip -brief link
~~~

Then run the no-robot doctor:

~~~bash
pnpm edge doctor-unitree --interface <authorized-interface>
~~~

`doctor-unitree` checks:

- Python >= 3.8;
- `unitree_sdk2py` import;
- `cyclonedds` import;
- requested network interface exists;
- subscriber-only bridge file exists;
- bridge contains `ChannelSubscriber` and no command publisher import/call.

It does not connect to the robot.

## Full Linux preflight

After setting `ELARIS_UNITREE_PYTHON`:

~~~bash
bash scripts/field-kit/preflight_live_linux.sh <authorized-interface>
~~~

This runs the no-robot doctor plus a synthetic replay validation.

### Observed no-robot result — 2026-10-03

On the prepared Ubuntu VirtualBox host, using active bridged interface `enp0s8`, the preflight reported:

~~~text
SOFTWARE READY: YES
NETWORK LINK READY: YES
LIVE ROBOT HOST READY: YES
MODE: READ_ONLY
ROBOT CONNECTION: NOT ATTEMPTED
FIELD KIT PREFLIGHT COMPLETE
~~~

This means the local host prerequisites were satisfied on that active multicast-capable interface.

It does **not** mean a Unitree G1 was discovered or that real `rt/lowstate` was received.

See `robotics-integration-v0-record.md` and `virtualbox-field-host-v0.md` for the full validation record.

## Equipment checklist

Bring:

- Elaris laptop with charger;
- wired Ethernet adapter if the laptop needs one;
- known-good Ethernet cable;
- enough local disk for short captures;
- offline copy of this repo/docs;
- local strong passphrase prepared before real capture;
- university contact who can authorize/stop the session;
- notebook/session sheet for exact robot variant, firmware, hands and configuration observations.

Do not bring a plan that depends on internet access.

## Security checklist before leaving for the university

- `captures/` ignored by git;
- `.field-kit/` ignored by git;
- no university credentials in repo or shell history;
- real passphrase is not committed or passed as a CLI argument;
- live bridge remains subscriber-only;
- `rt/lowcmd` and `rt/arm_sdk` remain blocked;
- cloud upload remains absent from V0;
- audio/video collection remains absent from V0.

## Official references used for the field path

- Unitree SDK2 Python: https://github.com/unitreerobotics/unitree_sdk2_python
- Unitree SDK2: https://github.com/unitreerobotics/unitree_sdk2

Current Elaris field assumptions must be rechecked if Unitree changes its SDK or Siglo 21's robot differs from the expected G1 setup.
