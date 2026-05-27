"use client";

import { useEffect } from "react";
import { useGameStore } from "@/store/gameStore";
import { POLL, SUPABASE_CONFIGURED } from "@/lib/constants";

/** Pings POST /api/heartbeat every 30s so the server can count active players. */
export function useHeartbeat() {
  useEffect(() => {
    if (!SUPABASE_CONFIGURED) return;

    async function beat() {
      const { playerId, username } = useGameStore.getState();
      if (!playerId) return;
      try {
        await fetch("/api/heartbeat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ player_id: playerId, username }),
        });
      } catch {
        // best-effort; ignore
      }
    }

    beat();
    const id = window.setInterval(beat, POLL.heartbeatMs);
    return () => window.clearInterval(id);
  }, []);
}
