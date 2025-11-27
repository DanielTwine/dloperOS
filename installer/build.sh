#!/usr/bin/env bash
# Build a Raspberry Pi OS image with the DloperOS Pro stage.
# Usage: from the repo root run `cd installer && ./build.sh`
# Environment:
#   EDITION=pro|standard|edu (default: pro)
#   PI_GEN_DIR=/path/to/pi-gen (default: ../pi-gen)
#   USE_QEMU=1 to build on non-ARM hosts (default: 1)

set -euo pipefail

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
REPO_ROOT=$(cd "$SCRIPT_DIR/.." && pwd)
PI_GEN_DIR=${PI_GEN_DIR:-"$REPO_ROOT/pi-gen"}

EDITION=${EDITION:-pro} # standard|pro|edu
IMAGE_NAME="dloper-os-${EDITION}"

if [[ ! -x "$PI_GEN_DIR/build.sh" ]]; then
  echo "pi-gen not found at $PI_GEN_DIR" >&2
  echo "Clone https://github.com/RPi-Distro/pi-gen.git and set PI_GEN_DIR if needed." >&2
  exit 1
fi

# Configure pi-gen
export IMG_NAME="$IMAGE_NAME"
export TARGET_HOSTNAME="dloper"
export LOCALE_DEFAULT="en_GB.UTF-8"
export KEYBOARD_KEYMAP="gb"
export TIMEZONE_DEFAULT="Europe/London"
export USE_QEMU="${USE_QEMU:-1}"

# Limit to lite + custom stage by default
export STAGE_LIST="${STAGE_LIST:-stage0 stage1 stage2 stage-dloper}"
export SKIP_STAGE3="${SKIP_STAGE3:-1}"
export SKIP_STAGE4="${SKIP_STAGE4:-1}"
export SKIP_STAGE5="${SKIP_STAGE5:-1}"

# Copy custom stage into pi-gen
rsync -a --delete "$SCRIPT_DIR/stage-dloper/" "$PI_GEN_DIR/stage-dloper/"

# Write edition flag
mkdir -p "$PI_GEN_DIR/stage-dloper/files/etc/dloper"
echo "$EDITION" > "$PI_GEN_DIR/stage-dloper/files/etc/dloper/edition"

echo "Starting pi-gen build for $IMAGE_NAME using $PI_GEN_DIR"

cd "$PI_GEN_DIR"
if [[ $EUID -ne 0 ]]; then
  sudo ./build.sh
else
  ./build.sh
fi
