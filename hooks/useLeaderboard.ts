"use client";

import { useEffect, useState } from "react";
import { POLL, SUPABASE_CONFIGURED } from "@/lib/constants";
import type { LeaderboardCategory, LeaderboardEntry } from "@/lib/types";

/** Polls /api/leaderboard for a category every 5s. */
export function useLeaderboard(category: LeaderboardCategory) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(SUPABASE_CONFIGURED);

  useEffect(() => {
    // `loading` already starts false when Supabase isn't configured.
    if (!SUPABASE_CONFIGURED) return;
    let cancelled = false;

    async function load() {
      if (typeof document !== "undefined" && document.hidden) return;
      try {
        const res = await fetch(
          `/api/leaderboard?category=${category}&limit=10`,
          { cache: "no-store" },
        );
        if (!res.ok) return;
        const data = (await res.json()) as { entries?: LeaderboardEntry[] };
        if (!cancelled) setEntries(data.entries ?? []);
      } catch {
        // ignore; retry next tick
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    const id = window.setInterval(load, POLL.leaderboardMs);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [category]);

  return { entries, loading, enabled: SUPABASE_CONFIGURED };
}
