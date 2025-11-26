# Dloper OS Monorepo

This repo contains the full Dloper OS stack (Standard, PRO, EDU), ClassConnect (backend + frontend), Dloper Panel admin UI, container definitions, and installer scaffolding for Raspberry Pi 5 ("Local-M1").

## Contents
- `base-os/` – provisioning scripts for Raspberry Pi OS Lite with Docker, Compose, and Tailscale
- `classconnect/` – school platform backend (Fastify + Prisma + PostgreSQL) and frontend
- `dloper-os-standard/`, `dloper-os-pro/`, `dloper-os-edu/` – edition presets and first-boot wizard (EDU)
- `dloper-panel/` – local admin panel (system overview, app management, backups, network/Tailscale helpers)
- `docker-compose/` – ARM64-ready compose stack with reverse proxy
- `installer/` – pi-gen based image builder to produce `.img` for Standard/PRO/EDU
- `school-website/` – placeholder school site container

## Quick start (dev)
1. Install Docker + Docker Compose plugin on your host.
2. Copy `.env.example` files to `.env` where needed (ClassConnect backend, compose).
3. From repo root: `docker compose -f docker-compose/docker-compose.yml up --build`
4. Open `http://localhost` (panel), `http://localhost/classconnect` (frontend), and API under `/api`.

## Editions
- **Standard**: reverse-proxy + Dloper Panel + school website placeholder
- **PRO**: Standard + extra monitoring hooks (stubbed), ready for additional services
- **EDU**: Standard + ClassConnect backend/frontend + first-boot school setup wizard

Compose includes all services; disable undesired ones with `profiles` or remove from overrides. EDU wizard lives in `dloper-os-edu/wizard` and posts to ClassConnect for initial school + admin creation.

## Installer
The `installer/` scripts wrap pi-gen to produce an ARM64 Raspberry Pi OS Lite image with Docker, Compose, Tailscale, and this repo baked into `/opt/dloper`. See `installer/README.md` for steps.

## Security
Set strong `JWT_SECRET`, database credentials, and admin passwords in your `.env` files. Tailscale keys should be set via environment variables or interactive auth on first boot.

