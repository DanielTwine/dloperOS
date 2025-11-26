#!/usr/bin/env bash
set -e

REPO_ROOT=$(cd "$(dirname "$0")/.." && pwd)
cd "$REPO_ROOT/frontend"

npm run dev -- --host --port 5173
