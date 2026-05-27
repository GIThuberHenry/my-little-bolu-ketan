import { NextResponse, type NextRequest } from "next/server";
import { heartbeat } from "@/lib/game-service";
import { rateLimit } from "@/lib/rate-limit";
import { USERNAME_MAX } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as {
    player_id?: unknown;
    username?: unknown;
  } | null;

  const playerId = typeof body?.player_id === "string" ? body.player_id : null;
  const username =
    typeof body?.username === "string"
      ? body.username.slice(0, USERNAME_MAX)
      : "Warga";

  if (!playerId) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  // Soft limit — if too frequent, just no-op success.
  if (!rateLimit(`hb:${playerId}`, 25_000)) {
    return NextResponse.json({ ok: true });
  }

  try {
    const active = await heartbeat(playerId, username);
    return NextResponse.json({ ok: true, active_players_count: active });
  } catch {
    return NextResponse.json({ error: "heartbeat_failed" }, { status: 503 });
  }
}
