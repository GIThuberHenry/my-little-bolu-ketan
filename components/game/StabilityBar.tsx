"use client";

import { useGameStore } from "@/store/gameStore";
import { stabilityStage, type StabilityStage } from "@/lib/game-logic";

const STAGE_META: Record<
  StabilityStage,
  { label: string; bar: string; text: string }
> = {
  stable: { label: "✅ STABIL", bar: "bg-mbg-green", text: "text-mbg-green" },
  wobble: {
    label: "😐 SEDIKIT GOYANG",
    bar: "bg-mbg-yellow",
    text: "text-mbg-ink",
  },
  tilt: {
    label: "⚠️ KOTAK MIRING",
    bar: "bg-mbg-orange",
    text: "text-mbg-orange",
  },
  critical: {
    label: "🚨 BAHAYA — JANGAN SEMANGAT KELEWAT",
    bar: "bg-mbg-red",
    text: "text-mbg-red",
  },
  collapsed: { label: "💥 ROBOH", bar: "bg-mbg-red", text: "text-mbg-red" },
};

/** Global stability bar — color + label change by stage (SPEC §3 / VIBES). */
export function StabilityBar() {
  const pct = useGameStore((s) => s.stabilityPct);
  const isCollapsed = useGameStore((s) => s.isCollapsed);
  const stage = stabilityStage(pct, isCollapsed);
  const meta = STAGE_META[stage];
  const critical = stage === "critical" || stage === "collapsed";
  const clamped = Math.min(100, Math.max(0, pct));

  return (
    <div className="w-full">
      <div className="mb-1 flex items-center justify-between gap-2 font-mono text-[11px] uppercase tracking-widest">
        <span className="text-mbg-ink/70">Stabilitas Nasional</span>
        <span className={`font-bold ${meta.text} ${critical ? "animate-alarm" : ""}`}>
          {meta.label}
        </span>
      </div>
      <div className="h-4 w-full overflow-hidden rounded-sm border-2 border-mbg-ink bg-mbg-white">
        <div
          className={`h-full ${meta.bar} transition-[width,background-color] duration-300 ease-out`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      <p className="mt-0.5 text-right font-mono text-[11px] tabular-nums text-mbg-ink/60">
        {clamped.toFixed(1)}%
      </p>
    </div>
  );
}
