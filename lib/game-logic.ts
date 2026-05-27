import { COMBO, STABILITY } from "./constants";
import type { GameEventConfig, LaukConfig } from "./types";

// Pure functions shared by the client store (optimistic updates) and the API
// routes (authoritative updates) so both compute the same numbers.

export function comboMultiplier(combo: number): number {
  if (combo >= COMBO.x25Threshold) return 1 + COMBO.x25Bonus;
  if (combo >= COMBO.x10Threshold) return 1 + COMBO.x10Bonus;
  return 1;
}

function mysteriousMeals(rng: () => number): number {
  const roll = rng();
  if (roll < 0.02) return 50; // jackpot
  if (roll < 0.1) return 5;
  if (roll < 0.5) return 2;
  if (roll < 0.85) return 1;
  return 0; // dud
}

/** Meals produced by a single click. `rng` is injectable for testing. */
export function clickMeals(
  lauk: LaukConfig,
  combo: number,
  event: GameEventConfig | null,
  rng: () => number = Math.random,
): number {
  if (event?.laukZeroMeal?.includes(lauk.id)) return 0;

  let meals = lauk.baseMeals;

  if (lauk.special === "telur_double" && rng() < 0.1) meals += 1;
  if (lauk.special === "mysterious") meals = mysteriousMeals(rng);

  meals *= comboMultiplier(combo);

  if (event) {
    if (event.globalMealMultiplier) meals *= event.globalMealMultiplier;
    const laukMult = event.laukMealMultipliers?.[lauk.id];
    if (laukMult != null) meals *= laukMult;
  }

  return Math.max(0, Math.round(meals));
}

/** Raw instability added by a single click (before recovery delta). */
export function clickInstability(
  lauk: LaukConfig,
  combo: number,
  event: GameEventConfig | null,
): number {
  let inst = STABILITY.instabilityPerClick * lauk.instabilityMultiplier;
  if (combo >= COMBO.x10Threshold) inst += STABILITY.comboInstabilityBonus;
  if (event?.instabilityMultiplier) inst *= event.instabilityMultiplier;
  return inst;
}

/**
 * Net change to the stability bar from one click. Positive = toward collapse.
 * Lauk recoveryDelta nudges recovery (nasi peacekeeper lowers it, mie raises it).
 */
export function clickStabilityDelta(
  lauk: LaukConfig,
  combo: number,
  event: GameEventConfig | null,
): number {
  return clickInstability(lauk, combo, event) - lauk.recoveryDelta;
}

/** Passive recovery (% per second), scaled by active players, capped. */
export function recoveryPerSec(activePlayers: number): number {
  return Math.min(
    STABILITY.maxRecoveryPerSec,
    STABILITY.baseRecoveryPerSec + activePlayers * STABILITY.recoveryPerPlayer,
  );
}

/** Lazy decay: stability after `elapsedMs` of passive recovery. */
export function decayStability(
  current: number,
  elapsedMs: number,
  activePlayers: number,
): number {
  const next = current - recoveryPerSec(activePlayers) * (elapsedMs / 1000);
  return Math.max(0, next);
}

export type StabilityStage =
  | "stable"
  | "wobble"
  | "tilt"
  | "critical"
  | "collapsed";

export function stabilityStage(pct: number, isCollapsed: boolean): StabilityStage {
  if (isCollapsed || pct >= STABILITY.collapseThreshold) return "collapsed";
  if (pct >= 85) return "critical";
  if (pct >= 60) return "tilt";
  if (pct >= 30) return "wobble";
  return "stable";
}

export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}
