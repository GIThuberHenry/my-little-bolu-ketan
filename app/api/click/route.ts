import { NextResponse, type NextRequest } from "next/server";
import { applyClicks } from "@/lib/game-service";
import { rateLimit } from "@/lib/rate-limit";
import { CLICK, USERNAME_MAX } from "@/lib/constants";
import type { ClickPayload, LaukId } from "@/lib/types";

export const dynamic = "force-dynamic";

const VALID_LAUK: readonly string[] = [
  "ayam",
  "telur",
  "tempe",
  "mie",
  "sambal",
  "nasi",
  "lauk_misterius",
];

export async function POST(request: NextRequest) {
  let body: { player_id?: unknown; username?: unknown; clicks?: unknown };
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
  const rawClicks = Array.isArray(body.clicks) ? body.clicks : null;

  if (!playerId || !username || !rawClicks) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  if (!rateLimit(`click:${playerId}`, CLICK.minRequestIntervalMs)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const clicks: ClickPayload[] = [];
  for (const item of rawClicks) {
    if (item && typeof item === "object") {
      const rec = item as Record<string, unknown>;
      if (
        typeof rec.lauk === "string" &&
        VALID_LAUK.includes(rec.lauk) &&
        typeof rec.timestamp === "number"
      ) {
        clicks.push({ lauk: rec.lauk as LaukId, timestamp: rec.timestamp });
        if (clicks.length >= CLICK.maxPerRequest) break;
      }
    }
  }

  if (clicks.length === 0) {
    return NextResponse.json({ error: "no_valid_clicks" }, { status: 400 });
  }

  try {
    const resp = await applyClicks(playerId, username, clicks);
    return NextResponse.json(resp, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "click_failed" }, { status: 503 });
  }
}
