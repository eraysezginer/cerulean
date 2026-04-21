#!/usr/bin/env bash
# =============================================================================
# DigitalOcean droplet (Ubuntu) — Cerulean (Next.js) için hazırlık
# Kullanım (sunucuda, root veya sudo yetkili kullanıcı ile):
#   chmod +x droplet-setup.sh && sudo ./droplet-setup.sh
#
# ÖNCE: Bu dosyayı makinenize indirip sunucuya atın, örn:
#   scp scripts/droplet-setup.sh root@SUNUCU_IP:/root/
# Sonra SSH ile bağlanıp yukarıdaki komutu çalıştırın.
# =============================================================================
set -euo pipefail

echo "==> Sistem güncelleniyor..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get upgrade -y

echo "==> Temel paketler (git, curl, nginx, certbot)..."
apt-get install -y git curl nginx ufw

echo "==> Node.js 20 LTS (NodeSource)..."
if ! command -v node >/dev/null 2>&1 || [[ "$(node -v | cut -d. -f1 | tr -d v)" -lt 18 ]]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
echo "Node: $(node -v) | npm: $(npm -v)"

echo "==> Firewall (SSH + HTTP + HTTPS)..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

APP_USER="${DEPLOY_USER:-cerulean}"
APP_DIR="/home/${APP_USER}/cerulean"

echo "==> Kullanıcı: ${APP_USER}"
if ! id -u "${APP_USER}" >/dev/null 2>&1; then
  adduser --disabled-password --gecos "" "${APP_USER}"
fi
mkdir -p "${APP_DIR}"
chown -R "${APP_USER}:${APP_USER}" "/home/${APP_USER}"

echo ""
echo "-------------------------------------------------------------------"
echo "SUNUCU HAZIR (Node + nginx + firewall)."
echo "Sonraki adımlar — bunları ${APP_USER} ile veya kendi kullanıcınızla yapın:"
echo ""
echo "1) Projeyi sunucuya alın:"
echo "   sudo rm -rf ${APP_DIR}"
echo "   sudo -u ${APP_USER} git clone https://github.com/eraysezginer/cerulean.git ${APP_DIR}"
echo "   (Repo özel ise: deploy key veya GitHub PAT gerekir.)"
echo ""
echo "2) Derleyin:"
echo "   cd ${APP_DIR} && sudo -u ${APP_USER} npm ci && sudo -u ${APP_USER} npm run build"
echo ""
echo "3) systemd ile Next çalıştırın:"
echo "   sudo cp ${APP_DIR}/scripts/cerulean.service /etc/systemd/system/"
echo "   sudo systemctl daemon-reload && sudo systemctl enable --now cerulean"
echo ""
echo "4) Nginx önü yüzü için scripts/nginx-cerulean.conf içeriğini /etc/nginx/sites-enabled/ altına koyun."
echo "-------------------------------------------------------------------"
