# Robotics Integration V0 — Implementation & Verification Record

**Date:** 2026-10-03  
**Repository:** `AlexiVion/Elaris-` migration branch feeding `Juanmarossi/Elaris-`  
**Status:** **IMPLEMENTED / DEMO + FIELD TOOLING READY / LIVE ROBOT VALIDATION PENDING**

This document is the durable GitHub record of the robotics integration work completed around Component Health V0, Unitree G1 field acquisition, the Siglo 21 field path, Robot Execution Context and the supporting verification work.

It exists so a new human or AI agent can reconstruct the current technical state without relying on prior chats.

---

## 1. Executive summary

Elaris now has a coherent read-only robotics integration stack:

~~~text
Robot / replay source
        ↓
ReadOnlyRobotTransport
        ↓
Robot Adapter
        ↓
normalized telemetry
        ↓
Edge Collector
        ↓
encrypted local capture
        ↓
human review
        ↓
explicit export approval
        ↓
future Component Health ingestion
~~~

The current concrete live-source target is **Unitree G1 via public SDK2 state channels**.

The stack is intentionally conservative:

- read-only;
- no robot command publisher;
- no actuation path;
- no remote-control path;
- no cloud upload during capture;
- no camera/audio collection;
- telemetry is SENSITIVE by default;
- export is NOT_APPROVED by default;
- human authority remains explicit.

A separate optional **Robot Execution Context** contract preserves controller/policy/runtime provenance when a source exposes it.

The first product hypothesis using this infrastructure remains **Component Health V0**.

---

## 2. What was implemented

### 2.1 Robot Adapter V0

Location:

- `lib/robot-adapters/`
- `docs/architecture/robot-adapter-v0.md`

Purpose:

Provide an OEM-independent read-only boundary between robot state sources and Elaris.

Implemented:

- universal adapter contract;
- `ReadOnlyRobotTransport`;
- normalized telemetry events;
- stable component identities;
- replay transport;
- Unitree G1 adapter;
- explicit allowed/blocked channel policy;
- Unitree G1 SDK2/DDS read-only transport integration;
- 29-slot public G1 motor mapping basis;
- left knee mapping retained at public index 3;
- optional execution-context propagation.

Safety boundary:

- transport exposes no publish/send/control method;
- `rt/lowcmd` is blocked;
- `rt/arm_sdk` is blocked;
- known command/control-looking channels are outside the read-only contract.

Important limitation:

The exact Siglo 21 G1 SKU, active DOF, hand configuration, firmware and physical component identity are still unknown until the first authorized live session.

---

### 2.2 Edge Collector V0

Location:

- `apps/edge-collector/`
- `lib/edge-collector/`
- `docs/architecture/edge-collector-v0.md`

Purpose:

Capture a bounded, authorized robot-state dataset locally without turning Elaris into a robot-control system.

Implemented CLI workflow:

~~~text
doctor / preflight
inspect-unitree
capture-unitree
capture-replay
review
approve-export
~~~

Implemented data path:

~~~text
authorized network
      ↓
subscriber-only OEM bridge
      ↓
Robot Adapter
      ↓
raw minimized frame + normalized telemetry
      ↓
AES-256-GCM local encryption
      ↓
capture session
      ↓
human review
      ↓
explicit local export approval
~~~

Capture properties:

- AES-256-GCM;
- scrypt-derived session key;
- random salt/IV;
- passphrase through `ELARIS_EDGE_PASSPHRASE`;
- capture artifacts excluded from git;
- raw and normalized records retained locally;
- SHA-256 finalization checksums;
- SENSITIVE classification by default;
- NOT_APPROVED export state by default.

Data minimization for Unitree G1:

- system/mode fields;
- tick;
- IMU orientation / angular velocity;
- motor position;
- velocity;
- acceleration if exposed;
- estimated torque;
- temperature slots;
- voltage;
- motor-state code.

Explicitly excluded:

- wireless remote bytes;
- camera;
- microphone;
- audio;
- video;
- command messages;
- unrelated network traffic.

---

### 2.3 Subscriber-only Unitree bridge

Location:

- `apps/edge-collector/unitree_g1_readonly_bridge.py`

The Python bridge uses the official public Unitree SDK2 subscriber model.

Critical invariant:

~~~text
ChannelSubscriber  ✅
ChannelPublisher   ❌
~~~

The bridge does not import or instantiate `ChannelPublisher`.

This is one of the core safety guarantees of V0.

---

## 3. Siglo 21 Field Kit V0

Location:

- `scripts/field-kit/`
- `docs/pilots/siglo21/field-kit-v0.md`
- `docs/pilots/siglo21/field-runbook-v0.md`
- `docs/pilots/siglo21/edge-capture-protocol-v0.md`

Purpose:

