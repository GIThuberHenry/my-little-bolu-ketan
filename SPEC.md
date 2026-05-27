# SPEC.md — Game Mechanics

## 1. Player System

### Username
- **Tanpa akun**. Pas pertama buka, user generate username random ala Indonesia, contoh:
  - `RajaAyam`, `MenteriNasi`, `SambalEnjoyer`, `TukangBungkus`, `BocahLauk`, `BapakKotak`, `IbuTempe`
- Simpen di `localStorage` (key: `mbg_username`)
- Player ID juga di-generate (UUID), simpen di `localStorage` (key: `mbg_player_id`)
- Tombol "Ganti Nama" tersedia, generate ulang random atau ketik manual (maks 16 char, ga boleh kosong, filter kata kasar minimal)
- **Catatan**: karena no auth, anti-cheat lemah. Itu OK — ini game meme, bukan kompetisi serius.

### Format Username Generator
Pattern: `[Prefix][Noun]` atau `[Adjective][Noun][Number]`
- Prefixes: `Raja`, `Menteri`, `Bapak`, `Ibu`, `Tukang`, `Bocah`, `Pak`, `Bu`, `Kang`, `Mas`, `Mbak`, `Juragan`
- Nouns: `Ayam`, `Nasi`, `Tempe`, `Telur`, `Sambal`, `Lauk`, `Kotak`, `Bungkus`, `Mie`, `Tahu`, `Sayur`, `Kerupuk`
- Adjectives: `Enjoyer`, `Lover`, `Hater`, `Master`, `Pro`, `Sultan`

---

## 2. Click Mechanic

### Per-click
- Tiap klik tambahin: **+1 meal packed** ke score player dan global counter
- **Click batching**: client kumpulin click selama 500ms, baru POST ke server (kurangin spam request)
- Local optimistic update: counter langsung naik di UI, ga nunggu server response

### Score Multiplier
- Multiplier default: **1x**
- Bisa naik karena: random event aktif, lauk bonus, combo (lihat di bawah)

### Combo System (Opsional, nice-to-have)
- Klik dalam interval <300ms ngebangun combo counter
- Combo x10 = bonus +50%
- Combo x25 = bonus +100%
- Combo putus kalo idle >1 detik
- **Tapi**: combo tinggi nambahin instability lebih cepet (lihat collapse mechanic)

---

## 3. ⭐ BOX COLLAPSE MECHANIC (Core)

Ini fitur paling penting. Bikin tension dan emergent social behavior.

### Stability Bar (Global)
- Ada bar global di UI bagian atas: **"STABILITAS NASIONAL"** (0-100%)
- Bar **naik** otomatis (recovery) **+2% per detik**
- Tiap click dari semua player **nambahin instability**:
  - +0.05% per click base
  - +0.1% kalo lagi combo x10+
  - +0.2% kalo ada efek "sambal overload"

### Visual States (Berdasarkan Stability)
1. **0-30%**: ✅ STABIL (idle animation: kotak bernafas pelan)
2. **30-60%**: 😐 SEDIKIT GOYANG (shake halus, warna kuning di bar)
3. **60-85%**: ⚠️ MIRING (kotak miring, screen shake ringan, warna oranye)
4. **85-99%**: 🚨 KRITIS (alarm visual merah berkedip, sound siren, "BAHAYA!" overlay)
5. **100%**: 💥 **COLLAPSE!**

### Collapse Event
Kalo bar nyentuh 100%:
- **Click freeze 10 detik** — semua user ga bisa klik
- Animasi: kotak roboh, makanan tumpah ke layar (particle effect simpel pake CSS/SVG)
- Overlay full-screen: "🚨 KOTAK NASIONAL ROBOH 🚨"
- **Audio**: trigger random Bahlil voice line ("kategori marah/panik")
- **Player terakhir yang ngeklik** sebelum collapse → namanya muncul di announcement:
  > `🚨 KOTAK ROBOH KARENA: [USERNAME] 🚨`
