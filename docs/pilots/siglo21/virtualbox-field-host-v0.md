# VirtualBox Field Host V0

## Purpose

Provide a zero-cost, non-destructive Linux field-host candidate on the existing Windows laptop without repartitioning the internal or external disks.

This is a **candidate path**, not yet an approved live Unitree DDS path. Bridged DDS/multicast must be validated before any robot session.

## Storage model

The VM is stored under `D:\\Elaris-VM`.

The external drive remains FAT32 and is not repartitioned or formatted.

The virtual disk is:

- VMDK;
- 16 GB virtual capacity;
- dynamically allocated;
- split into 2 GB segments so no individual VMDK segment exceeds the FAT32 single-file limit.

The 16 GB value is a maximum virtual capacity, not 16 GB reserved immediately.

## Networking model

- NIC 1: VirtualBox NAT for Ubuntu package installation and Git access.
- NIC 2: bridged directly to a selected physical adapter.
- Field target: `Realtek PCIe GbE Family Controller` for the future authorized robot network.
- Lab validation fallback: `MediaTek Wi-Fi 6 MT7921 Wireless LAN Card` for no-robot bridge/multicast testing.

No live robot access is performed by VM creation or by the no-robot network probes.

## Prepare the VM

From Windows PowerShell:

~~~powershell
cd C:\Users\alexi\Documents\Elaris-
git pull
powershell -ExecutionPolicy Bypass -File scripts\field-kit\prepare_virtualbox_field_host.ps1
~~~

The script:

1. verifies VirtualBox and the Realtek bridged adapter;
2. downloads the official Ubuntu Server 24.04.5 ISO;
3. verifies the official SHA-256;
4. creates the VM under D:;
5. creates the FAT32-safe split VMDK;
6. configures NAT + Realtek bridged networking;
7. starts the Ubuntu installer.

## Ubuntu installation

Install Ubuntu only into the VM virtual disk.

Do not choose, attach, repartition or format a physical Windows disk from inside the installer.

After the installation completes, the ISO should be detached before normal disk boot.

## After Ubuntu boots

### Node runtime

Use Node.js 20 or newer for full repository verification.

The Edge Collector can execute on older Node releases, but the current Playwright toolchain rejects Node 18. The repository therefore declares `node >=20`.

Confirm before running the full verification path:

~~~bash
node --version
~~~

### Clone and prepare

Clone Elaris and prepare the existing field stack:

~~~bash
git clone --branch feat/siglo21-field-kit-v0 https://github.com/AlexiVion/Elaris-.git
cd Elaris-
bash scripts/field-kit/setup_unitree_linux.sh
source .field-kit/env.sh
pnpm install --frozen-lockfile --ignore-scripts
~~~

Then identify both VM interfaces:

~~~bash
ip -brief link
ip -brief addr
~~~

The bridged robot-facing interface must be validated with no-robot multicast tests before `inspect-unitree` is allowed.

## No-robot validation result — 2026-10-03

The VirtualBox Wi-Fi bridge path was empirically validated without connecting to a robot.

Observed configuration:

- Windows physical adapter: `MediaTek Wi-Fi 6 MT7921 Wireless LAN Card`;
- VirtualBox NIC 2: `bridged`, cable connected;
- Ubuntu interface: `enp0s8`;
- Ubuntu link state: `UP` + `LOWER_UP`;
- Ubuntu carrier: `1`;
- Windows Wi-Fi IPv4: `192.168.100.39`;
- temporary Ubuntu test IPv4: `192.168.100.240/24`;
- Windows -> Ubuntu IPv4 ping: PASS, 0% loss;
- Windows -> Ubuntu IPv4 multicast UDP to `239.255.42.99:42499`: PASS;
- receiver evidence: `PASS:ELARIS-VBOX-MCAST-TEST-2:FROM:192.168.100.39:<ephemeral-port>`.

Ubuntu -> Windows ICMP did not receive replies during this test. This does not invalidate the successful multicast receive result and is consistent with host firewall/ICMP policy being a separate concern.

This validates that the current VirtualBox + MediaTek bridge can deliver IPv4 multicast from the Windows physical network stack to the Ubuntu guest.

It does **not** validate:

- the Realtek Ethernet bridge path;
- Unitree G1 DDS discovery;
- live robot telemetry;
- bidirectional DDS behavior;
- any command/control path.

## Status gate

VirtualBox is accepted for no-robot software/network preparation because the Wi-Fi bridged multicast path is now empirically verified.

The live Unitree field path still requires:

- Realtek/authorized robot-network link active in Ubuntu;
- multicast/DDS discovery on that actual robot-facing link;
- CycloneDDS bound to the robot-facing interface;
- read-only `rt/lowstate` inspection only;
- no command publisher in the Elaris live bridge.

Current status:

**VIRTUALBOX SOFTWARE HOST: READY**

**VIRTUALBOX WI-FI MULTICAST PATH: VALIDATED**

**VIRTUALBOX REALTEK / UNITREE LIVE DDS PATH: NOT YET VALIDATED**


## Full repository verification on the VM

The external-drive VM can be materially slower than a native SSD host. Vitest therefore allows 30 seconds for ordinary tests and hooks while individual field-kit tests may define a larger explicit timeout.

Run the canonical verification path only with Node 20+.

If `next/font` attempts Google Fonts over an unavailable IPv6 path while IPv4 NAT is working, retry the build with IPv4 DNS ordering for that process:

~~~bash
NODE_OPTIONS=--dns-result-order=ipv4first pnpm build
~~~

This is a host-network workaround only; it does not alter Elaris runtime behavior.


## Final VM verification result — 2026-10-03

The Ubuntu VirtualBox host completed the repository verification path after the environment was upgraded to Node 20 and Playwright Chromium system dependencies were installed.

Observed runtime:

- Node 20.20.2;
- npm 10.8.2;
- pnpm 9.15.4;
- Playwright Chromium installed;
- required Ubuntu browser libraries installed through Playwright's official dependency installer.

Verification evidence collected during the integrated stack work:

~~~text
pnpm db:reset                       PASS
pnpm lint                           PASS
pnpm typecheck                      PASS
pnpm test                           PASS — 90/90
NODE_OPTIONS=--dns-result-order=ipv4first pnpm build
                                      PASS
pnpm exec playwright test           PASS — 15/15
~~~

Additional targeted evidence:

~~~text
Robot Adapter tests                 7/7 PASS
Field Kit tests                    15/15 PASS
Platform E2E spec                   8/8 PASS
Incident Reconstruction target      1/1 PASS
Evidence/requirements smoke target  1/1 PASS
~~~

The full Playwright suite took approximately 3.5 minutes on the external-drive VM. Some multi-page E2E scenarios required scoped test timeouts because the VM is materially slower than a native SSD environment.

Those timeout changes are test-harness accommodations only. They do not alter product/runtime behavior.

Current interpretation:

~~~text
VM SOFTWARE ENVIRONMENT             READY
GENERIC WI-FI MULTICAST RECEIVE     VALIDATED
LINUX LIVE-HOST PREREQUISITES       READY
PHYSICAL UNITREE G1 CONNECTION      NOT ATTEMPTED
REAL UNITREE DDS DISCOVERY          NOT VALIDATED
REAL rt/lowstate                    NOT VALIDATED
~~~

See `docs/pilots/siglo21/robotics-integration-v0-record.md` for the complete implementation and integration record.
