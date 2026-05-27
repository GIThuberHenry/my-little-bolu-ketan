# TECH.md — Arsitektur & Implementasi

## Stack

| Layer | Tool | Reason |
|-------|------|--------|
| Framework | **Next.js 15** (App Router) | SSR-ready, gampang deploy, ekosistem rame |
| Hosting | **Vercel** | One-click deploy, free tier cukup |
| Database | **Supabase** (Postgres) | Free tier generous, dashboard enak, REST + JS SDK |
| Auth | None (UUID di localStorage) | Sengaja low-friction, vibe meme |
| Styling | **Tailwind CSS** | Cepet, no opinion fight |
| Animation | **Framer Motion** | Buat shake, collapse, transitions |
| Audio | **Howler.js** | Audio web yang ga bikin nangis |
| State | **Zustand** | Lebih simpel dari Redux, cukup buat ini |
| Polling | Native `setInterval` + fetch | No need React Query untuk skala ini |

## Arsitektur Tinggi

```
┌─────────────────────────────────────┐
│   Browser (Next.js Client)         │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  Game UI (React + Zustand)  │   │
│  │  - Click handler            │   │
│  │  - Local optimistic state   │   │
│  │  - Audio (Howler)           │   │
│  └──────────┬──────────────────┘   │
│             │                       │
│  ┌──────────▼──────────────────┐   │
│  │  Polling Layer (2s interval)│   │
│  │  - GET /api/state           │   │
│  │  - GET /api/chat            │   │
│  │  - GET /api/leaderboard     │   │
│  └──────────┬──────────────────┘   │
│             │                       │
│  ┌──────────▼──────────────────┐   │
│  │  Action Layer (on event)    │   │
│  │  - POST /api/click (batched)│   │
│  │  - POST /api/chat           │   │
│  └──────────┬──────────────────┘   │
└─────────────┼───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│   Next.js API Routes (Server)       │
│   - Validate request                │
│   - Rate limit                      │
│   - Update Supabase                 │
│   - Trigger events (cron-like)      │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│   Supabase (Postgres)               │
│   - game_state (single row)         │
│   - players                         │
│   - chat_messages                   │
│   - events                          │
│   - leaderboard_daily (materialized)│
└─────────────────────────────────────┘
```

## Database Schema

### `game_state` (single row, id=1)
Singleton row buat state global. Pake `UPDATE` aja, jangan insert.

```sql
CREATE TABLE game_state (
  id INT PRIMARY KEY DEFAULT 1,
  total_meals BIGINT DEFAULT 0,
  stability_pct NUMERIC(5,2) DEFAULT 0.0,  -- 0.00 to 100.00
  active_event_id TEXT,
  active_event_ends_at TIMESTAMPTZ,
  is_collapsed BOOLEAN DEFAULT FALSE,
  collapse_ends_at TIMESTAMPTZ,
  last_collapser_username TEXT,
  active_players_count INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

INSERT INTO game_state (id) VALUES (1);
```

### `players`
```sql
CREATE TABLE players (
  id UUID PRIMARY KEY,
  username TEXT NOT NULL,
  meals_packed BIGINT DEFAULT 0,
  collapses_caused INT DEFAULT 0,
  sambal_clicks BIGINT DEFAULT 0,
  fastest_cps NUMERIC(5,2) DEFAULT 0,
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_players_meals ON players(meals_packed DESC);
CREATE INDEX idx_players_collapses ON players(collapses_caused DESC);
CREATE INDEX idx_players_sambal ON players(sambal_clicks DESC);
CREATE INDEX idx_players_last_seen ON players(last_seen_at DESC);
```

### `chat_messages`
```sql
CREATE TABLE chat_messages (
  id BIGSERIAL PRIMARY KEY,
  player_id UUID REFERENCES players(id),
  username TEXT NOT NULL,
  message TEXT NOT NULL,
  is_system BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_recent ON chat_messages(created_at DESC);
```