Turn the Edge Collector into a repeatable on-site procedure for an authorized Unitree G1 session.

Implemented:

- Linux setup for CycloneDDS + Unitree SDK2 Python;
- no-robot software doctor;
- interface/link readiness checks;
- multicast capability checks;
- Windows development/replay preflight;
- WSL software-preparation path;
- VirtualBox field-host preparation;
- multicast diagnostics;
- narrow Windows firewall helper scripts;
- synthetic replay validation;
- field runbook;
- explicit stop conditions;
- explicit human go/no-go before capture;
- export approval separated from capture.

Field sequence:

~~~text
LOCAL PREFLIGHT
→ AUTHORIZATION
→ PHYSICAL CONNECT
→ INSPECT ONLY
→ HUMAN GO / NO-GO
→ SHORT BASELINE
→ FINALIZE
→ LOCAL REVIEW
→ EXPORT REMAINS NOT_APPROVED
→ separate approval if authorized
~~~

No robot motion is initiated by Elaris.

---

## 4. WSL investigation and decision

WSL2 was evaluated first as a possible Linux field environment.

Software preparation succeeded:

- Ubuntu 24.04 WSL;
- Node/pnpm/Python environment;
- CycloneDDS 0.10.2;
- Unitree SDK2 Python 1.0.1;
- Elaris field-kit environment;
- software doctor.

However, host-to-WSL multicast delivery did not validate reliably enough for the intended DDS field path.

Decision:

**WSL is accepted for software preparation and replay only.**

It is not the approved live Unitree DDS host for the first field session.

This decision is encoded in the field runbook and preflight logic.

---

## 5. VirtualBox Ubuntu field host

Location:

- `docs/pilots/siglo21/virtualbox-field-host-v0.md`
- `scripts/field-kit/prepare_virtualbox_field_host.ps1`

A non-destructive Ubuntu VM was built because the field path required Linux while preserving the existing Windows installation and external drive contents.

### Storage

- VM stored on external WD drive;
- no repartition;
- no formatting;
- physical drive remains FAT32;
- VMDK virtual disk;
- 16 GB virtual capacity;
- dynamically allocated;
- split into 2 GB segments to respect FAT32 file-size limits.

### VM

- VirtualBox 7.2.x;
- Ubuntu Server 24.04.5;
- 4 GB RAM;
- 2 CPUs;
- NAT NIC for package/Git access;
- second bridged NIC for field networking;
- no shared folders;
- no USB passthrough;
- no physical disk attached to the VM.

### Linux runtime

Validated in the VM:

- Node 20.20.2;
- npm 10.8.2;
- pnpm 9.15.4;
- Python 3.12;
- CycloneDDS 0.10.2;
- Unitree SDK2 Python 1.0.1;
- repository dependencies;
- Playwright Chromium + required Ubuntu runtime libraries.

### Network validation without a robot

VirtualBox NIC 2 was bridged to:

`MediaTek Wi-Fi 6 MT7921 Wireless LAN Card`

Observed:

- Ubuntu interface `enp0s8`;
- link `UP` + `LOWER_UP`;
- carrier = 1;
- temporary guest IPv4 `192.168.100.240/24`;
- Windows Wi-Fi IPv4 `192.168.100.39`;
- Windows → Ubuntu IPv4 ping: PASS;
- Windows → Ubuntu UDP multicast on `239.255.42.99:42499`: PASS.

Receiver evidence:

~~~text
PASS:ELARIS-VBOX-MCAST-TEST-2:FROM:192.168.100.39:<ephemeral-port>
~~~

This proves generic IPv4 multicast can cross:

~~~text
Windows MediaTek Wi-Fi
→ VirtualBox bridged NIC
→ Ubuntu enp0s8
~~~

It does **not** prove:

- Unitree G1 DDS discovery;
- Realtek Ethernet field behavior;
- `rt/lowstate` reception from a robot;
- bidirectional DDS;
- command/control behavior.

---

## 6. Linux live-host preflight result

The no-robot live preflight was executed on Ubuntu against `enp0s8`.

Verified:

- Node available;
- pnpm available;
- Python available;
- Git available;
- interface exists;
- interface link active;
- multicast capability present;
- CycloneDDS import/configuration available;
- Unitree SDK2 Python available;
- subscriber-only bridge checks pass.

Reported state:

~~~text
SOFTWARE READY: YES
NETWORK LINK READY: YES
LIVE ROBOT HOST READY: YES
MODE: READ_ONLY
ROBOT CONNECTION: NOT ATTEMPTED
~~~

Important semantic boundary:

**LIVE ROBOT HOST READY: YES means local host prerequisites are satisfied.**

It does **not** mean:

- a G1 was discovered;
- DDS discovery succeeded against a G1;
- real telemetry was received;
- the robot was validated.

---

