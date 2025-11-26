#!/usr/bin/env bash
set -e

REPO_ROOT=$(cd "$(dirname "$0")/.." && pwd)
VENV_DIR="$REPO_ROOT/.venv"
source "$VENV_DIR/bin/activate"

uvicorn backend.app.main:app --reload --port 8000 --app-dir "$REPO_ROOT"
