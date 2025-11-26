#!/usr/bin/env bash
set -euo pipefail

EDITION=${EDITION:-edu} # standard|pro|edu
IMAGE_NAME="dloper-os-${EDITION}"

if [[ ! -d ../pi-gen ]]; then
  echo "Run from inside pi-gen directory (../pi-gen present)." >&2
  exit 1
fi

# Configure pi-gen
export IMG_NAME="$IMAGE_NAME"
export TARGET_HOSTNAME="dloper"
export LOCALE_DEFAULT="en_GB.UTF-8"
export KEYBOARD_KEYMAP="gb"
export TIMEZONE_DEFAULT="Europe/London"

# Copy custom stage
rsync -av "$(pwd)/../installer/stage-dloper/" ./stage-dloper/

# Write edition flag
mkdir -p stage-dloper/files/etc/dloper
echo "$EDITION" > stage-dloper/files/etc/dloper/edition

echo "Starting pi-gen build for $IMAGE_NAME"
./build.sh
