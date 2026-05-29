"""Hardoil Telegram bot — Mini App va taklif/shikoyatlar."""

import asyncio
import json
import logging
import os
from pathlib import Path
from typing import Optional

from aiogram import Bot, Dispatcher, F
from aiogram.filters import CommandStart
from aiogram.types import (
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    MenuButtonWebApp,
    Message,
    WebAppData,
    WebAppInfo,
)
from dotenv import load_dotenv

# .env — loyiha ildizida (hardoil-miniapp/)
ROOT = Path(__file__).resolve().parent.parent
load_dotenv(ROOT / ".env")

BOT_TOKEN = os.getenv("BOT_TOKEN", "")
WEBAPP_URL = os.getenv("WEBAPP_URL", "").strip()
ADMIN_CHAT_ID = os.getenv("ADMIN_CHAT_ID", "")
MENU_BUTTON_TEXT = os.getenv("MENU_BUTTON_TEXT", "Hardoil")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

bot = Bot(token=BOT_TOKEN) if BOT_TOKEN else None
dp = Dispatcher()


def _webapp_url_valid() -> bool:
    return bool(
        WEBAPP_URL.startswith("https://")
        and "your-domain.com" not in WEBAPP_URL
        and "example.com" not in WEBAPP_URL
    )


def _admin_id() -> Optional[int]:
    if not ADMIN_CHAT_ID or not ADMIN_CHAT_ID.lstrip("-").isdigit():
        return None
    return int(ADMIN_CHAT_ID)


@dp.message(CommandStart())
async def cmd_start(message: Message) -> None:
    name = message.from_user.first_name if message.from_user else "mehmon"
    text = (
        f"Salom, {name}! 👋\n\n"
        "🛢️ <b>Hardoil</b> — moy almashtirish va sifatli moylar.\n\n"
        "Mini ilovani ochish uchun xabar yozish joyining <b>o'ng tomonidagi "
        f"ko'k «{MENU_BUTTON_TEXT}»</b> tugmasini bosing (ASLZAR dagidek)."
    )
    keyboard = None
    if _webapp_url_valid():
        keyboard = InlineKeyboardMarkup(
            inline_keyboard=[
                [
                    InlineKeyboardButton(
                        text=f"{MENU_BUTTON_TEXT} — Mini App",
                        web_app=WebAppInfo(url=WEBAPP_URL),
                    )
                ]
            ]
        )
    else:
        text += (
            "\n\n⚠️ <i>Pastdagi ko'k tugma hali yo'q: WEBAPP_URL (.env) da "
            "haqiqiy HTTPS manzil kerak (ngrok yoki hosting).</i>"
        )

    await message.answer(text, parse_mode="HTML", reply_markup=keyboard)
    if _webapp_url_valid():
        await set_menu_button()


@dp.message(F.web_app_data)
async def on_web_app_data(message: Message) -> None:
    """Mini App dan taklif/shikoyat (sendData)."""
    data: WebAppData = message.web_app_data
    user = message.from_user

    try:
        payload = json.loads(data.data)
    except json.JSONDecodeError:
        await message.answer("❌ Ma'lumotni o'qib bo'lmadi.")
        return

    if payload.get("type") != "feedback":
        return

    username_line = f"📛 Username: @{user.username}\n" if user and user.username else ""
    admin_text = (
        "📩 <b>Yangi taklif / shikoyat</b>\n\n"
        f"👤 Ism: {payload.get('name', '—')}\n"
        f"📞 Tel: {payload.get('phone', '—')}\n"
        f"💬 Xabar:\n{payload.get('message', '—')}\n\n"
        f"🆔 Telegram ID: <code>{user.id if user else '—'}</code>\n"
        f"{username_line}"
    )

    admin_id = _admin_id()
    if admin_id and bot:
        try:
            await bot.send_message(admin_id, admin_text, parse_mode="HTML")
        except Exception as e:
            logger.error("Admin ga yuborishda xato: %s", e)

    await message.answer(
        "✅ Rahmat! Xabaringiz qabul qilindi. Tez orada javob beramiz.",
        reply_markup=InlineKeyboardMarkup(
            inline_keyboard=[
                [
                    InlineKeyboardButton(
                        text=f"🛢️ {MENU_BUTTON_TEXT} — qayta ochish",
                        web_app=WebAppInfo(url=WEBAPP_URL),
                    )
                ]
            ]
        )
        if _webapp_url_valid()
        else None,
    )


async def set_menu_button() -> None:
    """Pastdagi ko'k Menu Button (ASLZAR uslubidagi Hardoil tugmasi)."""
    if not bot or not _webapp_url_valid():
        logger.warning(
            "Menu Button o'rnatilmadi — WEBAPP_URL haqiqiy HTTPS bo'lishi kerak."
        )
        return
    try:
        await bot.set_chat_menu_button(
            menu_button=MenuButtonWebApp(
                text=MENU_BUTTON_TEXT,
                web_app=WebAppInfo(url=WEBAPP_URL),
            )
        )
        logger.info("Menu Button «%s» → %s", MENU_BUTTON_TEXT, WEBAPP_URL)
    except Exception as e:
        logger.error(
            "Menu Button xato: %s — BotFather: Menu Button → Web App", e
        )


async def main() -> None:
    if not BOT_TOKEN:
        logger.error(
            "BOT_TOKEN topilmadi. .env fayl yarating (namuna: .env.example)"
        )
        return

    await set_menu_button()
    logger.info("Bot ishga tushdi...")
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
