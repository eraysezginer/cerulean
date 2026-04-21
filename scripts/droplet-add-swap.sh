#!/usr/bin/env bash
# Küçük RAM'li droplet'lerde npm ci / build OOM olmasın diye 2G swap (bir kez çalıştırın)
set -euo pipefail
if [[ -f /swapfile ]]; then
  echo "Swap zaten var."
  swapon --show
  exit 0
fi
fallocate -l 2G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=2048
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
grep -q '/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
echo "OK. swapon:"
swapon --show
free -h
