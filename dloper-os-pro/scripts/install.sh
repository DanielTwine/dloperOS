#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT=$(cd "$(dirname "$0")/.." && pwd)
BACKEND_DIR="$REPO_ROOT/backend"
FRONTEND_DIR="$REPO_ROOT/frontend"
VENV_DIR="$BACKEND_DIR/.venv"

python3 -m venv "$VENV_DIR"
"$VENV_DIR/bin/python" -m pip install --upgrade pip
"$VENV_DIR/bin/pip" install --no-cache-dir -r "$BACKEND_DIR/requirements.txt"

echo "[dloper-os-pro] Backend virtualenv ready at $VENV_DIR"

cd "$FRONTEND_DIR"
npm ci
npm run build

echo "[dloper-os-pro] Frontend built at $FRONTEND_DIR/dist"
