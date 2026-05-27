"use client";

import { useState } from "react";
import { useGameStore } from "@/store/gameStore";
import { Panel } from "@/components/ui/GovDashboardFrame";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { formatNumber } from "@/lib/format";
import type { LeaderboardCategory } from "@/lib/types";

const CATEGORIES: { id: LeaderboardCategory; tab: string; unit: string }[] = [
  { id: "meals", tab: "🏆 Meals", unit: "meals" },
  { id: "hero", tab: "🦸 Hero", unit: "pts" },
  { id: "collapses", tab: "💥 Roboh", unit: "x" },
  { id: "sambal", tab: "🌶️ Sambal", unit: "klik" },
  { id: "cps", tab: "⚡ CPS", unit: "cps" },
];

export function Leaderboard() {
  const [category, setCategory] = useState<LeaderboardCategory>("meals");
  const myUsername = useGameStore((s) => s.username);
  const { entries, loading, enabled } = useLeaderboard(category);
  const meta = CATEGORIES.find((c) => c.id === category)!;

  return (
    <Panel title="🏆 Papan Peringkat Nasional" bodyClassName="p-0">
      <div className="flex flex-wrap gap-1 border-b-2 border-mbg-ink bg-mbg-cream/60 p-1.5">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCategory(c.id)}
            aria-pressed={c.id === category}
            className={`rounded-sm border px-1.5 py-0.5 font-mono text-[10px] transition ${
              c.id === category
                ? "border-mbg-ink bg-mbg-gold"
                : "border-transparent hover:border-mbg-ink/40"
            }`}
          >
            {c.tab}
          </button>
        ))}
      </div>

      {!enabled ? (
        <p className="px-3 py-4 text-center font-sans text-xs text-mbg-ink/50">
          Peringkat nasional aktif setelah terhubung ke server pusat.
        </p>
      ) : loading ? (
        <p className="px-3 py-4 text-center font-mono text-xs text-mbg-ink/50">
          Memuat data nasional…
        </p>
      ) : entries.length === 0 ? (
        <p className="px-3 py-4 text-center font-sans text-xs text-mbg-ink/50">
          Belum ada warga yang ngemas hari ini. Anda berkesempatan jadi
          pelopor!
        </p>
      ) : (
        <ol className="divide-y divide-mbg-ink/10">
          {entries.map((e, i) => {
            const isMe = e.username === myUsername;
            return (
              <li
                key={e.username + i}
                className={`flex items-center justify-between gap-2 px-3 py-1.5 font-mono text-xs ${
                  isMe ? "bg-mbg-gold/40" : ""
                }`}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span className="w-4 text-right text-mbg-ink/50">
                    {i + 1}
                  </span>
                  <span className="truncate font-display text-sm tracking-wide">
                    {e.username}
                    {isMe ? " (Anda)" : ""}
                  </span>
                </span>
                <span className="tabular-nums">
                  {formatNumber(e.value)}{" "}
                  <span className="text-mbg-ink/40">{meta.unit}</span>
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </Panel>
  );
}
