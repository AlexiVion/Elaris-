#!/usr/bin/env python3
import argparse
import socket
import sys


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--group", required=True)
    parser.add_argument("--port", type=int, required=True)
    parser.add_argument("--interface-ip", required=True)
    parser.add_argument("--expect-token", required=True)
    parser.add_argument("--timeout", type=float, default=8.0)
    args = parser.parse_args()

    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM, socket.IPPROTO_UDP)
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    sock.bind(("", args.port))
    membership = socket.inet_aton(args.group) + socket.inet_aton(args.interface_ip)
    sock.setsockopt(socket.IPPROTO_IP, socket.IP_ADD_MEMBERSHIP, membership)
    sock.settimeout(args.timeout)

    try:
        while True:
            payload, sender = sock.recvfrom(4096)
            text = payload.decode("utf-8", errors="replace")
            if text == args.expect_token:
                print(f"PASS:{args.expect_token}:FROM:{sender[0]}:{sender[1]}", flush=True)
                return 0
    except socket.timeout:
        print("FAIL:TIMEOUT", flush=True)
        return 2
    finally:
        sock.close()


if __name__ == "__main__":
    raise SystemExit(main())
