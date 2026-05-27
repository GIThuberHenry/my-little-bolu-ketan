"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/store/gameStore";
import { getEvent } from "@/lib/event-config";
import { secondsUntil, formatCountdown } from "@/lib/format";
import type { EventVisual } from "@/lib/types";

const VISUAL_CLASS: Record<EventVisual, string> = {
  "banner-yellow": "bg-mbg-yellow text-mbg-ink",
  "banner-green": "bg-mbg-green text-mbg-white",
  "banner-gray": "bg-mbg-ink/80 text-mbg-white",
  "screen-red-pulse": "bg-mbg-red text-mbg-white animate-pulse",
  "alarm-red": "bg-mbg-red text-mbg-white animate-alarm",
  "particle-gold": "bg-mbg-gold text-mbg-ink",
  "screen-tilt-smoke": "bg-mbg-purple text-mbg-white",
};

/** Banner above the box while a random event is active (SPEC §7 / VIBES). */
export function EventBanner() {
  const activeEvent = useGameStore((s) => s.activeEvent);
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (!activeEvent) return;
    const tick = () => setRemaining(secondsUntil(activeEvent.ends_at));
    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [activeEvent]);

  const cfg = getEvent(activeEvent?.id ?? null);

  return (
    <AnimatePresence>
      {activeEvent && cfg ? (
        <motion.div
          initial={{ y: -16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -16, opacity: 0 }}
          className={`flex w-full items-center justify-between gap-3 rounded-sm border-2 border-mbg-ink px-3 py-2 ${VISUAL_CLASS[cfg.visual]}`}
        >
          <span className="font-display text-sm tracking-wide sm:text-base">
            {cfg.banner}
          </span>
          <span className="shrink-0 rounded-sm bg-black/15 px-2 py-0.5 font-mono text-xs tabular-nums">
            {formatCountdown(remaining)}
          </span>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
