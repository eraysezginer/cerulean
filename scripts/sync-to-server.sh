#!/usr/bin/env bash
# =============================================================================
# Mac / yerel: commit edilmiş kodu GitHub'a iter ve droplet'te pull + build + restart yapar.
#
# Önkoşul: ssh root@HOST (veya kullanıcın) parolasız çalışmalı — SSH anahtarı ekleyin:
#   ssh-copy-id root@46.101.155.36
#
# Kullanım (proje kökünden):
#   DEPLOY_HOST=1.2.3.4 npm run deploy:server
# veya (varsayılan host scripts içinde):
#   npm run deploy:server
#
# Sadece push, sunucuya dokunma:
#   SYNC_PUSH_ONLY=1 npm run deploy:server
# =============================================================================
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

HOST="${DEPLOY_HOST:-46.101.155.36}"
SSH_USER="${DEPLOY_SSH_USER:-root}"
REMOTE_APP="/home/cerulean/cerulean"
BRANCH="$(git branch --show-current)"

if [[ -n "$(git status --porcelain)" ]]; then
  echo ">>> HATA: Commit edilmemiş değişiklik var."
  echo "    Önce: git add -A && git commit -m \"mesaj\""
  echo "    Geçici atlamak için: SYNC_SKIP_DIRTY=1 npm run deploy:server"
  [[ "${SYNC_SKIP_DIRTY:-}" == "1" ]] || exit 1
fi

echo ">>> Dal: $BRANCH — push → origin"
git push origin "$BRANCH"

if [[ "${SYNC_PUSH_ONLY:-}" == "1" ]]; then
  echo ">>> SYNC_PUSH_ONLY=1 — sunucu adımı atlandı."
  exit 0
fi

echo ">>> Sunucu: $SSH_USER@$HOST — pull + install + build + restart"
ssh -o BatchMode=yes -o StrictHostKeyChecking=accept-new "${SSH_USER}@${HOST}" bash -s <<EOF
set -euo pipefail
cd ${REMOTE_APP}
# Sunucu = salt okunur deploy kopyası; remote ile birebir eşitle
sudo -u cerulean git fetch origin
sudo -u cerulean git checkout ${BRANCH}
sudo -u cerulean git reset --hard origin/${BRANCH}
sudo -u cerulean npm ci
sudo -u cerulean npm run build
sudo systemctl restart cerulean
sleep 3
curl -sS -o /dev/null -w "localhost HTTP %{http_code}\\n" http://127.0.0.1:3000/ || true
sudo systemctl is-active cerulean
EOF

echo ">>> Bitti. Tarayıcı: http://${HOST}/"
