#!/usr/bin/env python3
"""
Elaris Unitree G1 field preflight.

This script never connects to the robot and never imports ChannelPublisher.
It checks local Python/SDK/network-interface prerequisites for the
subscriber-only bridge.
"""

import argparse
import importlib
import json
import platform
import socket
import sys
from pathlib import Path


def check_import(module_name):
    try:
        module = importlib.import_module(module_name)
        version = getattr(module, "__version__", None)
        return {"ok": True, "module": module_name, "version": version}
    except Exception as exc:
        return {"ok": False, "module": module_name, "error": str(exc)}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--interface", required=True)
    parser.add_argument("--bridge", required=True)
    args = parser.parse_args()

    interfaces = [name for _, name in socket.if_nameindex()]
    interface_exists = args.interface in interfaces
    operstate_path = Path("/sys/class/net") / args.interface / "operstate"
    flags_path = Path("/sys/class/net") / args.interface / "flags"
    operstate = operstate_path.read_text(encoding="utf-8").strip() if operstate_path.exists() else "unknown"
    flags = int(flags_path.read_text(encoding="utf-8").strip(), 16) if flags_path.exists() else 0
    iff_up = bool(flags & 0x1)
    iff_multicast = bool(flags & 0x1000)
    network_link_ready = interface_exists and iff_up and operstate == "up" and iff_multicast
    python_ok = sys.version_info >= (3, 8)
    release_text = platform.release().lower()
    platform_text = platform.platform().lower()
    is_wsl = "microsoft" in release_text or "microsoft" in platform_text
    bridge_path = Path(args.bridge)
    bridge_exists = bridge_path.exists()
    bridge_text = bridge_path.read_text(encoding="utf-8") if bridge_exists else ""
    publisher_import_absent = all(token not in bridge_text for token in [
        "import ChannelPublisher",
        ", ChannelPublisher",
        "ChannelPublisher(",
    ])

    checks = {
        "python": {
            "ok": python_ok,
            "version": platform.python_version(),
            "executable": sys.executable,
            "platform": platform.platform(),
        },
        "unitree_sdk2py": check_import("unitree_sdk2py"),
        "cyclonedds": check_import("cyclonedds"),
        "network_interface": {
            "ok": interface_exists,
            "requested": args.interface,
            "available": interfaces,
            "operstate": operstate,
            "iff_up": iff_up,
            "iff_multicast": iff_multicast,
        },
        "bridge": {
            "ok": bridge_exists
            and "ChannelSubscriber" in bridge_text
            and publisher_import_absent,
            "path": str(bridge_path),
            "subscriber_import_present": "ChannelSubscriber" in bridge_text,
            "publisher_import_absent": publisher_import_absent,
        },
    }

    software_ready = all(item.get("ok") is True for item in checks.values())
    live_host_ready = software_ready and not is_wsl and network_link_ready
    result = {
        "ready": live_host_ready,
        "software_ready": software_ready,
        "live_host_ready": live_host_ready,
        "host_mode": "WSL" if is_wsl else "LINUX",
        "network_link_ready": network_link_ready,
        "mode": "READ_ONLY",
        "checks": checks,
        "notes": [
            "This preflight does not connect to the robot.",
            "WSL may be used for software preparation but is not treated as a field-ready live DDS host.",
            "Robot access still requires explicit university authorization.",
            "Live capture must use the Elaris subscriber-only bridge.",
        ],
    }

    print(json.dumps(result, indent=2, sort_keys=True))
    return 0 if software_ready else 2


if __name__ == "__main__":
    raise SystemExit(main())