Auto-cleanup: cron tiap jam, hapus message >24 jam. Atau pake Supabase scheduled function.

### `events_log` (Opsional, buat analytics)
```sql
CREATE TABLE events_log (
  id BIGSERIAL PRIMARY KEY,
  event_type TEXT,
  triggered_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB
);
```

### `leaderboard_daily` (View)
```sql
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
```

---

## API Endpoints

Semua di `app/api/*/route.ts`.

### `GET /api/state`
Return current game state. Dipanggil tiap 2 detik dari client.

**Response:**
```json
{
  "total_meals": 1284732,
  "stability_pct": 47.5,
  "active_event": {
    "id": "sambal_festival",
    "ends_at": "2026-05-27T10:30:00Z"
  },
  "is_collapsed": false,
  "collapse_ends_at": null,
  "last_collapser_username": "SambalEnjoyer69",
  "active_players_count": 142
}
```

### `POST /api/click`
Batch click submission dari client. **Important: rate limited.**

**Request:**
```json
{
  "player_id": "uuid",
  "username": "RajaAyam",
  "clicks": [
    { "lauk": "ayam", "timestamp": 1716800000000 },
    { "lauk": "ayam", "timestamp": 1716800000150 },
    { "lauk": "sambal", "timestamp": 1716800000300 }
  ]
}
```

**Response:**
```json
{
  "accepted_clicks": 3,
  "new_total_meals": 1284735,
  "new_stability_pct": 47.65,
  "personal_meals": 423
}
```

**Server-side validation:**
- Max 10 clicks per request (anti-spam batching)
- Max 1 request per 400ms per player
- Reject kalo `is_collapsed = true` (freeze period)
- Update stability bar berdasarkan jumlah click + lauk type
- Trigger collapse logic kalo stability >= 100
- Insert system message kalo collapse

### `GET /api/leaderboard?category=meals|collapses|sambal|hero|cps&limit=10`
Return top N players.

### `POST /api/chat`
Submit user message.

**Request:**
```json
{
  "player_id": "uuid",
  "username": "RajaAyam",
  "message": "ayo robohin"
}
```

**Validation:**
- Max 80 char
- Rate limit: 1 per 3 detik per player
- Filter wordlist (simple)

### `GET /api/chat?since=<timestamp>`
Poll new chat messages since timestamp. Default return 30 message terakhir.

### `POST /api/heartbeat`
Client kirim tiap 30 detik buat track active players. Update `last_seen_at`.

---

## Event Triggering (Cron-like)

Pake **Vercel Cron** atau Supabase scheduled function buat trigger random event.

`app/api/cron/trigger-event/route.ts` — protected dengan secret token, dipanggil tiap 1 menit:
- Cek kalo event sudah aktif → skip
- Random 20% chance trigger event baru
- Pilih random dari event pool (weighted)
- Insert ke `game_state.active_event_id`
- Post system message ke chat

Setup di `vercel.json`:
```json
{
  "crons": [
    { "path": "/api/cron/trigger-event", "schedule": "* * * * *" }
  ]
}
```

---

## Rate Limiting

Pake **Upstash Redis** atau **Vercel KV** buat rate limit (free tier cukup).

Alternatif paling simpel: in-memory Map di server (kelemahan: ga survive serverless cold start, tapi buat MVP OK).

Rules:
- `/api/click`: 1 request per 400ms per `player_id`
- `/api/chat`: 1 request per 3000ms per `player_id`
- `/api/state`: no limit (read-only, cache 1 detik di Vercel edge)
- `/api/heartbeat`: 1 per 25 detik per `player_id`

---

## State Management (Client)

Pake **Zustand** buat global state.

```ts
// store/gameStore.ts
interface GameStore {
  // Server state (synced via polling)
  totalMeals: number
  stabilityPct: number
  activeEvent: Event | null
  isCollapsed: boolean
  lastCollapser: string | null
  activePlayersCount: number

  // Local state
  username: string
  playerId: string
  selectedLauk: Lauk
  personalMeals: number
  comboCount: number
  pendingClicks: Click[]

  // Actions
  click: () => void
  setLauk: (lauk: Lauk) => void
  setUsername: (name: string) => void
  flushClicks: () => Promise<void>
}
```