## 7. Robot Execution Context V0

Location:

- `lib/robot-adapters/types.ts`
- `docs/architecture/robot-execution-context-v0.md`

Purpose:

Preserve runtime provenance alongside physical telemetry when the source stack exposes it.

Current optional fields:

~~~text
sourceStack
controlMode
controllerId
controllerVersion
policyId
policyVersion
~~~

The object is optional and may be absent entirely.

It does not create control capability.

It does not:

- publish commands;
- actuate;
- load policies;
- execute policies;
- train policies;
- change robot state;
- make safety decisions.

No Prisma/shared persistence was added for this context.

That remains gated on real field evidence.

---

## 8. Actual vs desired telemetry semantics

When a source exposes both measured and desired/controller values, Elaris now has a documented convention:

~~~text
joint.position.actual
joint.position.desired
joint.velocity.actual
joint.velocity.desired
joint.torque.actual
joint.torque.desired
~~~

A deterministic tracking delta may later be calculated as:

~~~text
actual - desired
~~~

This is evidence, not a diagnosis.

A high tracking delta or torque value must not automatically be labeled damage, failure or unsafe operation.

---

## 9. Humandroid / TienKung technical reference

Location:

- `docs/architecture/humandroid-tienkung-reference-stack.md`

Public reference stacks studied:

- `Open-X-Humanoid/TienKung-Lab`;
- `Open-X-Humanoid/Deploy_Tienkung`.

The goal was not to copy the training stack into Elaris.

The reference architecture is understood as:

~~~text
TienKung-Lab
(training / simulation)
        ↓
trained policy
        ↓
Deploy_Tienkung
(ROS2 / controller / FSM)
        ↓
robot
        ↓
actual state + desired state + controller context
        ↓
future read-only Elaris adapter
~~~

Relevant public concepts identified:

- 20-joint policy/action layout in the shown TienKung configuration;
- observed joint position/velocity/torque;
- desired joint position/velocity/torque;
- IMU data;
- ROS2 control layer;
- STOP / ZERO / MLP controller states;
- policy/controller provenance.

Decision:

**TienKung-Lab is technical context, not an Elaris dependency.**

Elaris will not become an IsaacLab/RL training platform as part of this work.

A future TienKung/Humandroid adapter is gated on seeing the real Humandroid runtime, topics and message types first.

---

## 10. Component Health V0 relationship

Location:

- `docs/pilots/humandroid/component-health-v0.md`
- `docs/product-systems/component-health-hypothesis.md`

Component Health remains:

**HYPOTHESIS · DEMO READY V0 · NO FIELD VALIDATION YET**

The integration stack gives it a credible path from synthetic demo data toward real evidence.

Product loop:

~~~text
Fleet Health
→ Robot Health
→ Component Detail
→ signal / evidence
→ human review
→ inspection / service
→ repair / replacement
→ configuration change
→ revalidation
→ named Return-to-Service
→ outcome
~~~

Current validation target:

**1 real robot + 1 real component + 1 real event + real data/tools/process around that event.**

No failure probability, Remaining Useful Life or autonomous maintenance decision is claimed.

---

## 11. Repository verification record

Verification evidence collected during this integration included:

### Targeted checks

- Robot Adapter tests: **7/7 PASS**;
- Field Kit tests: **15/15 PASS**;
- Incident Reconstruction targeted E2E: **1/1 PASS**;
- filtered evidence/requirements targeted E2E: **1/1 PASS**;
- platform E2E spec: **8/8 PASS**.

### Full test/build path

Repository checks completed during the integrated stack validation:

~~~text
pnpm db:reset                       PASS
pnpm lint                           PASS
pnpm typecheck                      PASS
pnpm test                           PASS — 90/90
NODE_OPTIONS=--dns-result-order=ipv4first pnpm build
                                      PASS
pnpm exec playwright test           PASS — 15/15
~~~

The IPv4-first build invocation was a host-network workaround for `next/font` access from the VirtualBox NAT environment. It does not change application runtime semantics.

Final Playwright result on the code-bearing PR #6 head:

~~~text
Running 15 tests using 1 worker
15 passed
~~~

The test-suite stabilization changes were limited to E2E route-contract alignment and scoped timeouts for the slower external-drive VM.

No product/runtime behavior was changed by PR #6.

---

## 12. Git / Pull Request integration record

The robotics work was developed as a stacked sequence in the Alexi fork and then integrated in order into `migration/alexi-platform-v1`.

### PR #2 — Robot Adapter V0

~~~text
head: feat/robot-adapter-v0
merged into: migration/alexi-platform-v1
merge commit: a5b9eef007c5a58b1f5f30585ac378c72d074918
~~~

### PR #3 — Edge Collector V0

