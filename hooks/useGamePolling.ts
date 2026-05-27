"use client";

import { useEffect } from "react";
import { useGameStore } from "@/store/gameStore";
import { POLL, SUPABASE_CONFIGURED } from "@/lib/constants";
import type { GameStateDTO } from "@/lib/types";

/** Polls GET /api/state every 2s and syncs server state into the store. */
export function useGamePolling() {
  const setServerState = useGameStore((s) => s.setServerState);
  const setOnline = useGameStore((s) => s.setOnline);

  useEffect(() => {
    if (!SUPABASE_CONFIGURED) return; // pure offline mode
    let cancelled = false;

    async function poll() {
      if (typeof document !== "undefined" && document.hidden) return; // save bandwidth
      try {
        const res = await fetch("/api/state", { cache: "no-store" });
        if (!res.ok) throw new Error(String(res.status));
        const dto = (await res.json()) as GameStateDTO;
        if (!cancelled) setServerState(dto);
      } catch {
        if (!cancelled) setOnline(false);
      }
    }

    poll();
    const id = window.setInterval(poll, POLL.stateMs);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [setServerState, setOnline]);
}
