/**
 * Vercel serverless — taklif/shikoyat to'g'ridan Telegram guruhga.
 * Vercel → Settings → Environment Variables:
 *   BOT_TOKEN, ADMIN_CHAT_ID
 */

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "POST only" });
  }

  const token = process.env.BOT_TOKEN;
  const chatId = process.env.ADMIN_CHAT_ID;

  if (!token || !chatId) {
    return res.status(500).json({
      ok: false,
      error: "BOT_TOKEN yoki ADMIN_CHAT_ID Vercel da sozlanmagan",
    });
  }

  const { name, phone, message, user_id, username } = req.body || {};

  if (!name || !phone || !message) {
    return res.status(400).json({ ok: false, error: "Maydonlar to'liq emas" });
  }

  const usernameLine = username ? `\n📛 @${escapeHtml(username)}` : "";
  const text =
    `📩 <b>Yangi taklif / shikoyat</b> (Mini App)\n\n` +
    `👤 Ism: ${escapeHtml(name)}\n` +
    `📞 Tel: ${escapeHtml(phone)}\n` +
    `💬 Xabar:\n${escapeHtml(message)}\n\n` +
    `🆔 ID: <code>${user_id || "—"}</code>${usernameLine}`;

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const tgRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
      }),
    });

    const data = await tgRes.json();

    if (!data.ok) {
      return res.status(502).json({
        ok: false,
        error: data.description || "Telegram xato",
      });
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e.message) });
  }
};
