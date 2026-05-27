import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "./supabase";
import { COMBO, STABILITY } from "./constants";
import {
  clamp,
  clickMeals,
  clickStabilityDelta,
  decayStability,
} from "./game-logic";
import { getEvent, pickRandomEvent } from "./event-config";
import { getLauk } from "./lauk-config";
import type {
  ActiveEvent,
  ChatMessage,
  ClickPayload,
  ClickResponse,
  EventId,
  GameStateDTO,
  LeaderboardCategory,
  LeaderboardEntry,
} from "./types";

// Server-only DB logic. All Supabase access for game state lives here so the
// click / stability / collapse contract stays in one place.

interface GameStateRow {
  id: number;
  total_meals: number | string;
  stability_pct: number | string;
  active_event_id: string | null;
  active_event_ends_at: string | null;
  is_collapsed: boolean;
  collapse_ends_at: string | null;
  last_collapser_username: string | null;
  active_players_count: number;
  updated_at: string;
}

function num(v: number | string | null | undefined, fallback = 0): number {
  if (v == null) return fallback;
  return typeof v === "string" ? parseFloat(v) : v;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

async function fetchStateRow(sb: SupabaseClient): Promise<GameStateRow> {
  const { data, error } = await sb
    .from("game_state")
    .select("*")
    .eq("id", 1)
    .single();
  if (error) throw error;
  return data as GameStateRow;
}

function activeEventFrom(row: GameStateRow): ActiveEvent | null {
  if (!row.active_event_id || !row.active_event_ends_at) return null;
  if (new Date(row.active_event_ends_at).getTime() <= Date.now()) return null;
  return {
    id: row.active_event_id as EventId,
    ends_at: row.active_event_ends_at,
  };
}

function isFrozen(row: GameStateRow): boolean {
  return (
    row.is_collapsed &&
    !!row.collapse_ends_at &&
    new Date(row.collapse_ends_at).getTime() > Date.now()
  );
}

/** GET /api/state — current state with lazily-decayed stability (no write). */
export async function getGameState(): Promise<GameStateDTO> {
  const sb = getSupabaseAdmin();
  const row = await fetchStateRow(sb);
  const frozen = isFrozen(row);
  const elapsed = Date.now() - new Date(row.updated_at).getTime();
  const stability = frozen
    ? num(row.stability_pct)
    : decayStability(
        num(row.stability_pct),
        elapsed,
        Math.max(1, row.active_players_count),
      );

  return {
    total_meals: Number(row.total_meals),
    stability_pct: round2(stability),
    active_event: activeEventFrom(row),
    is_collapsed: frozen,
    collapse_ends_at: frozen ? row.collapse_ends_at : null,
    last_collapser_username: row.last_collapser_username,
    active_players_count: row.active_players_count,
  };
}

async function fetchPlayerMeals(
  sb: SupabaseClient,
  playerId: string,
): Promise<number> {
  const { data } = await sb
    .from("players")
    .select("meals_packed")
    .eq("id", playerId)
    .maybeSingle();
  return data ? Number(data.meals_packed) : 0;
}

function estimateCps(clicks: ClickPayload[]): number {
  if (clicks.length < 2) return clicks.length / 0.5;
  const ts = clicks.map((c) => c.timestamp);
  const span = (Math.max(...ts) - Math.min(...ts)) / 1000;
  if (span <= 0) return clicks.length / 0.5;
  return Math.min(40, clicks.length / span);
}

const MEAL_MILESTONES = [1000, 5000, 10000, 50000, 100000, 500000];

async function upsertPlayer(
  sb: SupabaseClient,
  playerId: string,
  username: string,
  mealsGained: number,
  sambalClicks: number,
  clicks: ClickPayload[],
  causedCollapse: boolean,
): Promise<number> {
  const { data: existing } = await sb
    .from("players")
    .select("meals_packed, sambal_clicks, collapses_caused, fastest_cps")
    .eq("id", playerId)
    .maybeSingle();

  const prevMeals = existing ? Number(existing.meals_packed) : 0;
  const prevSambal = existing ? Number(existing.sambal_clicks) : 0;
  const prevCollapses = existing ? Number(existing.collapses_caused) : 0;
  const prevCps = existing ? num(existing.fastest_cps) : 0;

  const newMeals = prevMeals + mealsGained;

  await sb.from("players").upsert(
    {
      id: playerId,
      username,
      meals_packed: newMeals,
      sambal_clicks: prevSambal + sambalClicks,
      collapses_caused: prevCollapses + (causedCollapse ? 1 : 0),
      fastest_cps: round2(Math.max(prevCps, estimateCps(clicks))),
      last_seen_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );

  const milestone = MEAL_MILESTONES.find(
    (t) => prevMeals < t && newMeals >= t,
  );
  if (milestone) {
    await postSystemMessage(
      `🏆 ${username} tembus ${milestone.toLocaleString("en-US")} meals! Pahlawan!`,
    );
  }

  return newMeals;
}

export async function postSystemMessage(message: string): Promise<void> {
  const sb = getSupabaseAdmin();
  await sb.from("chat_messages").insert({
    player_id: null,
    username: "SISTEM",
    message,
    is_system: true,
  });
}

/** POST /api/click — apply a batch of clicks; authoritative meals + stability. */
export async function applyClicks(
  playerId: string,
  username: string,
  clicks: ClickPayload[],
): Promise<ClickResponse> {
  const sb = getSupabaseAdmin();
  const row = await fetchStateRow(sb);
  const now = Date.now();

  // During the freeze window, reject all clicks.
  if (isFrozen(row)) {
    return {
      accepted_clicks: 0,
      new_total_meals: Number(row.total_meals),
      new_stability_pct: round2(num(row.stability_pct)),
      personal_meals: await fetchPlayerMeals(sb, playerId),
      collapsed: true,
      collapser: row.last_collapser_username,
      collapse_ends_at: row.collapse_ends_at,
    };
  }

  const event = getEvent(activeEventFrom(row)?.id ?? null);
  const players = Math.max(1, row.active_players_count);

  let stability = decayStability(
    num(row.stability_pct),
    now - new Date(row.updated_at).getTime(),
    players,
  );

  const sorted = [...clicks].sort((a, b) => a.timestamp - b.timestamp);
  let combo = 0;
  let lastTs = 0;
  let mealsGained = 0;
  let sambalClicks = 0;
  let collapsed = false;
  let collapseEndsAt: string | null = null;

  for (const c of sorted) {
    const gap = lastTs ? c.timestamp - lastTs : Infinity;
    if (gap <= COMBO.windowMs) combo += 1;
    else if (gap > COMBO.idleBreakMs) combo = 1;
    else combo = Math.max(1, combo);
    lastTs = c.timestamp;

    const lauk = getLauk(c.lauk);
    if (c.lauk === "sambal") sambalClicks += 1;
    mealsGained += clickMeals(lauk, combo, event);
    stability += clickStabilityDelta(lauk, combo, event);

    if (stability >= STABILITY.collapseThreshold) {
      collapsed = true;
      collapseEndsAt = new Date(
        now + STABILITY.collapseFreezeSec * 1000,
      ).toISOString();
      stability = 0;
      break; // box is down; ignore the rest of the batch
    }
  }

  stability = clamp(stability, 0, 100);
  const newTotal = Number(row.total_meals) + mealsGained;

  await sb
    .from("game_state")
    .update({
      total_meals: newTotal,
      stability_pct: round2(stability),
      updated_at: new Date(now).toISOString(),
      is_collapsed: collapsed,
      collapse_ends_at: collapsed ? collapseEndsAt : null,
      ...(collapsed ? { last_collapser_username: username } : {}),
    })
    .eq("id", 1);

  const personalMeals = await upsertPlayer(
    sb,
    playerId,
    username,
    mealsGained,
    sambalClicks,
    clicks,
    collapsed,
  );

  if (collapsed) {
    await postSystemMessage(
      `📢 ${username} baru ngerobohin kotak nasional. Malu-maluin.`,
    );
  }

  return {
    accepted_clicks: sorted.length,
    new_total_meals: newTotal,
    new_stability_pct: round2(stability),
    personal_meals: personalMeals,
    collapsed,
    collapser: collapsed ? username : row.last_collapser_username,
    collapse_ends_at: collapsed ? collapseEndsAt : null,
  };
}

/** POST /api/heartbeat — mark player active + refresh active player count. */
export async function heartbeat(
  playerId: string,
  username: string,
): Promise<number> {
  const sb = getSupabaseAdmin();
  await sb.from("players").upsert(
    { id: playerId, username, last_seen_at: new Date().toISOString() },
    { onConflict: "id" },
  );

  const since = new Date(Date.now() - 60_000).toISOString();
  const { count } = await sb
    .from("players")
    .select("id", { count: "exact", head: true })
    .gt("last_seen_at", since);

  const active = count ?? 1;
  await sb.from("game_state").update({ active_players_count: active }).eq("id", 1);
  return active;
}

// --- Chat -----------------------------------------------------------------

/** GET /api/chat — new messages after `sinceId`, else the last 30 (ascending). */
export async function getChatMessages(
  sinceId: number | null,
): Promise<ChatMessage[]> {
  const sb = getSupabaseAdmin();
  if (sinceId && sinceId > 0) {
    const { data, error } = await sb
      .from("chat_messages")
      .select("id, username, message, is_system, created_at")
      .gt("id", sinceId)
      .order("id", { ascending: true })
      .limit(50);
    if (error) throw error;
    return (data ?? []) as ChatMessage[];
  }
  const { data, error } = await sb
    .from("chat_messages")
    .select("id, username, message, is_system, created_at")
    .order("id", { ascending: false })
    .limit(30);
  if (error) throw error;
  return ((data ?? []) as ChatMessage[]).reverse();
}

/** POST /api/chat — insert a user message (caller cleans/validates first). */
export async function postUserMessage(
  playerId: string,
  username: string,
  message: string,
): Promise<void> {
  const sb = getSupabaseAdmin();
  await sb.from("chat_messages").insert({
    player_id: playerId,
    username,
    message,
    is_system: false,
  });

  // Opportunistic cleanup of messages older than 24h.
  if (Math.random() < 0.05) {
    const cutoff = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    await sb.from("chat_messages").delete().lt("created_at", cutoff);
  }
}

// --- Leaderboard ----------------------------------------------------------

const CATEGORY_COLUMN: Record<LeaderboardCategory, string> = {
  meals: "meals_packed",
  collapses: "collapses_caused",
  sambal: "sambal_clicks",
  cps: "fastest_cps",
  hero: "meals_packed",
};

/** GET /api/leaderboard — top players (active in last 24h) for a category. */
export async function getLeaderboard(
  category: LeaderboardCategory,
  limit: number,
): Promise<LeaderboardEntry[]> {
  const sb = getSupabaseAdmin();
  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const column = CATEGORY_COLUMN[category] ?? "meals_packed";

  const { data, error } = await sb
    .from("players")
    .select(
      "username, meals_packed, collapses_caused, sambal_clicks, fastest_cps",
    )
    .gt("last_seen_at", since)
    .order(column, { ascending: false })
    .limit(category === "hero" ? 100 : limit);
  if (error) throw error;

  const rows = (data ?? []) as Array<Record<string, number | string>>;

  if (category === "hero") {
    return rows
      .map((r) => ({
        username: String(r.username),
        value: Number(r.meals_packed) - Number(r.collapses_caused) * 100,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, limit);
  }

  return rows.map((r) => ({
    username: String(r.username),
    value: num(r[column]),
  }));
}

// --- Daily reset ----------------------------------------------------------

/** Zeroes the daily counters (run by the 00:00 WIB cron). */
export async function resetDaily(): Promise<void> {
  const sb = getSupabaseAdmin();
  await sb
    .from("players")
    .update({
      meals_packed: 0,
      collapses_caused: 0,
      sambal_clicks: 0,
      fastest_cps: 0,
    })
    .gte("created_at", "1970-01-01");

  await sb
    .from("game_state")
    .update({
      total_meals: 0,
      stability_pct: 0,
      last_collapser_username: null,
    })
    .eq("id", 1);

  await postSystemMessage(
    "📢 Hari baru. Papan peringkat nasional di-reset. Selamat mengemas, warga.",
  );
}

// --- Random events --------------------------------------------------------

async function logEvent(sb: SupabaseClient, eventType: string): Promise<void> {
  await sb.from("events_log").insert({ event_type: eventType, metadata: {} });
}

/**
 * POST /api/cron/trigger-event — called ~every minute. 20% chance to start a
 * new event (skips if one is already active). Returns the triggered id or null.
 */
export async function triggerRandomEvent(): Promise<{ triggered: string | null }> {
  const sb = getSupabaseAdmin();
  const row = await fetchStateRow(sb);
  const now = Date.now();

  // Skip if an event is still running.
  if (
    row.active_event_id &&
    row.active_event_ends_at &&
    new Date(row.active_event_ends_at).getTime() > now
  ) {
    return { triggered: null };
  }

  if (Math.random() > 0.2) return { triggered: null };

  const event = pickRandomEvent();

  // Instant event: mysterious donatur gifts a random recent player.
  if (event.instant) {
    const since = new Date(now - 120_000).toISOString();
    const { data } = await sb
      .from("players")
      .select("id, username, meals_packed")
      .gt("last_seen_at", since)
      .limit(50);
    const players = (data ?? []) as Array<{
      id: string;
      username: string;
      meals_packed: number | string;
    }>;

    if (players.length > 0) {
      const lucky = players[Math.floor(Math.random() * players.length)];
      await sb
        .from("players")
        .update({ meals_packed: Number(lucky.meals_packed) + 500 })
        .eq("id", lucky.id);
      await sb
        .from("game_state")
        .update({ total_meals: Number(row.total_meals) + 500 })
        .eq("id", 1);
      await postSystemMessage(
        `📢 DONATUR MISTERIUS muncul... ${lucky.username} dapet +500 instant!`,
      );
    } else {
      await postSystemMessage(event.systemMessage);
    }
    await logEvent(sb, event.id);
    return { triggered: event.id };
  }

  const endsAt = new Date(now + event.durationSec * 1000).toISOString();
  await sb
    .from("game_state")
    .update({ active_event_id: event.id, active_event_ends_at: endsAt })
    .eq("id", 1);
  await postSystemMessage(event.systemMessage);
  await logEvent(sb, event.id);
  return { triggered: event.id };
}
