#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

IFACE="${1:-}"
if [[ -z "$IFACE" ]]; then
  echo "Usage: scripts/field-kit/run_field_session_dry_run.sh <active-multicast-interface>"
  exit 2
fi

if [[ -z "${ELARIS_EDGE_PASSPHRASE:-}" ]]; then
  echo "FAIL: ELARIS_EDGE_PASSPHRASE must be set for the dry run."
  echo "Use a local dry-run secret. Never commit it or pass it as a CLI argument."
  exit 2
fi

if (( ${#ELARIS_EDGE_PASSPHRASE} < 12 )); then
  echo "FAIL: ELARIS_EDGE_PASSPHRASE must be at least 12 characters."
  echo "Choose a longer local dry-run secret and retry."
  exit 2
fi

echo "=================================================="
echo "ELARIS FIELD SESSION PACK V1 — DRY RUN"
echo "=================================================="
echo "LIVE ROBOT CONNECTION: NOT ATTEMPTED"
echo "LIVE INSPECT: NOT RUN"
echo "LIVE CAPTURE: NOT RUN"
echo "EXPORT APPROVAL: WILL NOT BE RUN"
echo ""

echo "Step 1/3 — Linux field-host preflight"
bash scripts/field-kit/preflight_live_linux.sh "$IFACE"

DRY_ROOT="$ROOT_DIR/.field-kit/field-session-dry-run"
mkdir -p "$DRY_ROOT"

echo ""
echo "Step 2/3 — Synthetic replay capture"
pnpm edge capture-replay \
  --fixture apps/edge-collector/fixtures/unitree-g1-synthetic.json \
  --robot-id DRY-RUN-G1 \
  --purpose field-session-pack-v1-dry-run \
  --root "$DRY_ROOT"

CAP_DIR="$(
  find "$DRY_ROOT" -mindepth 1 -maxdepth 1 -type d -name 'CAP-*' -printf '%T@ %p\n' \
    | sort -nr \
    | head -n 1 \
    | cut -d' ' -f2-
)"

if [[ -z "$CAP_DIR" || ! -d "$CAP_DIR" ]]; then
  echo "FAIL: could not locate the synthetic capture directory."
  exit 2
fi

echo ""
echo "Step 3/3 — Local review"
REVIEW_FILE="$ROOT_DIR/.field-kit/field-session-dry-run-review.txt"
pnpm edge review "$CAP_DIR" --sample 5 | tee "$REVIEW_FILE"

grep -Fq "State: FINALIZED" "$REVIEW_FILE"
grep -Fq "Classification: SENSITIVE" "$REVIEW_FILE"
grep -Fq "Export approval: NOT_APPROVED" "$REVIEW_FILE"

echo ""
echo "=================================================="
echo "FIELD SESSION DRY RUN: PASS"
echo "Synthetic capture: $CAP_DIR"
echo "State: FINALIZED"
echo "Classification: SENSITIVE"
echo "Export approval: NOT_APPROVED"
echo "No live robot connection or command was attempted."
echo "=================================================="
