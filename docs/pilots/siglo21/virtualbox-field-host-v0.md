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
