# Hardoil — Telegram Mini App

Moy almashtirish va moy sotuv magazini **Hardoil** uchun Telegram bot va Mini App (Web App).

## Tuzilma

```
hardoil-miniapp/
├── frontend/          # Mini App (HTML, CSS, JS)
│   ├── index.html
│   ├── css/styles.css
│   └── js/
│       ├── config.js  # Matnlar, katalog, manzil, Instagram
│       └── app.js
├── bot/
│   ├── main.py        # aiogram 3 bot
│   └── requirements.txt
├── .env.example
└── README.md
```

## Imkoniyatlar

- **Asosiy** — foydalanuvchi salomi, xizmatlar kartochkalari
- **Katalog** — rasm va video galereya (grid / ro‘yxat), to‘liq ko‘rish
- **Boshqa** — manzil, taklif/shikoyat formasi, Instagram havolasi

## Tez boshlash

### 1. BotFather

1. [@BotFather](https://t.me/BotFather) → `/newbot` → token oling
2. `/setdescription` — Hardoil haqida qisqa matn
3. **Pastdagi ko‘k «Hardoil» tugmasi** (ASLZAR dagidek — chatda xabar yozish joyining o‘ngida):
   - Bu **Menu Button** + haqiqiy **HTTPS** `WEBAPP_URL` kerak
   - Bot ishga tushganda avtomatik o‘rnatiladi, yoki qo‘lda:
   ```bash
   python bot/set_menu_button.py
   ```
   - **BotFather** orqali (eng ishonchli):
     - `/mybots` → botingiz → **Bot Settings** → **Menu Button**
     - **Configure menu button** → **Web App**
     - Matn: `Hardoil`
     - URL: `https://....ngrok-free.app/` (yoki hosting)

### 2. Sozlash

```bash
cd hardoil-miniapp
cp .env.example .env
# .env ni tahrirlang: BOT_TOKEN, WEBAPP_URL, ADMIN_CHAT_ID
```

`frontend/js/config.js` ichida manzil, telefon, Instagram va katalog media URL larini o‘zgartiring.

### 3. Frontend (lokal test)

Telegram faqat **HTTPS** qabul qiladi. Lokal uchun [ngrok](https://ngrok.com/) ishlating:

```bash
cd frontend
python3 -m http.server 8080
# boshqa terminalda:
ngrok http 8080
```

`.env` da `WEBAPP_URL` = ngrok HTTPS URL + `/` (masalan `https://abc123.ngrok-free.app/`)

Brauzerda tekshirish: ngrok URL ni oching (Telegram SDKsiz demo rejim).

### 4. Botni ishga tushirish

```bash
cd hardoil-miniapp
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r bot/requirements.txt
python bot/main.py
```

Telegramda botga `/start` yozing va pastdagi **Hardoil** tugmasini bosing.

### 5. Production hosting

Frontendni joylashtiring:

- [Vercel](https://vercel.com) / [Netlify](https://netlify.com) / o‘z serveringiz
- `WEBAPP_URL` ni yangilang
- Botni qayta ishga tushiring (menu button yangilanadi)

## Taklif / shikoyat

Foydalanuvchi formani to‘ldirganda Mini App `Telegram.WebApp.sendData()` orqali botga yuboradi. Bot xabarni `ADMIN_CHAT_ID` ga yo‘naltiradi.

**ADMIN_CHAT_ID** olish: [@userinfobot](https://t.me/userinfobot) ga yozing.

## Muhim eslatmalar

- `BOT_TOKEN` ni hech qachon GitHubga yuklamang — faqat `.env`
- Katalog rasmlari/videolari `config.js` → `catalogItems` da
- Instagram: `config.js` → `instagram.url`

## Muammolar

| Muammo | Yechim |
|--------|--------|
| Mini App ochilmaydi | `WEBAPP_URL` HTTPS bo‘lishi kerak |
| Forma yuborilmaydi | Bot ishlayaptimi? `sendData` faqat Telegram ichida ishlaydi |
| Admin xabar olmaydi | `ADMIN_CHAT_ID` to‘g‘ri va botga /start yozilgan bo‘lishi kerak |

---

**Hardoil** 🛢️ — professional moy xizmati
