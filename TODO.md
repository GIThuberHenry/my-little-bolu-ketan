# TODO.md — Implementation Roadmap

Dibikin biar **Claude Code** bisa eksekusi step-by-step. Setiap milestone harusnya bisa kelar dalam 1-2 session, dan ada output yang bisa di-test.

---

## Milestone 0 — Setup (30 menit)

- [ ] `npx create-next-app@latest mbg-clicker --typescript --tailwind --app`
- [ ] Install dependencies:
  ```bash
  npm install zustand framer-motion howler @supabase/supabase-js
  npm install -D @types/howler
  ```
- [ ] Setup struktur folder sesuai TECH.md
- [ ] Buat project Supabase, copy URL + anon key ke `.env.local`
- [ ] Run schema SQL (lihat TECH.md) di Supabase SQL Editor
- [ ] Setup `lib/supabase.ts` dengan client + admin client
- [ ] Buat `tailwind.config.ts` dengan color palette dari VIBES.md
- [ ] Import Google Fonts (Playfair Display, Inter, JetBrains Mono) di `layout.tsx`
- [ ] `npm run dev` → halaman blank tapi jalan. ✅ Milestone done.

---

## Milestone 1 — Local Clicker (Offline-only, 1 sesi)

**Goal**: Player bisa klik kotak di layar, counter naik, tanpa server.

- [ ] Generate username random pas page load (`lib/username-generator.ts`)
- [ ] Simpen username + playerId ke localStorage
- [ ] Komponen `MBGBox.tsx` — gambar kotak (placeholder SVG), klik handler
- [ ] Komponen `ClickEffects.tsx` — floating "+1" pas klik, fade out
- [ ] Zustand store basic: `personalMeals`, `username`, `playerId`
- [ ] Layout split: kotak di tengah, sidebar kanan placeholder
- [ ] Live ticker di header (statis dulu)
- [ ] Test: klik → counter naik → refresh → counter persist (localStorage)

**Deliverable**: Halaman jalan, bisa klik, counter persistent lokal.

---

## Milestone 2 — Visual Polish & Style (1 sesi)

**Goal**: Aesthetic udah keliatan "fake gov dashboard" vibe.

- [ ] Setup color palette di Tailwind config
- [ ] Header: banner Garuda + judul kementerian + live ticker dummy
- [ ] Komponen `GovDashboardFrame.tsx` — wrapper dengan border tegas
- [ ] Stability bar UI (statis dulu, value hardcoded)
- [ ] Lauk selector UI dengan icon emoji
- [ ] Bulletin board placeholder (static fake messages)
- [ ] Leaderboard placeholder (static fake names)
- [ ] Animasi idle breathing di kotak (Framer Motion)
- [ ] Responsive: mobile usable (kotak tetap di tengah, panel collapse)
- [ ] Intro modal pertama kali buka

**Deliverable**: Visual udah keliatan vibe-nya, walaupun semua data dummy.

---

## Milestone 3 — Supabase Connection (1 sesi)

**Goal**: Click bisa sync ke server, global counter update.

- [ ] Setup Supabase schema (jalanin SQL dari TECH.md)
- [ ] Insert `game_state` initial row
- [ ] API route `POST /api/click` — accept batch, update DB
- [ ] API route `GET /api/state` — return current state
- [ ] Client: implement `useClickBatcher` hook (batch click, post tiap 500ms)
- [ ] Client: implement `useGamePolling` hook (poll state tiap 2 detik)
- [ ] Server: update `total_meals` di `game_state`
- [ ] Server: update `meals_packed` di `players` (upsert by player_id)
- [ ] Display global counter dari server state

**Deliverable**: Buka 2 tab → klik di satu tab → counter naik di tab lain (dengan delay 2 detik).

---

## Milestone 4 — Stability Bar & Collapse (1-2 sesi)

**Goal**: Mekanik utama jalan — stability turun, collapse trigger, freeze.

- [ ] Server: tiap click update `stability_pct` (+0.05% base, modifier sesuai lauk)
- [ ] Server: cron tiap 1 detik buat decay (recovery) — atau hitung di tiap request berdasarkan timestamp last update
- [ ] Server: detect kalo stability >= 100 → set `is_collapsed = true`, `collapse_ends_at`, `last_collapser_username`
- [ ] Server: increment `collapses_caused` ke player tersebut
- [ ] Client: render stability bar dengan warna sesuai stage (lihat SPEC §3)
- [ ] Client: kalo state.is_collapsed → freeze click, tampilin `CollapseOverlay`
- [ ] Client: countdown timer collapse
- [ ] Client: visual states kotak (shake, miring, alarm) sesuai stability
- [ ] System message ke chat pas collapse

**Deliverable**: Bareng-bareng spam click → bar penuh → KOTAK ROBOH → freeze → recover.

**⚠️ Tricky part**: recovery rate decay. Paling gampang: hitung di server tiap kali `/api/state` atau `/api/click` dipanggil — `new_stability = max(0, current - (2 * seconds_elapsed))`. Update `updated_at` tiap perubahan.

---

## Milestone 5 — Lauk System (0.5 sesi)

