# VirtualBox Field Host V0

## Purpose

Provide a zero-cost, non-destructive Linux field-host candidate on the existing Windows laptop without repartitioning the internal or external disks.

This is a **candidate path**, not yet an approved live Unitree DDS path. Bridged DDS/multicast must be validated before any robot session.

## Storage model

The VM is stored under `D:\Elaris-VM`.

The external drive remains FAT32 and is not repartitioned or formatted.

The virtual disk is:

- VMDK;
- 16 GB virtual capacity;
- dynamically allocated;
- split into 2 GB segments so no individual VMDK segment exceeds the FAT32 single-file limit.

The 16 GB value is a maximum virtual capacity, not 16 GB reserved immediately.

## Networking model

- NIC 1: VirtualBox NAT for Ubuntu package installation and Git access.
- NIC 2: bridged directly to `Realtek PCIe GbE Family Controller` for the future authorized robot network.

No live robot access is performed by VM creation.

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
pnpm install
~~~

Then identify both VM interfaces:

~~~bash
ip -brief link
ip -brief addr
~~~

The bridged Realtek-facing interface must be validated with no-robot multicast tests before `inspect-unitree` is allowed.

## Status gate

VirtualBox is accepted only if the following are empirically verified:

- bridged Realtek interface visible in Ubuntu;
- external LAN multicast reaches the Ubuntu guest reliably;
- CycloneDDS can bind to that bridged interface;
- no command publisher exists in the Elaris live bridge.

Until then:

**VIRTUALBOX LIVE DDS HOST: CANDIDATE / NOT FIELD-APPROVED**
