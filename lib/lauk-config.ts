import type { LaukConfig, LaukId } from "./types";

// Lauk definitions + effects (SPEC.md §4). The selector renders LAUK_LIST in order.
export const LAUK_LIST: LaukConfig[] = [
  {
    id: "ayam",
    label: "Ayam",
    emoji: "🍗",
    tooltip: "🍗 Ayam — lauk default, +1 meal per klik",
    baseMeals: 1,
    instabilityMultiplier: 1,
    recoveryDelta: 0,
  },
  {
    id: "telur",
    label: "Telur",
    emoji: "🥚",
    tooltip: "🥚 Telur — +1, kadang dapet 2 (10%)",
    baseMeals: 1,
    instabilityMultiplier: 1,
    recoveryDelta: 0,
    special: "telur_double",
  },
  {
    id: "tempe",
    label: "Tempe",
    emoji: "🟫",
    tooltip: "🟫 Tempe — lauk rakyat, +1 tanpa efek",
    baseMeals: 1,
    instabilityMultiplier: 1,
    recoveryDelta: 0,
  },
  {
    id: "mie",
    label: "Mie",
    emoji: "🍜",
    tooltip: "🍜 Mie — +2 meal tapi recovery -1% per klik",
    baseMeals: 2,
    instabilityMultiplier: 1,
    recoveryDelta: -1,
  },
  {
    id: "sambal",
    label: "Sambal",
    emoji: "🌶️",
    tooltip: "🌶️ Sambal — chaos amplifier, instability 2x",
    baseMeals: 1,
    instabilityMultiplier: 2,
    recoveryDelta: 0,
  },
  {
    id: "nasi",
    label: "Nasi",
    emoji: "🍚",
    tooltip: "🍚 Nasi — peacekeeper, recovery +0.5% per klik",
    baseMeals: 1,
    instabilityMultiplier: 1,
    recoveryDelta: 0.5,
  },
  {
    id: "lauk_misterius",
    label: "Misterius",
    emoji: "🎁",
    tooltip: "🎁 ??? — efek random tiap klik",
    baseMeals: 1,
    instabilityMultiplier: 1,
    recoveryDelta: 0,
    special: "mysterious",
  },
];

export const LAUK_MAP = Object.fromEntries(
  LAUK_LIST.map((l) => [l.id, l]),
) as Record<LaukId, LaukConfig>;

export const DEFAULT_LAUK: LaukId = "ayam";

export function getLauk(id: LaukId): LaukConfig {
  return LAUK_MAP[id] ?? LAUK_MAP[DEFAULT_LAUK];
}
