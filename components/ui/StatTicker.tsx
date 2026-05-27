"use client";

import { useGameStore } from "@/store/gameStore";
import { formatNumber } from "@/lib/format";
import { getLauk } from "@/lib/lauk-config";

/** TV-style running text of live national stats. */
export function StatTicker() {
  const totalMeals = useGameStore((s) => s.totalMeals);
  const players = useGameStore((s) => s.activePlayersCount);
  const stability = useGameStore((s) => s.stabilityPct);
  const selectedLauk = useGameStore((s) => s.selectedLauk);
  const online = useGameStore((s) => s.online);

  const items = [
    `MEALS TERKEMAS: ${formatNumber(totalMeals)}`,
    `WARGA AKTIF: ${formatNumber(players)}`,
    `STABILITAS KOTAK NASIONAL: ${stability.toFixed(1)}%`,
    `LAUK ANDA: ${getLauk(selectedLauk).label.toUpperCase()}`,
    online ? "STATUS: TERHUBUNG KE PUSAT" : "STATUS: MODE LOKAL",
    "WARGA, TENANG, INI CUMA SIMULASI",
  ];
  const line = `LIVE: ${items.join("   •   ")}`;

  return (
    <div className="overflow-hidden border-t-2 border-mbg-ink bg-mbg-ink text-mbg-white">
      <div className="flex w-max animate-marquee whitespace-nowrap py-1 font-mono text-xs">
        <span className="px-4">{line}</span>
        <span className="px-4" aria-hidden>
          {line}
        </span>
      </div>
    </div>
  );
}
