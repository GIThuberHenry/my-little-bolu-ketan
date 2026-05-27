# MBG CLICKER 🍱

> Sebuah eksperimen sosial internet Indonesia yang dibungkus jadi game clicker multiplayer.

## What is this?

MBG Clicker adalah browser game clicker bertema "MBG (Makan Bergizi Gratis) food distribution" — chaotic, absurd, dan community-driven. Player bareng-bareng ngeklik kotak makan buat "pack meals", tapi kalo terlalu semangat → kotaknya roboh, dan semua orang nyari kambing hitam.

## Tone & Vibe

- **Absurd, lucu, sedikit chaos**
- Aestetik **"fake government dashboard"** + meme energy Indonesia
- Intentionally **low-stakes & lowbrow**
- UI **playful, sedikit cluttered, ga over-polished**
- Goal: bikin orang mikir *"kok ini lucu sih?"* trus share ke temen

## Core Loop

1. User buka website → liat kotak MBG raksasa di tengah
2. Klik/tap kotak → counter naik, score nambah, lauk masuk
3. Liat counter global, leaderboard, chat live di samping
4. Random event ganggu sesekali (Rice Shortage, Sambal Festival, dll)
5. Kalo collective click rate kelewat tinggi → **KOTAK ROBOH** → chaos → recovery
6. Repeat

## Stack

- **Next.js** (App Router) deployed di Vercel
- **Supabase** buat database + auth ringan
- **Polling 2 detik** buat sync state (no realtime websocket, see TECH.md)
- **Tailwind** + sedikit framer-motion buat animasi
- **Howler.js** buat audio

## Files

- [`SPEC.md`](./SPEC.md) — game mechanics & fitur lengkap
- [`TECH.md`](./TECH.md) — arsitektur, database schema, API design
- [`VIBES.md`](./VIBES.md) — visual style, copywriting, sample text Indonesia
- [`TODO.md`](./TODO.md) — milestone & task breakdown buat implementasi

## Menjalankan (Development)

Project-nya ada langsung di **root repo** ini (Next.js 16 + React 19 + Tailwind v4 + Zustand + Framer Motion + Howler).

```bash
npm install
npm run dev        # http://localhost:3000
```

Tanpa Supabase, game tetap jalan dalam **mode lokal (offline)** — klik, combo, stabilitas, sampai collapse semua disimulasikan di browser (localStorage). Server sync (counter global, chat, leaderboard, event acak) nyala otomatis begitu env Supabase diisi.

### Setup Supabase (buat mode online)

1. Buat project di [supabase.com](https://supabase.com/dashboard).
2. SQL Editor → tempel & jalankan `supabase/schema.sql`.
3. Settings → API → salin Project URL + anon key + service_role key.
4. Copy `.env.example` jadi `.env.local`, isi:
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (publik)
   - `SUPABASE_SERVICE_ROLE_KEY` (server-only — jangan dibocorin)
   - `CRON_SECRET` (string random buat proteksi endpoint cron)
5. Restart `npm run dev`.

### Audio (opsional)

File audio sifatnya user-provided — taruh di `public/audio/` (lihat `public/audio/README.md`). Tanpa file, audio diam aja, ga bikin error.

## Deploy ke Vercel

1. Push repo ke GitHub.
2. Import repo di Vercel (Root Directory = root repo).
3. Isi 4 Environment Variables di atas di project settings.
4. Cron (`vercel.json`) otomatis aktif: `trigger-event` tiap menit, `reset-daily` tiap 00:00 WIB (17:00 UTC). Keduanya diproteksi `CRON_SECRET`.
5. Deploy → bagikan URL-nya. 🍱

## Disclaimer

Proyek ini pake referensi audio publik (suara Pak Bahlil, dll) sebagai meme. Resiko hak cipta ditanggung sendiri kalo viral. Sediain mekanisme buat replace audio gampang (cuma ganti file di `/public/audio/`) kalo perlu takedown.
