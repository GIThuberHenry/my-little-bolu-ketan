// Dead-simple in-memory rate limiter (TECH.md: OK for MVP; resets on cold start).

const lastHit = new Map<string, number>();

/** Returns true if allowed (records the hit), false if called again too soon. */
export function rateLimit(key: string, minIntervalMs: number): boolean {
  const now = Date.now();
  const prev = lastHit.get(key);
  if (prev != null && now - prev < minIntervalMs) return false;
  lastHit.set(key, now);

  // Opportunistic cleanup so the map can't grow unbounded.
  if (lastHit.size > 5000) {
    for (const [k, t] of lastHit) {
      if (now - t > 60_000) lastHit.delete(k);
    }
  }
  return true;
}
