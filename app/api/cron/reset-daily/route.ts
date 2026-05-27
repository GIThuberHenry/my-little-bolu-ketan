import { NextResponse, type NextRequest } from "next/server";
import { resetDaily } from "@/lib/game-service";
import { isCronAuthorized } from "@/lib/cron-auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    await resetDaily();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "reset_failed" }, { status: 503 });
  }
}
