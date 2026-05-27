"use client";

import { useEffect } from "react";
import { useGameStore } from "@/store/gameStore";
import { CLICK, SUPABASE_CONFIGURED } from "@/lib/constants";
import type { ClickResponse } from "@/lib/types";

/**
 * Every 500ms, flushes buffered clicks to POST /api/click and reconciles the
 * response. Offline (no Supabase), drained clicks are dropped — they're already
 * counted optimistically in the local store.
 */
export function useClickBatcher() {
  const drainPendingClicks = useGameStore((s) => s.drainPendingClicks);
  const applyClickResponse = useGameStore((s) => s.applyClickResponse);
  const setOnline = useGameStore((s) => s.setOnline);

  useEffect(() => {
    const id = window.setInterval(async () => {
      const pending = drainPendingClicks();
      if (pending.length === 0) return;
      if (!SUPABASE_CONFIGURED) return;

      const { playerId, username } = useGameStore.getState();
      try {
        const res = await fetch("/api/click", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            player_id: playerId,
            username,
            clicks: pending,
          }),
        });
        if (!res.ok) throw new Error(String(res.status));
        const resp = (await res.json()) as ClickResponse;
        applyClickResponse(resp);
      } catch {
        setOnline(false);
      }
    }, CLICK.batchIntervalMs);

    return () => window.clearInterval(id);
  }, [drainPendingClicks, applyClickResponse, setOnline]);
}
