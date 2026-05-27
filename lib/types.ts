// Shared types for MBG Clicker. Used by client store, API routes, and configs
// so the click/stability contract stays consistent end-to-end.

export type LaukId =
  | "ayam"
  | "telur"
  | "tempe"
  | "mie"
  | "sambal"
  | "nasi"
  | "lauk_misterius";

export interface LaukConfig {
  id: LaukId;
  label: string;
  emoji: string;
  tooltip: string;
  /** Meals produced per click before combo / event multipliers. */
  baseMeals: number;
  /** Multiplier applied to the base instability gain (sambal = 2x chaos). */
  instabilityMultiplier: number;
  /** Added to global recovery per click (nasi +0.5, mie -1). */
  recoveryDelta: number;
  /** Special handling done in game-logic (random outcomes). */
  special?: "telur_double" | "mysterious";
}

export type EventId =
  | "rice_shortage"
  | "sambal_festival"
  | "bonus_protein"
  | "hunger_emergency"
  | "telur_inflation"
  | "mysterious_donatur"
  | "spice_instability"
  | "ayam_mogok";

export type EventVisual =
  | "banner-yellow"
  | "screen-red-pulse"
  | "banner-green"
  | "alarm-red"
  | "banner-gray"
  | "particle-gold"
  | "screen-tilt-smoke";

export interface GameEventConfig {
  id: EventId;
  emoji: string;
  /** Big banner text shown above the box (VIBES.md). */
  banner: string;
  /** System chat message posted when the event starts. */
  systemMessage: string;
  durationSec: number;
  /** Relative weight for random selection. */
  weight: number;
  visual: EventVisual;

  // --- gameplay modifiers (all optional) ---
  /** Multiply meals for ALL clicks. */
  globalMealMultiplier?: number;
  /** Multiply instability gain for ALL clicks. */
  instabilityMultiplier?: number;
  /** Per-lauk meal multiplier override (e.g. sambal 2x, telur 0.5x). */
  laukMealMultipliers?: Partial<Record<LaukId, number>>;
  /** Lauk that produce ZERO meals while active (ayam mogok). */
  laukZeroMeal?: LaukId[];
  /** One-shot instant event (mysterious donatur), no duration window. */
  instant?: boolean;
}

export interface ActiveEvent {
  id: EventId;
  ends_at: string; // ISO timestamp
}

/** Shape returned by GET /api/state (camelCase-friendly DTO). */
export interface GameStateDTO {
  total_meals: number;
  stability_pct: number;
  active_event: ActiveEvent | null;
  is_collapsed: boolean;
  collapse_ends_at: string | null;
  last_collapser_username: string | null;
  active_players_count: number;
}

export interface ClickPayload {
  lauk: LaukId;
  timestamp: number;
}

export interface ClickResponse {
  accepted_clicks: number;
  new_total_meals: number;
  new_stability_pct: number;
  personal_meals: number;
  collapsed: boolean;
  collapser: string | null;
  collapse_ends_at: string | null;
}

export interface ChatMessage {
  id: number;
  username: string;
  message: string;
  is_system: boolean;
  created_at: string;
}

export type LeaderboardCategory =
  | "meals"
  | "collapses"
  | "sambal"
  | "hero"
  | "cps";

export interface LeaderboardEntry {
  username: string;
  value: number;
}
