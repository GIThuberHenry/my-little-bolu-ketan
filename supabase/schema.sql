-- MBG Clicker — database schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query).
-- Mirrors TECH.md §"Database Schema". Safe to re-run (uses IF NOT EXISTS / OR REPLACE).

-- =========================================================================
-- game_state — singleton row (id = 1) holding global state.
-- Always UPDATE this row; never INSERT a second one.
-- =========================================================================
CREATE TABLE IF NOT EXISTS game_state (
  id INT PRIMARY KEY DEFAULT 1,
  total_meals BIGINT DEFAULT 0,
  stability_pct NUMERIC(5, 2) DEFAULT 0.0, -- 0.00 to 100.00
  active_event_id TEXT,
  active_event_ends_at TIMESTAMPTZ,
  is_collapsed BOOLEAN DEFAULT FALSE,
  collapse_ends_at TIMESTAMPTZ,
  last_collapser_username TEXT,
  active_players_count INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- Seed the singleton row if it doesn't exist yet.
INSERT INTO game_state (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- =========================================================================
-- players — one row per player (UUID generated client-side, no auth).
-- =========================================================================
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY,
  username TEXT NOT NULL,
  meals_packed BIGINT DEFAULT 0,
  collapses_caused INT DEFAULT 0,
  sambal_clicks BIGINT DEFAULT 0,
  fastest_cps NUMERIC(5, 2) DEFAULT 0,
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_players_meals ON players (meals_packed DESC);
CREATE INDEX IF NOT EXISTS idx_players_collapses ON players (collapses_caused DESC);
CREATE INDEX IF NOT EXISTS idx_players_sambal ON players (sambal_clicks DESC);
CREATE INDEX IF NOT EXISTS idx_players_last_seen ON players (last_seen_at DESC);

-- =========================================================================
-- chat_messages — user chat + system broadcasts. Last ~100 kept.
-- =========================================================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id BIGSERIAL PRIMARY KEY,
  player_id UUID REFERENCES players (id),
  username TEXT NOT NULL,
  message TEXT NOT NULL,
  is_system BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_recent ON chat_messages (created_at DESC);

-- =========================================================================
-- events_log — optional analytics of triggered random events.
-- =========================================================================
CREATE TABLE IF NOT EXISTS events_log (
  id BIGSERIAL PRIMARY KEY,
  event_type TEXT,
  triggered_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB
);

-- =========================================================================
-- leaderboard_daily — view of players active in the last 24h.
-- collapses count heavily against the composite hero score.
-- =========================================================================
CREATE OR REPLACE VIEW leaderboard_daily AS
SELECT
  username,
  meals_packed,
  collapses_caused,
  sambal_clicks,
  (meals_packed - collapses_caused * 100) AS hero_score
FROM players
WHERE last_seen_at > NOW() - INTERVAL '24 hours'
ORDER BY meals_packed DESC;