~~~text
head: feat/edge-collector-v0
merged into: migration/alexi-platform-v1
merge commit: 59ebc00bb5787cb088c22d01a330b525a8b5dda5
~~~

### PR #4 — Siglo 21 Field Kit V0

~~~text
head: feat/siglo21-field-kit-v0
merged into: migration/alexi-platform-v1
merge commit: 2309520bb343c2a3b925fbdf0e79b9b361517bf2
~~~

### PR #5 — Robot Execution Context V0

~~~text
head: feat/robot-execution-context-v0
merged into: migration/alexi-platform-v1
merge commit: d190d4771fe6ba8f6b8f91fd029ac0e0de9b4573
~~~

### PR #6 — E2E route-contract alignment

~~~text
head: fix/e2e-platform-route-contract
merged into: migration/alexi-platform-v1
merge commit: e597119853d231f19b4fb1ce2a782d950af0d36a
~~~

Merge commits were intentionally used for this stacked migration integration so ancestry remained explicit while the canonical repository migration was still open.

---

## 13. Canonical repository state

Canonical repository:

`Juanmarossi/Elaris-`

Canonical migration PR:

`Juanmarossi/Elaris-#1 — Import Elaris platform, product demos and collaboration OS`

At the end of the integration sequence:

- PR #1 remained OPEN;
- it was not a draft;
- GitHub reported it mergeable;
- its head pointed at the integrated migration branch.

The active ChatGPT/GitHub connection has read access but not push/write access to the canonical repository, so final merge authority remains with a canonical-repository maintainer.

After this documentation-only follow-up, the migration PR head advances automatically because the source branch is the same `migration/alexi-platform-v1` branch.

---

## 14. What is still NOT validated

The following remain explicitly open:

- physical connection to the Siglo 21 Unitree G1;
- exact G1 / G1 EDU SKU;
- exact active DOF;
- exact hand/end-effector configuration;
- robot firmware/software versions;
- Realtek Ethernet → robot network path;
- actual Unitree DDS discovery;
- actual `rt/lowstate` receipt from the physical robot;
- real component/serial identity;
- real component degradation/failure event;
- real actual-vs-desired telemetry from Humandroid/TienKung;
- real controller/policy metadata from Humandroid;
- persistent telemetry ingestion;
- predictive failure model;
- Remaining Useful Life model.

Do not infer any of these from no-robot readiness tests.

---

## 15. Next technical milestone

The next useful step is not more synthetic infrastructure.

It is the first authorized Siglo 21 field session.

Target sequence:

~~~text
1. authorization
2. connect approved physical network
3. verify Linux interface/link
4. field preflight
5. inspect-unitree only
6. human go/no-go
7. short encrypted read-only baseline
8. finalize
9. local review
10. keep export NOT_APPROVED
11. separate export approval if authorized
~~~

Desired outcome:

**Dataset #001: one bounded encrypted baseline from one real Unitree G1 session, with corrected robot/configuration facts and preserved provenance.**

---

## 16. Invariants that must survive future changes

Future contributors must preserve these unless a separately reviewed architecture decision explicitly changes them:

1. Robot acquisition remains read-only by default.
2. No command publisher is added casually to Robot Adapter or Edge Collector.
3. `rt/lowcmd` and `rt/arm_sdk` remain outside V0 capture scope.
4. Capture remains local-first and encrypted.
5. Cloud upload is not implicit.
6. Export approval is explicit and separate.
7. Camera/audio are not collected by default.
8. Real telemetry is SENSITIVE by default.
9. Execution context is provenance, not control.
10. Actual/desired tracking deltas are evidence, not diagnoses.
11. Component Health remains a hypothesis until real field evidence supports it.
12. No persistent shared schema expansion is justified solely by demo needs.
13. Human authority remains explicit for maintenance, safety and return-to-service decisions.

---

## 17. Related durable documentation

Architecture:

- `docs/architecture/robot-adapter-v0.md`
- `docs/architecture/edge-collector-v0.md`
- `docs/architecture/robot-execution-context-v0.md`
- `docs/architecture/humandroid-tienkung-reference-stack.md`

Siglo 21:

- `docs/pilots/siglo21/field-kit-v0.md`
- `docs/pilots/siglo21/field-runbook-v0.md`
- `docs/pilots/siglo21/edge-capture-protocol-v0.md`
- `docs/pilots/siglo21/linux-partner-handoff-v0.md`
- `docs/pilots/siglo21/virtualbox-field-host-v0.md`

Humandroid / Component Health:

- `docs/pilots/humandroid/component-health-v0.md`
- `docs/pilots/humandroid/data-request.md`
- `docs/pilots/humandroid/minimum-data-model.md`
- `docs/product-systems/component-health-hypothesis.md`

This file is the integration/status index. The linked documents remain authoritative for their detailed contracts and procedures.
