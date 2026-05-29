"""Hardoil Telegram bot — Mini App va taklif/shikoyatlar."""

import asyncio
import json
import logging
import os
from pathlib import Path
from typing import Optional, Tuple

from aiogram import Bot, Dispatcher, F
from aiogram.enums import ContentType
from aiogram.filters import Command, CommandStart
from aiogram.types import (
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    MenuButtonWebApp,
    Message,
    WebAppInfo,
)
from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parent.parent
load_dotenv(ROOT / ".env")

BOT_TOKEN = os.getenv("BOT_TOKEN", "")
WEBAPP_URL = os.getenv("WEBAPP_URL", "").strip()
ADMIN_CHAT_ID = os.getenv("ADMIN_CHAT_ID", "").strip()
MENU_BUTTON_TEXT = os.getenv("MENU_BUTTON_TEXT", "Hardoil")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
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
    raw = ADMIN_CHAT_ID.strip().strip('"').strip("'")
    if not raw:
        return None
    try:
        return int(raw)
    except ValueError:
        logger.error("ADMIN_CHAT_ID noto'g'ri: %s", ADMIN_CHAT_ID)
        return None


def _mini_app_keyboard() -> Optional[InlineKeyboardMarkup]:
    if not _webapp_url_valid():
        return None
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text=f"🛢️ {MENU_BUTTON_TEXT} — Mini App",
                    web_app=WebAppInfo(url=WEBAPP_URL),
                )
            ]
        ]
    )


async def _send_to_admin(text: str) -> Tuple[bool, str]:
    """Guruhga yuborish. (muvaffaqiyat, xato matni)"""
    admin_id = _admin_id()
    if not admin_id or not bot:
        return False, "ADMIN_CHAT_ID yoki bot sozlanmagan"

    try:
        await bot.send_message(admin_id, text, parse_mode="HTML")
        logger.info("Admin guruhga yuborildi: chat_id=%s", admin_id)
        return True, ""
    except Exception as e:
        err = f"{type(e).__name__}: {e}"
        logger.error("Admin ga yuborishda xato: %s", err)
        return False, err


@dp.message(CommandStart())
async def cmd_start(message: Message) -> None:
    name = message.from_user.first_name if message.from_user else "mehmon"
    text = (
        f"Salom, {name}! 👋\n\n"
        "🛢️ <b>Hardoil</b> — moy almashtirish va sifatli moylar.\n\n"
        "Mini ilovani ochish uchun xabar yozish joyining <b>o'ng tomonidagi "
        f"ko'k «{MENU_BUTTON_TEXT}»</b> tugmasini bosing."
    )
    await message.answer(text, parse_mode="HTML", reply_markup=_mini_app_keyboard())
    if _webapp_url_valid():
        await set_menu_button()


@dp.message(Command("test"))
async def cmd_test(message: Message) -> None:
    """Guruhga yozishni tekshirish: /test"""
    ok, err = await _send_to_admin(
        "🧪 <b>Test</b> — Hardoil bot guruhga yozishi mumkin."
    )
    if ok:
        await message.answer("✅ Guruhga test xabari yuborildi.")
    else:
        await message.answer(f"❌ Guruhga yuborilmadi:\n<code>{err}</code>", parse_mode="HTML")


@dp.message(F.content_type == ContentType.WEB_APP_DATA)
async def on_web_app_data(message: Message) -> None:
    """Mini App sendData → bot → admin guruh."""
    data = message.web_app_data
    if not data or not data.data:
        await message.answer("❌ Bo'sh ma'lumot keldi.")
        return

    user = message.from_user
    logger.info(
        "web_app_data keldi: user_id=%s data_len=%s",
        user.id if user else None,
        len(data.data),
    )

    try:
        payload = json.loads(data.data)
    except json.JSONDecodeError:
        logger.error("JSON xato: %s", data.data[:200])
        await message.answer("❌ Ma'lumotni o'qib bo'lmadi.")
        return

    if payload.get("type") != "feedback":
        logger.warning("Noma'lum tur: %s", payload.get("type"))
        return

    username_line = (
        f"📛 Username: @{user.username}\n" if user and user.username else ""
    )
    admin_text = (
        "📩 <b>Yangi taklif / shikoyat</b>\n\n"
        f"👤 Ism: {payload.get('name', '—')}\n"
        f"📞 Tel: {payload.get('phone', '—')}\n"
        f"💬 Xabar:\n{payload.get('message', '—')}\n\n"
        f"🆔 Telegram ID: <code>{user.id if user else '—'}</code>\n"
        f"{username_line}"
    )

    ok, err = await _send_to_admin(admin_text)

    if ok:
        await message.answer(
            "✅ Rahmat! Xabaringiz qabul qilindi. Tez orada javob beramiz.",
            reply_markup=_mini_app_keyboard(),
        )
    else:
        await message.answer(
            "⚠️ Xabaringiz qabul qilindi, lekin guruhga yetkazilmadi. "
            "Administratorga murojaat qiling.\n"
            f"<i>Texnik: {err}</i>",
            parse_mode="HTML",
            reply_markup=_mini_app_keyboard(),
        )


async def set_menu_button() -> None:
    if not bot or not _webapp_url_valid():
        logger.warning("Menu Button o'rnatilmadi — WEBAPP_URL tekshiring.")
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
        logger.error("Menu Button xato: %s", e)


async def on_startup() -> None:
    admin_id = _admin_id()
    if not bot or not admin_id:
        return
    try:
        chat = await bot.get_chat(admin_id)
        await bot.send_message(
            admin_id,
            f"🟢 <b>Hardoil bot</b> ishga tushdi.\n"
            f"Guruh: {chat.title or admin_id}\n"
            "Taklif/shikoyatlar shu yerga keladi.",
            parse_mode="HTML",
        )
        logger.info("Startup xabari yuborildi: %s", chat.title)
    except Exception as e:
        logger.error(
            "Startup: guruhga yozib bo'lmadi. Bot guruhda bormi? Xato: %s", e
        )


async def main() -> None:
    if not BOT_TOKEN:
        logger.error("BOT_TOKEN topilmadi — .env faylni tekshiring.")
        return

    dp.startup.register(on_startup)
    await set_menu_button()
    logger.info("Bot polling boshlandi. Ctrl+C to'xtatish.")
    allowed = dp.resolve_used_update_types()
    logger.info("Allowed updates: %s", allowed)
    await dp.start_polling(bot, allowed_updates=allowed)


if __name__ == "__main__":
    asyncio.run(main())
