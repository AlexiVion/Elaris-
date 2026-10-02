#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

IFACE="${1:-}"
if [[ -z "$IFACE" ]]; then
  echo "Usage: scripts/field-kit/preflight_live_linux.sh <network-interface>"
  exit 2
fi

echo "=============================================="
echo "ELARIS SIGLO 21 FIELD KIT — LIVE PREFLIGHT"
echo "=============================================="

if [[ "$(uname -s)" != "Linux" ]]; then
  echo "FAIL: live preflight currently targets Linux."
  exit 2
fi

for cmd in node pnpm python3 git; do
  if command -v "$cmd" >/dev/null 2>&1; then
    echo "PASS: $cmd -> $(command -v "$cmd")"
  else
    echo "FAIL: missing command $cmd"
    exit 2
  fi
done

if [[ -z "${ELARIS_UNITREE_PYTHON:-}" ]]; then
  echo "FAIL: ELARIS_UNITREE_PYTHON is not set."
  echo "Run scripts/field-kit/setup_unitree_linux.sh first."
  exit 2
fi

if [[ ! -x "$ELARIS_UNITREE_PYTHON" ]]; then
  echo "FAIL: ELARIS_UNITREE_PYTHON is not executable: $ELARIS_UNITREE_PYTHON"
  exit 2
fi

if ip link show "$IFACE" >/dev/null 2>&1; then
  echo "PASS: interface exists -> $IFACE"
else
  echo "FAIL: interface not found -> $IFACE"
  ip -brief link || true
  exit 2
fi

if [[ -n "${ELARIS_EDGE_PASSPHRASE:-}" ]]; then
  echo "PASS: ELARIS_EDGE_PASSPHRASE is set in this shell"
else
  echo "WARN: ELARIS_EDGE_PASSPHRASE is not set yet"
fi

echo ""
echo "Running Elaris doctor (NO ROBOT CONNECTION)..."
pnpm edge doctor-unitree --interface "$IFACE"

echo ""
echo "Running replay validation..."
if [[ -z "${ELARIS_EDGE_PASSPHRASE:-}" ]]; then
  export ELARIS_EDGE_PASSPHRASE="FIELD-KIT-PREFLIGHT-SYNTHETIC-ONLY"
fi

PREV_ROOT="$ROOT_DIR/.field-kit/preflight-captures"
mkdir -p "$PREV_ROOT"
pnpm edge capture-replay \
  --fixture apps/edge-collector/fixtures/unitree-g1-synthetic.json \
  --robot-id PREFLIGHT-G1 \
  --purpose field-kit-preflight \
  --root "$PREV_ROOT"

echo ""
echo "FIELD KIT PREFLIGHT COMPLETE"
echo "No robot connection or command was attempted."
