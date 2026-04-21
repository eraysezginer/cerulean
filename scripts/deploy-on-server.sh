#!/usr/bin/env bash
# Sunucuda (root): bash scripts/deploy-on-server.sh
# Proje: /home/cerulean/cerulean
set -euo pipefail
APP=/home/cerulean/cerulean
cd "$APP"

echo "==> Node / npm"
command -v node && node -v
command -v npm && npm -v

echo "==> Bağımlılıklar + production build"
sudo -u cerulean rm -rf node_modules .next
sudo -u cerulean npm ci
sudo -u cerulean npm run build

test -f "$APP/.next/BUILD_ID" || { echo "HATA: .next yok"; exit 1; }
test -f "$APP/node_modules/next/dist/bin/next" || { echo "HATA: next binary yok"; exit 1; }

echo "==> systemd"
sudo cp "$APP/scripts/cerulean.service" /etc/systemd/system/cerulean.service
sudo systemctl daemon-reload
sudo systemctl restart cerulean

echo "==> 3 sn bekleyip test (Next ayağa kalksın)"
sleep 3
sudo systemctl status cerulean --no-pager || true
curl -sS -o /dev/null -w "HTTP %{http_code}\n" http://127.0.0.1:3000/ || true
curl -sS -o /dev/null -w "HTTP %{http_code} /dashboard\n" http://127.0.0.1:3000/dashboard || true

echo "==> Son 30 log satırı"
sudo journalctl -u cerulean -n 30 --no-pager
