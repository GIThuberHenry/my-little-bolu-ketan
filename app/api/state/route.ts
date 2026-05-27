import { NextResponse } from "next/server";
import { getGameState } from "@/lib/game-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const state = await getGameState();
    return NextResponse.json(state, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    // Supabase not configured / unreachable — client falls back to offline.
    return NextResponse.json({ error: "state_unavailable" }, { status: 503 });
  }
}
