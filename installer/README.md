# Dloper OS Installer

Uses [pi-gen](https://github.com/RPi-Distro/pi-gen) to build a Raspberry Pi OS Lite image with Dloper services preloaded.

## Prereqs
- Debian/Ubuntu build host
- `git`, `qemu-user-static`, `binfmt-support`, `parted`, `kpartx`
- Internet access to fetch Raspberry Pi OS packages

## Build
```bash
sudo apt-get install git coreutils quilt parted qemu-user-static debootstrap zerofree zip dosfstools bsdtar libcap2-bin
sudo git clone https://github.com/RPi-Distro/pi-gen.git
cd pi-gen
# copy dloper custom stage
rsync -av ../installer/stage-dloper/ stage-dloper/
# set edition: standard | pro | edu
EDITION=edu ../installer/build.sh
```

`build.sh` configures:
- Docker + Compose
- Tailscale install
- Copies this repo into `/opt/dloper`
- Installs systemd unit to run `docker compose` on boot

Output `.img` lives in `pi-gen/deploy/`.
