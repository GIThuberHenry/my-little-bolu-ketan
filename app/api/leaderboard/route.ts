import { NextResponse, type NextRequest } from "next/server";
import { getLeaderboard } from "@/lib/game-service";
import type { LeaderboardCategory } from "@/lib/types";

export const dynamic = "force-dynamic";

const VALID: readonly string[] = ["meals", "collapses", "sambal", "hero", "cps"];

export async function GET(request: NextRequest) {
  const catRaw = request.nextUrl.searchParams.get("category") ?? "meals";
  const category: LeaderboardCategory = VALID.includes(catRaw)
    ? (catRaw as LeaderboardCategory)
    : "meals";

  const limitRaw = parseInt(
    request.nextUrl.searchParams.get("limit") ?? "10",
    10,
  );
  const limit = Number.isFinite(limitRaw)
    ? Math.min(50, Math.max(1, limitRaw))
    : 10;

  try {
    const entries = await getLeaderboard(category, limit);
    return NextResponse.json(
      { category, entries },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { error: "leaderboard_unavailable" },
      { status: 503 },
    );
  }
}
