"""Pastdagi ko'k 'Hardoil' Menu Button ni Telegram ga o'rnatish (ASLZAR uslubi)."""

import os
import sys
from pathlib import Path

import asyncio
from aiogram import Bot
from aiogram.types import MenuButtonWebApp, WebAppInfo
from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parent.parent
load_dotenv(ROOT / ".env")

BOT_TOKEN = os.getenv("BOT_TOKEN", "")
WEBAPP_URL = os.getenv("WEBAPP_URL", "").strip()
MENU_BUTTON_TEXT = os.getenv("MENU_BUTTON_TEXT", "Hardoil")


def _valid_url(url: str) -> bool:
    return url.startswith("https://") and "your-domain.com" not in url and "example.com" not in url


async def main() -> None:
    if not BOT_TOKEN:
        print("❌ BOT_TOKEN yo'q — .env faylni tekshiring.")
        sys.exit(1)

    if not _valid_url(WEBAPP_URL):
        print("❌ WEBAPP_URL noto'g'ri yoki placeholder.")
        print("   ngrok yoki hostingdan HTTPS link oling, .env ga qo'ying:")
        print("   WEBAPP_URL=https://xxxx.ngrok-free.app/")
        sys.exit(1)

    bot = Bot(token=BOT_TOKEN)
    try:
        await bot.set_chat_menu_button(
            menu_button=MenuButtonWebApp(
                text=MENU_BUTTON_TEXT,
                web_app=WebAppInfo(url=WEBAPP_URL),
            )
        )
        print(f"✅ Menu Button o'rnatildi: «{MENU_BUTTON_TEXT}» → {WEBAPP_URL}")
        print("   Telegramda bot chatini yoping va qayta oching — pastda ko'k tugma chiqadi.")
    except Exception as e:
        print(f"❌ Xato: {e}")
        print("\nQo'lda (BotFather):")
        print("  /mybots → botingiz → Bot Settings → Menu Button → Web App")
        print(f"  Matn: {MENU_BUTTON_TEXT}")
        print(f"  URL: {WEBAPP_URL}")
        sys.exit(1)
    finally:
        await bot.session.close()


if __name__ == "__main__":
    asyncio.run(main())
