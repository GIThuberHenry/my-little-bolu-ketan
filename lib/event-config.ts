import type { EventId, GameEventConfig } from "./types";

// Random events (SPEC.md §7, banner copy from VIBES.md).
export const EVENT_LIST: GameEventConfig[] = [
  {
    id: "rice_shortage",
    emoji: "🍚",
    banner: "🍚 KRISIS BERAS NASIONAL — Produksi nasi -50%",
    systemMessage: "📢 STOK BERAS NASIONAL MENIPIS. Produksi nasi dipangkas.",
    durationSec: 60,
    weight: 12,
    visual: "banner-yellow",
    laukMealMultipliers: { nasi: 0.5 },
  },
  {
    id: "sambal_festival",
    emoji: "🌶️",
    banner: "🌶️ FESTIVAL SAMBAL — Sambal multiplier 2x!",
    systemMessage: "📢 SAMBAL FESTIVAL DIMULAI! Multiplier 2x semua click pakai sambal!",
    durationSec: 45,
    weight: 12,
    visual: "screen-red-pulse",
    laukMealMultipliers: { sambal: 2 },
  },
  {
    id: "bonus_protein",
    emoji: "💪",
    banner: "💪 JAM PROTEIN BONUS — Ayam & telur double meal!",
    systemMessage: "📢 JAM PROTEIN BONUS! Ayam & telur menghasilkan 2x meal.",
    durationSec: 90,
    weight: 12,
    visual: "banner-green",
    laukMealMultipliers: { ayam: 2, telur: 2 },
  },
  {
    id: "hunger_emergency",
    emoji: "🆘",
    banner: "🆘 DARURAT LAPAR NASIONAL — Semua click 3x, tapi stabilitas drop cepet!",
    systemMessage: "📢 DARURAT LAPAR NASIONAL! Semua click 3x — tapi hati-hati, kotak gampang roboh.",
    durationSec: 30,
    weight: 8,
    visual: "alarm-red",
    globalMealMultiplier: 3,
    instabilityMultiplier: 2,
  },
  {
    id: "telur_inflation",
    emoji: "🥚",
    banner: "🥚 INFLASI TELUR — Telur jadi setengah meal aja",
    systemMessage: "📢 INFLASI TELUR. Nilai telur turun jadi setengah meal.",
    durationSec: 60,
    weight: 10,
    visual: "banner-gray",
    laukMealMultipliers: { telur: 0.5 },
  },
  {
    id: "mysterious_donatur",
    emoji: "🎁",
    banner: "🎁 DONATUR MISTERIUS muncul...",
    systemMessage: "📢 DONATUR MISTERIUS muncul dan menyumbang ke seorang warga acak!",
    durationSec: 1,
    weight: 8,
    visual: "particle-gold",
    instant: true,
  },
  {
    id: "spice_instability",
    emoji: "🌶️",
    banner: "🌶️ INSTABILITAS REMPAH NASIONAL — Stabilitas drop 2x cepet",
    systemMessage: "📢 INSTABILITAS REMPAH NASIONAL! Stabilitas turun 2x lebih cepat.",
    durationSec: 30,
    weight: 8,
    visual: "screen-tilt-smoke",
    instabilityMultiplier: 2,
  },
  {
    id: "ayam_mogok",
    emoji: "🐔",
    banner: "🐔 AYAM NASIONAL MOGOK — Click ayam ga ngehasilin meal",
    systemMessage: "📢 AYAM NASIONAL MOGOK. Click ayam ga ngehasilin meal sementara.",
    durationSec: 45,
    weight: 10,
    visual: "banner-yellow",
    laukZeroMeal: ["ayam"],
  },
];

export const EVENT_MAP = Object.fromEntries(
  EVENT_LIST.map((e) => [e.id, e]),
) as Record<EventId, GameEventConfig>;

export function getEvent(id: EventId | string | null | undefined): GameEventConfig | null {
  if (!id) return null;
  return EVENT_MAP[id as EventId] ?? null;
}

/** Weighted random pick for the cron trigger. */
export function pickRandomEvent(): GameEventConfig {
  const total = EVENT_LIST.reduce((sum, e) => sum + e.weight, 0);
  let r = Math.random() * total;
  for (const e of EVENT_LIST) {
    r -= e.weight;
    if (r <= 0) return e;
  }
  return EVENT_LIST[0];
}
