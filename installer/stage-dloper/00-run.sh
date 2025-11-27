#!/bin/bash
set -euo pipefail

: "${ROOTFS_DIR:?ROOTFS_DIR is not set}"

# Drop service + nginx config into the target rootfs
install -m 644 -D files/etc/systemd/system/dloper-backend.service "${ROOTFS_DIR}/etc/systemd/system/dloper-backend.service"
install -m 644 -D files/etc/nginx/sites-available/dloper "${ROOTFS_DIR}/etc/nginx/sites-available/dloper"

on_chroot <<'EOFCHROOT'
set -euo pipefail
export DEBIAN_FRONTEND=noninteractive

apt-get update
apt-get install -y --no-install-recommends \
  git \
  python3 python3-venv python3-pip \
  nginx \
  docker.io \
  nodejs npm

systemctl enable docker
systemctl enable nginx

apt-get clean
rm -rf /var/lib/apt/lists/*
EOFCHROOT

on_chroot <<'EOFCHROOT'
set -euo pipefail

if id pi >/dev/null 2>&1; then
  su - pi -c 'if [ ! -d "$HOME/dloperOS/.git" ]; then git clone --depth 1 https://github.com/DanielTwine/dloperOS.git "$HOME/dloperOS"; else cd "$HOME/dloperOS" && git pull --ff-only; fi'
  su - pi -c 'cd "$HOME/dloperOS/dloper-os-pro" && ./scripts/install.sh'
else
  echo "User pi not found; skipping DloperOS clone" >&2
fi

ln -sf /etc/nginx/sites-available/dloper /etc/nginx/sites-enabled/dloper
rm -f /etc/nginx/sites-enabled/default

systemctl enable dloper-backend.service
EOFCHROOT
