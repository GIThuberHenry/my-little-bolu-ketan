"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/store/gameStore";
import { secondsUntil, formatCountdown } from "@/lib/format";

/** Full-screen takeover during the post-collapse freeze (SPEC §3 / VIBES). */
export function CollapseOverlay() {
  const isCollapsed = useGameStore((s) => s.isCollapsed);
  const collapseEndsAt = useGameStore((s) => s.collapseEndsAt);
  const lastCollapser = useGameStore((s) => s.lastCollapser);
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (!isCollapsed) return;
    const tick = () => setRemaining(secondsUntil(collapseEndsAt));
    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [isCollapsed, collapseEndsAt]);

  return (
    <AnimatePresence>
      {isCollapsed ? (
        <motion.div
          className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-4 bg-mbg-red/95 p-6 text-center text-mbg-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="text-7xl"
            animate={{ rotate: [0, -10, 8, -4, 0], y: [0, 6, 0] }}
            transition={{ duration: 0.7, repeat: Infinity }}
            aria-hidden
          >
            📦💥
          </motion.div>
          <h2 className="font-serif text-3xl font-bold sm:text-5xl">
            🚨 KOTAK NASIONAL ROBOH 🚨
          </h2>
          {lastCollapser ? (
            <p className="font-display text-2xl tracking-wider">
              Penyebab: {lastCollapser}
            </p>
          ) : null}
          <p className="max-w-sm font-sans text-sm opacity-90">
            Operasi dihentikan sementara. Mohon bersabar.
          </p>
          <p className="rounded-sm border-2 border-mbg-white px-4 py-2 font-mono text-lg tabular-nums">
            Buka kembali dalam: {formatCountdown(remaining)}
          </p>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
