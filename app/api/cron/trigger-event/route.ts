import { NextResponse, type NextRequest } from "next/server";
import { triggerRandomEvent } from "@/lib/game-service";
import { isCronAuthorized } from "@/lib/cron-auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const result = await triggerRandomEvent();
    return NextResponse.json({ ok: true, ...result });
  } catch {
    return NextResponse.json({ error: "trigger_failed" }, { status: 503 });
  }
}
