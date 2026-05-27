"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/store/gameStore";
import { getLauk } from "@/lib/lauk-config";
import { stabilityStage } from "@/lib/game-logic";
import { ClickEffect, type ClickEffectData } from "./ClickEffects";
import { audio } from "@/lib/audio";

let effectId = 0;

/** The big clickable MBG meal box. Reacts visually to the stability stage. */
export function MBGBox() {
  const registerClick = useGameStore((s) => s.registerClick);
  const selectedLauk = useGameStore((s) => s.selectedLauk);
  const isCollapsed = useGameStore((s) => s.isCollapsed);
  const stabilityPct = useGameStore((s) => s.stabilityPct);
  const [effects, setEffects] = useState<ClickEffectData[]>([]);

  const stage = stabilityStage(stabilityPct, isCollapsed);
  const lauk = getLauk(selectedLauk);
  const tilt = stage === "tilt" ? -4 : stage === "critical" ? -8 : 0;

  function handleClick(e: React.PointerEvent<HTMLButtonElement>) {
    audio.unlock(); // first gesture starts BGM (browser autoplay policy)
    const res = registerClick();
    if (res.blocked) return;
    audio.playClick();
    const rect = e.currentTarget.getBoundingClientRect();
    const id = effectId++;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setEffects((prev) => [...prev, { id, x, y, value: res.meals, combo: res.combo }]);
    window.setTimeout(
      () => setEffects((prev) => prev.filter((it) => it.id !== id)),
      900,
    );
  }

  return (
    <div className="relative flex flex-col items-center">
      <motion.button
        type="button"
        onPointerDown={handleClick}
        disabled={isCollapsed}
        aria-label="Kemas makanan"
        animate={{
          rotate: tilt,
          scale: stage === "stable" ? [1, 1.02, 1] : 1,
        }}
        transition={
          stage === "stable"
            ? {
                scale: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                rotate: { duration: 0.4 },
              }
            : { duration: 0.4 }
        }
        whileTap={{ scale: 0.94 }}
        className="relative cursor-pointer touch-none select-none outline-none disabled:cursor-not-allowed disabled:opacity-60"
      >
        <KotakVisual emoji={lauk.emoji} />
      </motion.button>

      <AnimatePresence>
        {effects.map((e) => (
          <ClickEffect
            key={e.id}
            x={e.x}
            y={e.y}
            value={e.value}
            combo={e.combo}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

function KotakVisual({ emoji }: { emoji: string }) {
  return (
    <div className="relative">
      {/* lid */}
      <div className="absolute -top-3 left-1/2 z-10 h-6 w-[88%] -translate-x-1/2 rounded-sm border-[3px] border-mbg-ink bg-mbg-white" />
      {/* body */}
      <div className="relative flex h-52 w-52 flex-col items-center justify-center gap-2 rounded-sm border-[3px] border-mbg-ink bg-mbg-white shadow-[6px_6px_0_0_rgba(26,26,26,0.85)] sm:h-64 sm:w-64">
        <span className="text-6xl sm:text-7xl" aria-hidden>
          {emoji}
        </span>
        <span className="rounded-sm bg-mbg-red px-2 py-0.5 font-display text-lg tracking-widest text-mbg-white">
          KOTAK MBG
        </span>
        <span className="font-mono text-[10px] uppercase tracking-widest text-mbg-ink/50">
          Tekan untuk kemas
        </span>
      </div>
    </div>
  );
}
