// Tunable game constants. Mirrors SPEC.md mechanics.

export const STABILITY = {
  /** Base passive recovery (% per second). */
  baseRecoveryPerSec: 2,
  /** Extra recovery per active player. */
  recoveryPerPlayer: 0.1,
  /** Recovery is capped here regardless of player count. */
  maxRecoveryPerSec: 8,
  /** Instability added per click (before lauk/combo multipliers). */
  instabilityPerClick: 0.05,
  /** Extra instability per click while combo >= 10. */
  comboInstabilityBonus: 0.1,
  /** Bar collapses at this value. */
  collapseThreshold: 100,
  /** How long clicks are frozen after a collapse (seconds). */
  collapseFreezeSec: 10,
} as const;

export const COMBO = {
  /** Clicks within this window build combo. */
  windowMs: 300,
  /** Idle longer than this breaks the combo. */
  idleBreakMs: 1000,
  /** Combo thresholds and their bonus multipliers. */
  x10Threshold: 10,
  x10Bonus: 0.5, // +50%
  x25Threshold: 25,
  x25Bonus: 1.0, // +100%
} as const;

export const CLICK = {
  /** Client batches clicks for this long before POSTing. */
  batchIntervalMs: 500,
  /** Server rejects batches larger than this. */
  maxPerRequest: 10,
  /** Min interval between click POSTs per player (server rate limit). */
  minRequestIntervalMs: 400,
} as const;

export const POLL = {
  stateMs: 2000,
  chatMs: 3000,
  leaderboardMs: 5000,
  heartbeatMs: 30000,
} as const;

export const CHAT = {
  maxChars: 80,
  rateLimitMs: 3000,
  maxVisible: 50,
} as const;

export const USERNAME_MAX = 16;

/** localStorage keys (SPEC.md §9). */
export const LS_KEYS = {
  store: "mbg-clicker-store",
} as const;

/**
 * Whether the public Supabase env vars are present. Inlined at build time by
 * Next (NEXT_PUBLIC_*). When false the client runs fully offline (local-only).
 * Client-safe — does not import the Supabase SDK.
 */
export const SUPABASE_CONFIGURED = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);
