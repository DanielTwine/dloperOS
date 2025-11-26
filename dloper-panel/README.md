# Dloper Panel

Express-based admin UI serving static HTML/JS from `public/`.

Features:
- System overview (CPU load, memory, uptime)
- App management (list Docker containers; start/stop/restart)
- File browser rooted at `FILE_ROOT` (default `/opt/dloper/data`)
- Tailscale status stub
- OS updates trigger (runs `apt-get update && upgrade`)

Run locally:
```bash
cd dloper-panel
npm install
npm start
# visit http://localhost:4173
```

In compose, panel is reachable via `http://dloper.local/panel` (proxied by Caddy).
