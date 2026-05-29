# Hardoil — Telegram Mini App

Moy almashtirish va moy sotuv uchun Telegram bot + Mini App.

**Live:** https://miniapp-tawny-zeta.vercel.app/

## Tuzilma

```
hardoil-miniapp/
├── frontend/          # Mini App (Vercel: Root Directory = hardoil-miniapp/frontend)
├── bot/               # Telegram bot (aiogram 3)
├── .env               # Maxfiy (GitHub ga commit qilinmaydi)
└── .env.example
```

## Tez boshlash

### 1. Sozlash

```bash
cp .env.example .env
```

`.env` da: `BOT_TOKEN`, `WEBAPP_URL`, `ADMIN_CHAT_ID`, `MENU_BUTTON_TEXT`

Kontent: `frontend/js/config.js` (manzil, telefon, Instagram, katalog media)

### 2. BotFather (Menu Button)

- `/mybots` → bot → **Menu Button** → **Web App**
- URL: `https://miniapp-tawny-zeta.vercel.app/`
- Matn: `Hardoil`

### 3. Bot ishga tushirish

```bash
cd hardoil-miniapp
python3 -m venv .venv
source .venv/bin/activate
pip install -r bot/requirements.txt
python bot/main.py
```

### 4. Vercel deploy

GitHub `miniapp` repo → Vercel → **Root Directory:** `hardoil-miniapp/frontend`  
Push qilganda Vercel avtomatik yangilanadi.

Menu Button alohida:

```bash
python bot/set_menu_button.py
```

## Imkoniyatlar

- **Asosiy** — salom, xizmatlar, galereya
- **Katalog** — rasm/video grid, to‘liq ko‘rish
- **Boshqa** — manzil, taklif/shikoyat, Instagram

Taklif/shikoyat: Mini App → `sendData` → bot → `ADMIN_CHAT_ID` guruh.

### Taklif/shikoyat (forma)

**Vercel da** (tavsiya — terminal shart emas):

1. [vercel.com](https://vercel.com) → loyiha → **Settings** → **Environment Variables**
2. Qo‘shing: `BOT_TOKEN` va `ADMIN_CHAT_ID` (`.env` dagi qiymatlar)
3. **Redeploy** qiling

Forma endi `/api/feedback` orqali to‘g‘ridan guruhga yuboriladi.

**Zaxira:** `python3 bot/main.py` — `sendData` uchun (ixtiyoriy).

Tekshirish: botda `/test` — guruhga test xabari.

## Muammolar

| Muammo | Yechim |
|--------|--------|
| Vercel 404 | Root Directory = `hardoil-miniapp/frontend` |
| Tugma yo‘q | BotFather Menu Button + HTTPS URL |
| Forma kelmaydi | `python bot/main.py` ishlayaptimi? Bot guruhda? |

---

**Hardoil** — professional moy xizmati
