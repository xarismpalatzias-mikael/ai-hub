import { NextResponse } from "next/server";

// ✅ OPTIONAL: you can protect the webhook with a secret
// Put in Vercel ENV: TV_WEBHOOK_SECRET="mikael123"
const SECRET = process.env.TV_WEBHOOK_SECRET || "";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // ✅ If you enabled secret protection
    if (SECRET) {
      const incomingSecret = body?.secret;
      if (incomingSecret !== SECRET) {
        return NextResponse.json(
          { ok: false, error: "Unauthorized webhook" },
          { status: 401 }
        );
      }
    }

    // ✅ read basic fields
    const type = body?.type || "UNKNOWN";
    const symbol = body?.symbol || "UNKNOWN";
    const tf = body?.tf || "UNKNOWN";
    const price = body?.price ?? null;
    const time = body?.time || new Date().toISOString();

    console.log("📩 TradingView Webhook:", body);

    // ✅ OPTIONAL: Forward to Telegram if you want
    // Put in Vercel ENV:
    // TELEGRAM_BOT_TOKEN="xxxx"
    // TELEGRAM_CHAT_ID="xxxx"
    const BOT = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT = process.env.TELEGRAM_CHAT_ID;

    if (BOT && CHAT) {
      const msg =
        `📡 TV SIGNAL\n` +
        `Type: ${type}\n` +
        `Symbol: ${symbol}\n` +
        `TF: ${tf}\n` +
        `Price: ${price}\n` +
        `Time: ${time}`;

      await fetch(`https://api.telegram.org/bot${BOT}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: CHAT,
          text: msg,
        }),
      });
    }

    // ✅ Return OK to TradingView
    return NextResponse.json({
      ok: true,
      received: { type, symbol, tf, price, time },
    });
  } catch (err: any) {
    console.error("❌ Webhook error:", err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Webhook failed" },
      { status: 500 }
    );
  }
}

// ✅ Allow GET test in browser
export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "TV webhook is live ✅",
  });
}