## Polling Strategy

Hook `useGamePolling` di root layout:
- Tiap 2 detik: GET `/api/state` → update store
- Tiap 3 detik: GET `/api/chat?since=lastSeenTimestamp` → append messages
- Tiap 5 detik: GET `/api/leaderboard` → update leaderboard
- Pause polling kalo tab inactive (Page Visibility API) → save bandwidth

## Click Batching

Hook `useClickBatcher`:
- User click → push ke `pendingClicks` array, update local optimistic counter
- Tiap 500ms: kalo ada pending → POST `/api/click` dengan batch
- Server response → reconcile local state (kalo beda, server menang)

---

## File Structure (Suggested)

```
mbg-clicker/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                  # Main game screen
│   ├── api/
│   │   ├── state/route.ts
│   │   ├── click/route.ts
│   │   ├── chat/route.ts
│   │   ├── leaderboard/route.ts
│   │   ├── heartbeat/route.ts
│   │   └── cron/
│   │       └── trigger-event/route.ts
│   └── globals.css
├── components/
│   ├── game/
│   │   ├── MBGBox.tsx            # Kotak yang di-click
│   │   ├── StabilityBar.tsx
│   │   ├── LaukSelector.tsx
│   │   ├── ClickEffects.tsx      # Particle/number popup
│   │   └── CollapseOverlay.tsx
│   ├── leaderboard/
│   │   ├── Leaderboard.tsx
│   │   └── LeaderboardTab.tsx
│   ├── chat/
│   │   ├── BulletinBoard.tsx
│   │   └── ChatInput.tsx
│   ├── events/
│   │   └── EventBanner.tsx
│   ├── intro/
│   │   └── IntroModal.tsx
│   └── ui/
│       ├── GovDashboardFrame.tsx # Fake gov dashboard wrapper
│       └── StatTicker.tsx
├── lib/
│   ├── supabase.ts
│   ├── audio.ts                  # Howler wrappers
│   ├── username-generator.ts
│   ├── lauk-config.ts
│   ├── event-config.ts
│   └── rate-limit.ts
├── store/
│   └── gameStore.ts
├── hooks/
│   ├── useGamePolling.ts
│   ├── useClickBatcher.ts
│   ├── useHeartbeat.ts
│   └── useAudio.ts
├── public/
│   ├── audio/
│   │   ├── bgm.mp3
│   │   ├── sfx/
│   │   │   ├── click1.mp3
│   │   │   ├── click2.mp3
│   │   │   ├── collapse.mp3
│   │   │   └── ...
│   │   └── voice/
│   │       ├── normal/
│   │       ├── marah/
│   │       └── event/
│   └── images/
│       ├── kotak-mbg.svg
│       ├── lauk/
│       └── garuda-placeholder.png
└── ...
```

---

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=          # Server-side only
CRON_SECRET=                         # Buat protect cron endpoint
```

---

## Performance Notes

- Cache `/api/state` di Vercel edge dengan `Cache-Control: s-maxage=1`
- Supabase free tier: 500MB DB, 2GB egress/bulan. Cukup buat ribuan concurrent user.
- Audio file: compress ke <500KB tiap voice line. BGM bisa lebih besar tapi pre-load lazy.
- Image: pake SVG buat kotak & lauk, lebih ringan + scalable

---

## Anti-Cheat (Basic)

Karena no auth, cheating gampang. Mitigasi minimum:
- Server-side rate limit (paling penting)
- Validate click batch maksimal 10 click per 500ms
- Suspicious player (CPS >25 sustained) → soft shadow-ban (clicks counted lokal tapi ga global)
- Username filter (anti-spam)

**Tapi**: kalo ada yang mau curang, ya udah. Ini meme game, leaderboard ga serius.