- Nama itu masuk leaderboard "Penyebab Kotak Roboh" (+1 point)
- Sistem post otomatis ke chat: `📢 [USERNAME] baru aja ngerobohin kotak nasional. Malu-maluin.`
- Stability reset ke 0%
- Setelah 10 detik freeze → resume normal

### Recovery Rate Scaling
Biar fair pas user banyak, recovery rate sedikit naik berdasarkan player aktif:
- `recovery_per_sec = 2 + (active_players * 0.1)` capped at 8%

---

## 4. Lauk System

User bisa milih lauk yang lagi dipacking. Default: **ayam**.

### Lauk List
| Lauk | Effect | Visual |
|------|--------|--------|
| `ayam` | Default, +1 per click | 🍗 |
| `telur` | +1, kadang muncul 2 (10% chance) | 🥚 |
| `tempe` | +1, ga ada efek spesial (people's lauk) | 🟫 |
| `mie` | +2 tapi recovery global -1% per click | 🍜 |
| `sambal` | +1, **nambah instability 2x** (chaos boost) | 🌶️ |
| `nasi` | +1, recovery global +0.5% per click (peacekeeper) | 🍚 |
| `lauk_misterius` | ??? Random effect tiap klik | 🎁 |

### UI
- Bar tombol di bawah kotak, ikon lauk
- Tap buat pilih (radio behavior, satu aktif)
- Ada tooltip kecil pas hover: "🌶️ Sambal — chaos amplifier"

### Sambal Overload (Sub-event)
Kalo >30% click global pake sambal dalam 30 detik → trigger event **"NATIONAL SPICE INSTABILITY"** (lihat random events)

---

## 5. Leaderboard

### Kategori
1. 🏆 **Most Meals Packed** (top 10)
2. ⚡ **Fastest Clicker** (highest CPS dalam 10 detik window)
3. 💥 **Penyebab Kotak Roboh** (most collapses caused)
4. 🌶️ **Raja Lauk** (most sambal clicks)
5. 🦸 **National Hero** (composite score: meals - collapses caused)

### Reset Cycle
- **Daily reset** jam 00:00 WIB
- Hall of fame buat all-time top 3 tiap kategori (display di tab terpisah)

### UI
- Sidebar/panel di kanan, switchable tabs antar kategori
- Username highlighted kalo si user lagi liat sendiri di list
- Real number, no rounding (`12,847 meals` bukan `12K`)

---

## 6. Bulletin Board / Live Chat

### Tipe Message
1. **User chat** — pesan dari player
2. **System messages** — broadcast auto dari event/collapse
3. **Achievement messages** — auto-post kalo someone milestone

### UI
- Panel di kanan bawah atau kiri
- Auto-scroll ke bawah
- Maks 50 message visible, lama-lama fade out
- Animasi: message baru slide-in dari bawah

### User Chat Rules
- Maks **80 karakter** per pesan
- Rate limit: **1 pesan per 3 detik** per player
- Filter kata kasar minimal (simple wordlist, ga perlu canggih)
- Format: `[USERNAME] [pesan]` dengan warna username random tapi konsisten per user

### System Messages (Examples)
- `📢 [USERNAME] ngerobohin kotak nasional. Malu-maluin.`
- `📢 STOK AYAM NASIONAL MENIPIS`
- `📢 [USERNAME] mencapai 1000 meals packed!`
- `📢 SAMBAL FESTIVAL DIMULAI! Multiplier 2x semua click pakai sambal!`
- `📢 [USERNAME] jadi Raja Lauk baru!`

### Reactions (Nice-to-have)
- Click pesan → react `🤣 😡 🙏 💀` (cuma visual, ga disimpan, frontend-only)

---

## 7. Random Events

Event trigger otomatis dari server tiap **3-8 menit random**, durasi 30-90 detik.

### Event List

| Event | Effect | Duration | Visual |
|-------|--------|----------|--------|
| 🍚 **Rice Shortage** | Click nasi -50%, multiplier turun | 60s | Banner kuning |
| 🌶️ **Sambal Festival** | Click sambal 2x | 45s | Layar merah pulsing |
| 💪 **Bonus Protein Hour** | Ayam & telur 2x | 90s | Banner hijau |
| 🆘 **National Hunger Emergency** | SEMUA click 3x, tapi instability 2x | 30s | Alarm merah |
| 🥚 **Telur Inflation** | Telur jadi +0.5 (drop dari +1) | 60s | Banner abu |
| 🎁 **Mysterious Donatur** | Random user dapet +500 instant | 1 click | Particle gold |
| 🌶️ **National Spice Instability** | (sub-event sambal overload) | 30s | Screen tilt + smoke effect |
| 🐔 **Ayam Nasional Mogok** | Click ayam ga ngehasil meal | 45s | Ayam icon dicoret |

### UI
- Banner besar muncul di atas kotak pas event aktif
- Countdown timer
- System message ke chat
- Audio cue (voice line / sound effect)

---

## 8. Audio System

### Background Music
- BGM lagu "Bahlil" (file user-provided, simpan di `/public/audio/bgm.mp3`)
- Loop continuous, volume default 30%
- Tombol mute/unmute di pojok (state simpen di localStorage)
- **Autoplay**: cuma jalan setelah user click pertama (browser policy)

### Sound Effects
- `click.mp3` — pas klik (variasi 3-4 file biar ga bosen, random pick)
- `collapse.mp3` — pas kotak roboh
- `event_start.mp3` — pas event mulai
- `achievement.mp3` — pas milestone
- `alarm.mp3` — pas stability >85%

### Voice Lines (Bahlil)
Simpan di `/public/audio/voice/` — kategorikan:
- `voice/normal/` — di-trigger random tiap 60-120 detik kalo stable
- `voice/marah/` — di-trigger pas collapse
- `voice/event/` — di-trigger pas event spesifik (mapping di config)

User-uploaded files. Kalo perlu takedown, tinggal hapus folder.

### Audio Mixing
- Pake **Howler.js** (gampang buat layering audio web)
- Separate channels: bgm, sfx, voice — bisa di-mute terpisah

---

## 9. State Persistence

### Server (Supabase)
- Global counter (meals total)
- Stability bar (current %)
- Active event (if any)
- All player scores
- Leaderboard data
- Recent chat messages (last 100)

### Client (localStorage)
- `mbg_username`
- `mbg_player_id`
- `mbg_audio_muted` (boolean)
- `mbg_audio_volume` (0-1)
- `mbg_selected_lauk` (default: ayam)
- `mbg_personal_meals_packed` (untuk display offline)
- `mbg_seen_intro` (boolean — tutorial sekali aja)

---

## 10. Intro / Onboarding

Pertama kali buka:
- Modal popup: "SELAMAT DATANG DI MBG NASIONAL"
- 3 step quick tutorial (skippable):
  1. "Klik kotak buat pack meal"
  2. "Jangan kelewat semangat — kotaknya bisa roboh"
  3. "Bareng-bareng jadi pahlawan nasional. Atau penyebab kerobohan. Terserah."
- Username generated di-show, kasih opsi ganti
- Tombol "MULAI" → masuk gameplay

---

## 11. Non-Goals (Buat Clarity)

Hal yang **TIDAK** kita bangun di versi pertama:
- ❌ User account dengan email/password
- ❌ Realtime websocket (pake polling aja)
- ❌ Mobile app native (web responsive cukup)
- ❌ In-game purchase atau monetization
- ❌ Sistem level/XP/unlock kompleks
- ❌ PvP / private rooms
- ❌ Friend system
- ❌ Anti-cheat sophisticated (rate limit basic aja)
