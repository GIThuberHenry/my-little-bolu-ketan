import { NextResponse, type NextRequest } from "next/server";
import { getChatMessages, postUserMessage } from "@/lib/game-service";
import { rateLimit } from "@/lib/rate-limit";
import { CHAT, USERNAME_MAX } from "@/lib/constants";
import { cleanText } from "@/lib/wordlist";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const sinceRaw = request.nextUrl.searchParams.get("since");
  const parsed = sinceRaw ? parseInt(sinceRaw, 10) : NaN;
  const since = Number.isFinite(parsed) ? parsed : null;
  try {
    const messages = await getChatMessages(since);
    return NextResponse.json(
      { messages },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json({ error: "chat_unavailable" }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  let body: { player_id?: unknown; username?: unknown; message?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const playerId = typeof body.player_id === "string" ? body.player_id : null;
  const username =
    typeof body.username === "string"
      ? body.username.slice(0, USERNAME_MAX)
      : null;
  const rawMsg = typeof body.message === "string" ? body.message.trim() : "";

  if (!playerId || !username || !rawMsg) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }
  if (rawMsg.length > CHAT.maxChars) {
    return NextResponse.json({ error: "too_long" }, { status: 400 });
  }
  if (!rateLimit(`chat:${playerId}`, CHAT.rateLimitMs)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const message = cleanText(rawMsg).slice(0, CHAT.maxChars);
  try {
    await postUserMessage(playerId, username, message);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "chat_failed" }, { status: 503 });
  }
}
