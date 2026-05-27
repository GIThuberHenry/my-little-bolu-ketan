"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const FOODS = ["🍗", "🍚", "🥚", "🌶️", "🍜", "🧆", "🟫", "🍱", "🥟", "🍤"];

export interface FoodDrop {
  id: number;
  left: number;
  delay: number;
  duration: number;
  emoji: string;
  size: number;
}

/** Generate a batch of drops. Call from an event handler (not during render). */
export function makeFoodDrops(): FoodDrop[] {
  return Array.from({ length: 40 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 1.5,
    duration: 2.5 + Math.random() * 2,
    emoji: FOODS[Math.floor(Math.random() * FOODS.length)],
    size: 24 + Math.random() * 28,
  }));
}

/** Konami-code easter egg: food rains across the whole screen. */
export function FoodRain({
  drops,
  onDone,
}: {
  drops: FoodDrop[];
  onDone: () => void;
}) {
  useEffect(() => {
    if (drops.length === 0) return;
    const id = window.setTimeout(onDone, 4500);
    return () => window.clearTimeout(id);
  }, [drops, onDone]);

  return (
    <AnimatePresence>
      {drops.length > 0 ? (
        <div className="pointer-events-none fixed inset-0 z-[70] overflow-hidden">
          {drops.map((it) => (
            <motion.span
              key={it.id}
              initial={{ y: "-10vh", rotate: 0, opacity: 1 }}
              animate={{ y: "110vh", rotate: 360, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: it.duration,
                delay: it.delay,
                ease: "easeIn",
              }}
              style={{ left: `${it.left}vw`, fontSize: it.size }}
              className="absolute top-0"
            >
              {it.emoji}
            </motion.span>
          ))}
        </div>
      ) : null}
    </AnimatePresence>
  );
}
