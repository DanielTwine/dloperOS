# DloperOS Pro

Raspberry Pi 5–focused OS layer that bundles a FastAPI backend with a React + Tailwind control plane. It manages sites, SmartShare file links, Docker containers, system metrics, backups, and version/update stubs.

## Features
- Auth & Roles: JWT login, Owner/Admin/Viewer roles, default seed user `admin/admin123` (configurable).
- Websites: create site roots under `data/sites/<name>`, track domains + SSL flag, analytics counters.
- SmartShare: upload files to `data/files/<id>/`, optional passwords/limits/expiry, download analytics.
- Docker: list/start/stop/restart containers and launch simple templates (WordPress, DB, Node).
- System: live CPU/RAM/disk/temp/network polling for the Pi.
- Backups: zip up sites/files (or individual sites) into `data/backups/` with simple restore.
- Settings: update instance name/base URL/analytics toggle/token expiry via config.

## Stack
- **Backend:** FastAPI, PyJWT, psutil, Docker SDK (optional), YAML-based config under `config/`.
- **Frontend:** React (Vite + TypeScript) with TailwindCSS, Recharts, lucide-react icons.
- **Data/Config:** stored inside `dloper-os-pro/` only (`config/*.yaml`, `data/*`).

## Project layout
```
dloper-os-pro/
  backend/
    app/               # FastAPI app
  frontend/            # React + Vite dashboard
  config/              # YAML configs (system/users/websites/files)
  data/
    sites/ files/ backups/  # runtime data buckets
  scripts/             # helper scripts
  README.md
```

## Prerequisites
- Python 3.10+
- Node 18+ and npm
- (Optional) Docker Engine for the Docker UI endpoints

## Setup
```bash
cd dloper-os-pro
scripts/install.sh       # creates .venv, installs backend + frontend deps
```

## Run
Backend (FastAPI + uvicorn):
```bash
scripts/run-backend.sh   # serves at http://localhost:8000
```
Frontend (Vite dev server):
```bash
scripts/run-frontend.sh  # serves at http://localhost:5173
```

## API map (high level)
- `POST /api/auth/login` – JWT login; seed user `admin/admin123` is created automatically on first boot.
- `POST /api/auth/register`, `GET /api/auth/me`
- `GET/POST/PUT/DELETE /api/websites` – manage site roots and domains
- `GET/POST /api/files`, `POST /api/files/upload`, `POST /api/files/{id}/download`
- `GET/POST /api/docker/containers`, `POST /api/docker/templates`
- `GET /api/system/metrics`
- `GET/POST /api/backups`, `POST /api/backups/restore`
- `GET/PUT /api/settings`

## Config & data
- `config/system.yaml` – instance name/base URL, token expiry, auto-generated secret key on first run.
- `config/users.yaml` – users live here (seeded automatically if empty).
- `config/websites.yaml` / `config/files.yaml` – simple metadata stores for the UI.
- Data directories are created automatically (`data/sites`, `data/files`, `data/backups`).

## Notes
- The backend stubs analytics/backups/templates so you can extend with real NGINX/Caddy and storage later.
- Keep work inside `dloper-os-pro/`; other monorepo folders are untouched.
