#!/usr/bin/env bash
set -euo pipefail

# Elaris Siglo 21 Field Kit V0
# Prepare a local Unitree SDK2 Python environment on Linux.
# This script does NOT connect to a robot or enable command publishing.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
FIELD_DIR="${ELARIS_FIELD_DIR:-$ROOT_DIR/.field-kit}"
VENV_DIR="$FIELD_DIR/unitree-venv"
SDK_DIR="$FIELD_DIR/vendor/unitree_sdk2_python"

if [[ "$(uname -s)" != "Linux" ]]; then
  echo "ERROR: live Unitree Field Kit setup currently targets Linux."
  echo "Use Windows for replay/development, and Linux for the live SDK2/DDS path."
  exit 2
fi

for cmd in python3 git; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "ERROR: required command not found: $cmd"
    exit 2
  fi
done

PY_VERSION="$(python3 - <<'PY'
import sys
print(f"{sys.version_info.major}.{sys.version_info.minor}")
raise SystemExit(0 if sys.version_info >= (3, 8) else 2)
PY
)" || {
  echo "ERROR: Python >= 3.8 is required."
  exit 2
}

echo "Preparing Elaris Unitree SDK2 environment"
echo "Python: $PY_VERSION"
echo "Field dir: $FIELD_DIR"

mkdir -p "$FIELD_DIR/vendor"

if [[ ! -d "$VENV_DIR" ]]; then
  python3 -m venv "$VENV_DIR"
fi

# shellcheck disable=SC1091
source "$VENV_DIR/bin/activate"
python -m pip install --upgrade pip setuptools wheel

if [[ ! -d "$SDK_DIR/.git" ]]; then
  git clone --depth 1 https://github.com/unitreerobotics/unitree_sdk2_python.git "$SDK_DIR"
else
  echo "Unitree SDK2 Python already cloned: $SDK_DIR"
fi

set +e
python -m pip install -e "$SDK_DIR"
INSTALL_CODE=$?
set -e

if [[ $INSTALL_CODE -ne 0 ]]; then
  cat <<'EOF'

Unitree SDK2 Python installation failed.

The official SDK documents a common CycloneDDS setup issue. If the error says
CycloneDDS cannot be located, follow the official unitree_sdk2_python README
and install/build CycloneDDS 0.10.x, then rerun this script.

No robot connection was attempted.
EOF
  exit $INSTALL_CODE
fi

python - <<'PY'
import unitree_sdk2py
import cyclonedds
print("unitree_sdk2py import: OK")
print("cyclonedds import: OK")
PY

cat <<EOF

FIELD KIT PYTHON READY

Use this interpreter for Elaris live Unitree commands:

  export ELARIS_UNITREE_PYTHON="$VENV_DIR/bin/python"

Then run:

  pnpm edge doctor-unitree --interface <iface>

No robot connection has been attempted.
EOF
