# Base OS setup

Run on a fresh Raspberry Pi OS Lite (arm64) to prepare for Dloper OS:

```bash
sudo ./setup.sh
# clone or copy this repo into /opt/dloper
cd /opt/dloper
cp docker-compose/.env.example docker-compose/.env
cp classconnect/backend/.env.example classconnect/backend/.env
sudo docker compose -f docker-compose/docker-compose.yml up --build -d
```

The script installs Docker, Compose, and Tailscale.
