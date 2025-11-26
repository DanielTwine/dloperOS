#!/bin/bash
set -e

# Install dependencies and systemd units inside the image
install -m 644 files/etc/systemd/system/dloper-compose.service ${ROOTFS_DIR}/etc/systemd/system/dloper-compose.service

on_chroot <<'EOFCHROOT'
apt-get update
apt-get install -y docker.io docker-compose-plugin curl
curl -fsSL https://tailscale.com/install.sh | sh
systemctl enable docker
systemctl enable dloper-compose.service
EOFCHROOT
