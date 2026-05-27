"use client";

import { useEffect } from "react";
import { useGameStore } from "@/store/gameStore";

/** Updates the browser tab title with live player count / collapse status. */
export function useDynamicTitle() {
  const players = useGameStore((s) => s.activePlayersCount);
  const isCollapsed = useGameStore((s) => s.isCollapsed);
  const online = useGameStore((s) => s.online);

  useEffect(() => {
    if (isCollapsed) {
      document.title = "🚨 ROBOH 🚨 — MBG Clicker";
    } else if (online) {
      document.title = `(${players} warga) MBG Operasional`;
    } else {
      document.title = "MBG Clicker — Kemas Makanan Nasional";
    }
  }, [players, isCollapsed, online]);
}
