#!/usr/bin/env bash
# Lokal Mini App + (ixtiyoriy) ngrok + Menu Button + bot
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -f .env ]]; then
  echo "❌ .env yo'q. Avval: cp .env.example .env"
  exit 1
fi

# Frontend server
if ! curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8080/ | grep -q 200; then
  echo "▶ Frontend: http://localhost:8080"
  (cd frontend && python3 -m http.server 8080) &
  sleep 1
fi

# ngrok — HTTPS (Telegram Menu Button uchun shart)
if command -v ngrok &>/dev/null; then
  echo "▶ ngrok ishga tushirilmoqda..."
  pkill -f "ngrok http 8080" 2>/dev/null || true
  ngrok http 8080 --log=stdout > /tmp/hardoil-ngrok.log 2>&1 &
  sleep 3
  URL=$(curl -s http://127.0.0.1:4040/api/tunnels 2>/dev/null | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    for t in d.get('tunnels', []):
        u = t.get('public_url', '')
        if u.startswith('https://'):
            print(u.rstrip('/') + '/')
            break
except Exception:
    pass
" 2>/dev/null || true)
  if [[ -n "$URL" ]]; then
    echo "✅ HTTPS: $URL"
    if grep -q '^WEBAPP_URL=' .env; then
      sed -i '' "s|^WEBAPP_URL=.*|WEBAPP_URL=$URL|" .env 2>/dev/null || \
        sed -i "s|^WEBAPP_URL=.*|WEBAPP_URL=$URL|" .env
    else
      echo "WEBAPP_URL=$URL" >> .env
    fi
    source .venv/bin/activate 2>/dev/null || true
    pip install -q -r bot/requirements.txt 2>/dev/null || true
    python bot/set_menu_button.py
  else
    echo "⚠️ ngrok URL olinmadi. Qo'lda: ngrok http 8080"
  fi
else
  echo "⚠️ ngrok topilmadi. O'rnatish: brew install ngrok"
  echo "   Yoki BotFather → Menu Button → Web App → HTTPS URL"
fi

echo "▶ Bot ishga tushmoqda..."
source .venv/bin/activate 2>/dev/null || { python3 -m venv .venv && source .venv/bin/activate; }
pip install -q -r bot/requirements.txt
python bot/main.py
