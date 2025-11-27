# Dloper OS Installer

Build a Raspberry Pi OS Lite image with DloperOS baked in using [pi-gen](https://github.com/RPi-Distro/pi-gen).

## What the custom stage does
- Installs Git, Python 3 + venv, pip, Docker, Node.js/npm, and Nginx in the target image.
- Clones `https://github.com/DanielTwine/dloperOS.git` to `/home/pi/dloperOS`.
- Runs `dloper-os-pro/scripts/install.sh` to create the backend virtualenv and build the frontend.
- Installs and enables `dloper-backend.service` (uvicorn on `0.0.0.0:8000`).
- Installs and enables an Nginx site that serves the built frontend and proxies `/api/` to the backend.

## Prereqs
- Linux build host (Debian/Ubuntu recommended; macOS is not supported for pi-gen).
- System packages: `git coreutils quilt parted qemu-user-static debootstrap zerofree zip dosfstools bsdtar libcap2-bin`.
- Internet access (apt, pip, npm, and GitHub clone).
- A clone of `https://github.com/RPi-Distro/pi-gen.git` inside this repo at `./pi-gen` (or set `PI_GEN_DIR` to an alternate path).

## Build
```bash
# From the repo root
sudo apt-get install git coreutils quilt parted qemu-user-static debootstrap zerofree zip dosfstools bsdtar libcap2-bin
git clone https://github.com/RPi-Distro/pi-gen.git  # clones into ./pi-gen

cd installer
# Optional: EDITION=pro|standard|edu, PI_GEN_DIR=/path/to/pi-gen
./build.sh
```

- The script defaults to `EDITION=pro`, runs pi-gen with `stage0 stage1 stage2 stage-dloper`, and enables QEMU for cross-builds.
- Final image artifacts are written to `PI_GEN_DIR/deploy/` (e.g., `pi-gen/deploy/dloper-os-pro.img` and compressed variants).
