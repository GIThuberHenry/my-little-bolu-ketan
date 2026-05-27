"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/store/gameStore";
import { audio } from "@/lib/audio";
import { formatNumber } from "@/lib/format";

const THRESHOLDS = [1000, 5000, 10000, 50000, 100000, 500000];

/** Transient toast + sound when the player crosses a personal meals milestone. */
export function Achievements() {
  const personalMeals = useGameStore((s) => s.personalMeals);
  const [toast, setToast] = useState<string | null>(null);
  const lastRef = useRef<number | null>(null);

  useEffect(() => {
    // Initialize without firing for already-earned meals.
    if (lastRef.current === null) {
      lastRef.current = personalMeals;
      return;
    }
    const prev = lastRef.current;
    const crossed = THRESHOLDS.find((t) => prev < t && personalMeals >= t);
    lastRef.current = personalMeals;
    if (crossed) {
      audio.playAchievement();
      setToast(`🏆 ${formatNumber(crossed)} meals! Pahlawan nasional!`);
      const id = window.setTimeout(() => setToast(null), 4000);
      return () => window.clearTimeout(id);
    }
  }, [personalMeals]);

  return (
    <AnimatePresence>
      {toast ? (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          className="fixed left-1/2 top-4 z-[65] -translate-x-1/2 rounded-sm border-2 border-mbg-ink bg-mbg-gold px-4 py-2 font-display text-lg tracking-wider text-mbg-ink shadow-[4px_4px_0_0_rgba(26,26,26,0.7)]"
        >
          {toast}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