**Goal**: Lauk berbeda kasih efek berbeda.

- [ ] `lib/lauk-config.ts` — konfigurasi semua lauk + efek
- [ ] Client: state `selectedLauk` (Zustand + localStorage)
- [ ] Client: kirim `lauk` di tiap click ke server
- [ ] Server: terapin efek lauk (multiplier, instability modifier)
- [ ] Server: track `sambal_clicks` per player buat leaderboard
- [ ] UI: lauk selector dengan tooltip efek

**Deliverable**: Pilih sambal → bar naik lebih cepet. Pilih nasi → recovery lebih cepet.

---

## Milestone 6 — Chat / Bulletin Board (1 sesi)

**Goal**: User bisa chat, system message muncul.

- [ ] API route `POST /api/chat` — validate, insert message
- [ ] API route `GET /api/chat?since=` — return new messages
- [ ] Client: poll chat tiap 3 detik
- [ ] Client: input box, max 80 char, rate limit info
- [ ] Client: render messages dengan animasi slide-in
- [ ] Server: auto-post system messages (collapse, achievement, event)
- [ ] Filter wordlist basic (file `lib/wordlist.ts`)
- [ ] Auto-cleanup chat lama (Supabase function atau on-write check)

**Deliverable**: Buka 2 tab → kirim chat di satu → muncul di lain.

---

## Milestone 7 — Leaderboard (0.5 sesi)

**Goal**: Top players di-tampilkan, switchable category.

- [ ] API route `GET /api/leaderboard?category=X`
- [ ] Client: panel leaderboard dengan tab category
- [ ] Client: poll tiap 5 detik
- [ ] Highlight username sendiri di list
- [ ] Daily reset cron: `app/api/cron/reset-daily/route.ts` jam 00:00 WIB

**Deliverable**: Klik banyak → muncul di top 10 meals packed.

---

## Milestone 8 — Random Events (1 sesi)

**Goal**: Event muncul otomatis, modify gameplay.

- [ ] `lib/event-config.ts` — semua event + efek
- [ ] API route `POST /api/cron/trigger-event` — random pick event
- [ ] Setup Vercel Cron tiap 1 menit
- [ ] Server: pas event aktif, terapin modifier ke click logic
- [ ] Client: tampil `EventBanner` di atas kotak pas event aktif
- [ ] Client: countdown timer event
- [ ] System message ke chat pas event start/end
- [ ] Visual effect per event (overlay color, particle, dll — minimal aja dulu)

**Deliverable**: Tunggu beberapa menit → event muncul → gameplay berubah → event hilang.

---

## Milestone 9 — Audio (0.5-1 sesi)

**Goal**: BGM + SFX + voice line jalan.

- [ ] Setup Howler.js wrapper di `lib/audio.ts`
- [ ] Load BGM, loop, autoplay setelah first user click
- [ ] Click SFX (random dari pool)
- [ ] Collapse SFX
- [ ] Voice line: pas collapse, pas event
- [ ] Mute toggle UI di pojok
- [ ] Volume slider (optional)
- [ ] Test di mobile (autoplay policy beda)

**Deliverable**: Audio jalan tanpa bikin browser ngamuk.

---

## Milestone 10 — Polish & Easter Eggs (1 sesi)

- [ ] Konami code easter egg
- [ ] Dynamic tab title (player count, collapse status)
- [ ] Console.log secret message
- [ ] Achievement system + system message
- [ ] Empty states copy
- [ ] Error handling UI yang lucu
- [ ] Loading states yang ga ngebosenin
- [ ] Skeleton screens kalo perlu
- [ ] Mobile UX final check

**Deliverable**: Polish 80%, siap di-share ke temen.

---

## Milestone 11 — Deploy (30 menit)

- [ ] Setup environment variables di Vercel
- [ ] Setup Vercel Cron di `vercel.json`
- [ ] Push ke GitHub
- [ ] Connect repo ke Vercel
- [ ] Deploy
- [ ] Test di production URL
- [ ] Setup custom domain (opsional)

**Deliverable**: URL public bisa di-share.

---

## Estimated Total: ~10-12 sesi (1-2 minggu kerja santai)

## Prioritas Kalo Mau Cepet (MVP minimum)

Kalo mau **dirty MVP buat test** (1-2 hari):
- Milestone 0, 1, 3, 4 doang
- Skip chat, leaderboard, event, audio
- Polish visual super minimal

Sudah cukup buat ngerasain core fun loop.

---

## Catatan Buat Claude Code

**Pas implementasi**:
- Selalu reference `SPEC.md` buat detail mechanic
- Reference `VIBES.md` buat copywriting & color
- Jangan over-engineer — ini meme game, bukan SaaS
- Pake server actions atau API routes — terserah, yang penting jalan
- Test multi-tab tiap milestone yang ada server sync
- Mobile-friendly dari awal, jangan retro-fit di akhir

**Kalo stuck**:
- Decay logic stability bar paling tricky → hitung lazy di tiap request based on timestamp diff
- Rate limit di serverless → pake Upstash Redis kalo Vercel KV ribet
- Audio autoplay → pasti butuh user interaction first, ga ada cara lain
