import "server-only";
import type { NextRequest } from "next/server";

/**
 * Vercel Cron attaches `Authorization: Bearer <CRON_SECRET>` to scheduled
 * requests when the CRON_SECRET env var is set. Returns false if unset (so the
 * endpoint is closed by default).
 */
export function isCronAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}
