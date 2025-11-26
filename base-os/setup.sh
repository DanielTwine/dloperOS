#!/usr/bin/env bash
set -euo pipefail

if [[ $EUID -ne 0 ]]; then
  echo "Run as root" && exit 1
fi

echo "Updating system..."
apt-get update && apt-get upgrade -y

echo "Installing Docker + Compose..."
apt-get install -y docker.io docker-compose-plugin
systemctl enable docker
systemctl start docker

echo "Installing Tailscale..."
curl -fsSL https://tailscale.com/install.sh | sh

mkdir -p /opt/dloper
chown -R pi:pi /opt/dloper || true

echo "Base OS setup complete. Place repo in /opt/dloper and run docker compose." 
