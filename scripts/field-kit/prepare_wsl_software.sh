#!/usr/bin/env bash
set -euo pipefail

# Elaris WSL software preparation.
# This prepares SDK/software only. It does not connect to a robot and WSL is
# intentionally NOT treated as a field-ready live DDS host.

echo "=============================================="
echo "ELARIS UNITREE WSL SOFTWARE PREPARATION"
echo "=============================================="

if ! grep -qi microsoft /proc/sys/kernel/osrelease 2>/dev/null && ! grep -qi microsoft /proc/version 2>/dev/null; then
  echo "ERROR: this script is intended for WSL."
  exit 2
fi

sudo apt-get update
sudo apt-get install -y \
  git \
  python3 \
  python3-venv \
  python3-pip \
  build-essential \
  cmake \
  iproute2

# Do not install Ubuntu's separate npm package when NodeSource nodejs is
# configured: NodeSource's nodejs package conflicts with Ubuntu's npm package.
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js not found; installing the configured nodejs package."
  sudo apt-get install -y nodejs
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "ERROR: Node.js is installed but npm is unavailable."
  echo "The current Elaris WSL setup expects a Node distribution that includes npm."
  exit 2
fi

if ! command -v pnpm >/dev/null 2>&1; then
  sudo npm install -g pnpm@9.15.4
fi

echo "Node: $(node --version)"
echo "npm: $(npm --version)"
echo "pnpm: $(pnpm --version)"

FIELD_REPO="${ELARIS_WSL_REPO:-$HOME/elaris-field}"

echo ""
echo "=============================================="
echo "PREPARING LINUX-NATIVE ELARIS COPY"
echo "=============================================="

if [[ ! -d "$FIELD_REPO/.git" ]]; then
  git clone --branch feat/siglo21-field-kit-v0 https://github.com/AlexiVion/Elaris-.git "$FIELD_REPO"
else
  git -C "$FIELD_REPO" fetch origin
  git -C "$FIELD_REPO" checkout feat/siglo21-field-kit-v0
  git -C "$FIELD_REPO" pull --ff-only
fi

cd "$FIELD_REPO"

echo ""
echo "=============================================="
echo "INSTALLING UNITREE SDK2 SOFTWARE ENVIRONMENT"
echo "=============================================="

bash scripts/field-kit/setup_unitree_linux.sh

source "$FIELD_REPO/.field-kit/env.sh"

echo ""
echo "=============================================="
echo "WSL NETWORK INTERFACES"
echo "=============================================="

ip -brief link

IFACE="${ELARIS_UNITREE_IFACE:-}"
if [[ -z "$IFACE" ]]; then
  IFACE="$(python3 - <<'PY'
import socket
for _, name in socket.if_nameindex():
    if name != "lo":
        print(name)
        break
PY
)"
fi

if [[ -z "$IFACE" ]]; then
  echo "ERROR: no non-loopback WSL interface found."
  exit 2
fi

echo ""
echo "Selected WSL interface: $IFACE"

echo ""
echo "=============================================="
echo "INSTALLING ELARIS DEPENDENCIES"
echo "=============================================="

pnpm install

echo ""
echo "=============================================="
echo "ELARIS UNITREE DOCTOR"
echo "=============================================="

pnpm edge doctor-unitree --interface "$IFACE"

echo ""
echo "=============================================="
echo "WSL SOFTWARE PREPARATION COMPLETE"
echo "=============================================="
echo "Expected status on WSL:"
echo "  SOFTWARE READY: YES"
echo "  LIVE ROBOT HOST READY: NO"
echo ""
echo "No robot connection was attempted."
