#!/usr/bin/env bash
set -euo pipefail

# Elaris Siglo 21 Field Kit V0
# Prepare a local Unitree SDK2 Python environment on Linux.
# This script does NOT connect to a robot or enable command publishing.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
FIELD_DIR="${ELARIS_FIELD_DIR:-$ROOT_DIR/.field-kit}"
VENV_DIR="$FIELD_DIR/unitree-venv"
SDK_DIR="$FIELD_DIR/vendor/unitree_sdk2_python"
DDS_DIR="$FIELD_DIR/vendor/cyclonedds"
DDS_INSTALL_DIR="$DDS_DIR/install"
ENV_FILE="$FIELD_DIR/env.sh"

if [[ "$(uname -s)" != "Linux" ]]; then
  echo "ERROR: live Unitree Field Kit setup currently targets Linux."
  echo "Use Windows for replay/development, and Linux for the live SDK2/DDS path."
  exit 2
fi

for cmd in python3 git cmake; do
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

if [[ ! -d "$DDS_DIR/.git" ]]; then
  echo "Cloning CycloneDDS 0.10.2..."
  git clone --branch 0.10.2 --depth 1 https://github.com/eclipse-cyclonedds/cyclonedds.git "$DDS_DIR"
else
  echo "CycloneDDS already cloned: $DDS_DIR"
  git -C "$DDS_DIR" fetch --tags --force
  git -C "$DDS_DIR" checkout --force 0.10.2
fi

echo "Building CycloneDDS 0.10.2..."
mkdir -p "$DDS_DIR/build" "$DDS_INSTALL_DIR"
cmake -S "$DDS_DIR" -B "$DDS_DIR/build" \
  -DCMAKE_BUILD_TYPE=Release \
  -DCMAKE_INSTALL_PREFIX="$DDS_INSTALL_DIR" \
  -DBUILD_EXAMPLES=OFF \
  -DBUILD_TESTING=OFF
cmake --build "$DDS_DIR/build" --target install --parallel

export CYCLONEDDS_HOME="$DDS_INSTALL_DIR"
if [[ -n "${CMAKE_PREFIX_PATH:-}" ]]; then
  export CMAKE_PREFIX_PATH="$CYCLONEDDS_HOME:$CMAKE_PREFIX_PATH"
else
  export CMAKE_PREFIX_PATH="$CYCLONEDDS_HOME"
fi
if [[ -n "${LD_LIBRARY_PATH:-}" ]]; then
  export LD_LIBRARY_PATH="$CYCLONEDDS_HOME/lib:$LD_LIBRARY_PATH"
else
  export LD_LIBRARY_PATH="$CYCLONEDDS_HOME/lib"
fi

echo "CycloneDDS home: $CYCLONEDDS_HOME"

if [[ ! -d "$SDK_DIR/.git" ]]; then
  git clone --depth 1 https://github.com/unitreerobotics/unitree_sdk2_python.git "$SDK_DIR"
else
  echo "Unitree SDK2 Python already cloned: $SDK_DIR"
fi

echo "Installing Unitree SDK2 Python against local CycloneDDS..."
python -m pip install -e "$SDK_DIR"

python - <<'PY'
import unitree_sdk2py
import cyclonedds
print("unitree_sdk2py import: OK")
print("cyclonedds import: OK")
PY

cat > "$ENV_FILE" <<EOF
#!/usr/bin/env bash
export ELARIS_UNITREE_PYTHON="$VENV_DIR/bin/python"
export CYCLONEDDS_HOME="$DDS_INSTALL_DIR"
export CMAKE_PREFIX_PATH="$DDS_INSTALL_DIR"
export LD_LIBRARY_PATH="$DDS_INSTALL_DIR/lib:\${LD_LIBRARY_PATH:-}"
EOF
chmod 600 "$ENV_FILE"

cat <<EOF

FIELD KIT PYTHON READY

Environment file written to:
  $ENV_FILE

For a new shell, load it with:
  source "$ENV_FILE"

Then run:
  pnpm edge doctor-unitree --interface <iface>

No robot connection has been attempted.
EOF
