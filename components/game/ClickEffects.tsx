"use client";

import { motion } from "framer-motion";

export interface ClickEffectData {
  id: number;
  x: number;
  y: number;
  value: number;
  combo: number;
}

/** A single floating "+N" popup that rises and fades (SPEC §2 / VIBES animation). */
export function ClickEffect({
  x,
  y,
  value,
  combo,
}: Omit<ClickEffectData, "id">) {
  const isCombo = combo >= 10;
  const isMiss = value <= 0;
  const color = isMiss
    ? "text-mbg-ink/40"
    : isCombo
      ? "text-mbg-gold"
      : "text-mbg-green";

  return (
    <motion.span
      initial={{ opacity: 1, y: 0, scale: isCombo ? 1.2 : 1 }}
      animate={{ opacity: 0, y: -64, scale: isCombo ? 1.6 : 1.1 }}
      transition={{ duration: 0.85, ease: "easeOut" }}
      style={{ left: x, top: y }}
      className={`pointer-events-none absolute z-20 -translate-x-1/2 font-mono text-xl font-bold drop-shadow ${color}`}
    >
      {isMiss ? "+0" : `+${value}`}
      {isCombo ? <span className="ml-1 text-sm">x{combo}</span> : null}
    </motion.span>
  );
}
