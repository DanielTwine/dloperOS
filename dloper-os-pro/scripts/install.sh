#!/usr/bin/env bash
set -e

REPO_ROOT=$(cd "$(dirname "$0")/.." && pwd)
VENV_DIR="$REPO_ROOT/.venv"

python3 -m venv "$VENV_DIR"
source "$VENV_DIR/bin/activate"
python -m pip install --upgrade pip
pip install -r "$REPO_ROOT/backend/requirements.txt"

echo "[dloper-os-pro] Python deps installed"

cd "$REPO_ROOT/frontend"
npm install

echo "[dloper-os-pro] Frontend deps installed"
