#!/usr/bin/env bash
# Hardoil botni ishga tushirish (Mac)
cd "$(dirname "$0")"

if [ ! -d .venv ]; then
  echo "▶ .venv yaratilmoqda..."
  python3 -m venv .venv
fi

echo "▶ Kutubxonalar..."
.venv/bin/pip install -q -r bot/requirements.txt

echo "▶ Bot ishga tushdi. To'xtatish: Ctrl+C"
echo "▶ Guruhda «Bot ishga tushdi» xabarini ko'ring."
.venv/bin/python bot/main.py
