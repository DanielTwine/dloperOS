This pi-gen stage customises the Raspberry Pi OS Lite image for DloperOS Pro. It:

- Installs Git, Python tooling, Docker, Node.js, and Nginx.
- Clones https://github.com/DanielTwine/dloperOS.git into `/home/pi/dloperOS`.
- Runs `dloper-os-pro/scripts/install.sh` to set up the backend virtualenv and build the frontend.
- Installs a `dloper-backend.service` systemd unit to run uvicorn on boot.
- Installs an Nginx site that serves the built frontend from `/home/pi/dloperOS/dloper-os-pro/frontend/dist` and proxies `/api/` to `127.0.0.1:8000`.
