#!/usr/bin/env python3
"""
Elaris Unitree G1 SDK2 read-only bridge.

Security boundary:
- imports ChannelSubscriber only;
- never imports ChannelPublisher;
- subscribes only to rt/lowstate;
- does not emit wireless-remote bytes, camera, microphone or commands;
- rate-limits exported state for data minimization;
- writes newline-delimited JSON to stdout for the local Edge Collector.
"""

import argparse
import json
import signal
import sys
import time

from unitree_sdk2py.core.channel import ChannelFactoryInitialize, ChannelSubscriber
from unitree_sdk2py.idl.unitree_hg.msg.dds_ import LowState_

CHANNEL = "rt/lowstate"
RUNNING = True
MIN_INTERVAL_NS = 50_000_000
LAST_EMIT_NS = 0
CALLBACK_SEQUENCE = 0
EMITTED_SEQUENCE = 0


def safe_list(value):
    try:
        return list(value)
    except Exception:
        return []


def scalar(value, fallback=0):
    try:
        return value.item()
    except Exception:
        return value if isinstance(value, (int, float, bool)) else fallback


def motor_to_json(motor):
    return {
        "q": scalar(getattr(motor, "q", 0.0), 0.0),
        "dq": scalar(getattr(motor, "dq", 0.0), 0.0),
        "ddq": scalar(getattr(motor, "ddq", 0.0), 0.0),
        "tau_est": scalar(getattr(motor, "tau_est", 0.0), 0.0),
        "temperature": [
            scalar(v, 0) for v in safe_list(getattr(motor, "temperature", []))
        ],
        "vol": scalar(getattr(motor, "vol", 0.0), 0.0),
        "motorstate": scalar(getattr(motor, "motorstate", 0), 0),
    }


def imu_to_json(imu):
    return {
        "rpy": [scalar(v, 0.0) for v in safe_list(getattr(imu, "rpy", []))],
        "gyroscope": [
            scalar(v, 0.0) for v in safe_list(getattr(imu, "gyroscope", []))
        ],
    }


def emit(message):
    sys.stdout.write(json.dumps(message, separators=(",", ":")) + "\n")
    sys.stdout.flush()


def handle_lowstate(msg):
    global LAST_EMIT_NS, CALLBACK_SEQUENCE, EMITTED_SEQUENCE

    CALLBACK_SEQUENCE += 1
    observed_unix_ns = time.time_ns()
    observed_monotonic_ns = time.monotonic_ns()
    if observed_monotonic_ns - LAST_EMIT_NS < MIN_INTERVAL_NS:
        return
    LAST_EMIT_NS = observed_monotonic_ns
    EMITTED_SEQUENCE += 1

    payload = {
        "mode_pr": scalar(getattr(msg, "mode_pr", 0), 0),
        "mode_machine": scalar(getattr(msg, "mode_machine", 0), 0),
        "tick": scalar(getattr(msg, "tick", 0), 0),
        "imu_state": imu_to_json(getattr(msg, "imu_state", None)),
        "motor_state": [
            motor_to_json(motor)
            for motor in safe_list(getattr(msg, "motor_state", []))
        ],
    }

    emit({
        "type": "frame",
        "channel": CHANNEL,
        "timestamp": str(observed_unix_ns),
        "observedAtUnixNs": str(observed_unix_ns),
        "observedAtMonotonicNs": str(observed_monotonic_ns),
        "callbackSequence": CALLBACK_SEQUENCE,
        "emittedSequence": EMITTED_SEQUENCE,
        "payload": payload,
    })


def stop(_signum, _frame):
    global RUNNING
    RUNNING = False


def main():
    global MIN_INTERVAL_NS

    parser = argparse.ArgumentParser()
    parser.add_argument("--interface", required=True)
    parser.add_argument("--sample-hz", type=float, default=20.0)
    args = parser.parse_args()

    if args.sample_hz <= 0 or args.sample_hz > 100:
        raise ValueError("--sample-hz must be > 0 and <= 100")

    MIN_INTERVAL_NS = int(1_000_000_000 / args.sample_hz)

    signal.signal(signal.SIGTERM, stop)
    signal.signal(signal.SIGINT, stop)

    try:
        ChannelFactoryInitialize(0, args.interface)
        subscriber = ChannelSubscriber(CHANNEL, LowState_)
        subscriber.Init(handle_lowstate, 10)

        emit({
            "type": "ready",
            "channel": CHANNEL,
            "messageType": "unitree_hg.msg.dds_.LowState_",
        })

        while RUNNING:
            time.sleep(0.25)

        try:
            subscriber.Close()
        except Exception:
            pass
    except Exception as exc:
        emit({"type": "error", "message": str(exc)})
        raise


if __name__ == "__main__":
    main()
