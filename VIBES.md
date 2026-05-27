# VIBES.md — Visual Style & Copywriting

## Core Vibe

**"Bizarre Indonesian internet social experiment yang dibungkus jadi fake government dashboard."**

Bayangin: web BPS atau Kemenko di-hack sama anak Twitter Indonesia. Serius tapi nggak serius. Polished di permukaan, chaos di dalem.

---

## Visual Language

### Header / Top Bar
- Fake government banner: "REPUBLIK INDONESIA — KEMENTERIAN MAKAN BERGIZI GRATIS"
- Logo Garuda placeholder (atau pake emoji 🦅 / SVG bikinan sendiri)
- Live ticker stats di bawah header — ala running text di TV nasional:
  > `LIVE: 1,284,732 meals packed nationally • 142 warga aktif • Stabilitas: 47%`
- Font header: serif tebal (Playfair / Merriweather), kontras dengan body yang sans-serif

### Color Palette

**Primary (govt-ish)**:
- `#C9302C` — Merah Indonesia
- `#FFFFFF` — Putih
- `#1A1A1A` — Hitam-keabuan buat text

**Secondary (chaos)**:
- `#FFB400` — Kuning warning
- `#16A34A` — Hijau event positif
- `#F97316` — Oranye instability
- `#7C3AED` — Ungu buat lauk_misterius

**Accent**:
- `#FFF5DC` — Cream background ala kertas pemerintah
- `#FCD34D` — Highlight emas buat achievement

### Typography
- Headers: **Playfair Display** atau **Merriweather** (serif, formal)
- Body: **Inter** atau **DM Sans** (clean sans-serif)
- Stats / numbers: **JetBrains Mono** atau **Space Mono** (monospace, kasih kesan "data dashboard")
- Username & meme text: bisa pake **Bebas Neue** atau yang chunky biar punchy

### Layout Principles
- **Sengaja agak cluttered tapi readable** — beberapa box, beberapa stat panel
- Border yang tegas (1-2px solid), bukan shadow-shadow lembut
- Sudut tajam atau radius kecil aja (2-4px), bukan rounded-full
- Spasi konsisten tapi ga over-generous

### Animation
- Kotak MBG: idle breathing animation (scale 1.00 → 1.02 → 1.00, 3 detik loop)
- Click effect: floating "+1" numbers naik ke atas, fade out (0.8 detik)
- Stability bar: smooth transition warna (hijau → kuning → oranye → merah)
- Collapse: kotak rotate -90deg + drop + makanan particle burst
- Event banner: slide in dari atas, ada shake halus
- Chat message baru: slide up dari bawah, highlight kuning sebentar

---

## Sample UI Copywriting

### Header
- `REPUBLIK INDONESIA`
- `KEMENTERIAN MAKAN BERGIZI GRATIS`
- `DASHBOARD OPERASIONAL NASIONAL`

### Live Stats Ticker (rotating)
- `MEALS TERKEMAS HARI INI: 1,284,732`
- `WARGA AKTIF MENGEMAS: 142`
- `STABILITAS KOTAK NASIONAL: 47.5%`
- `LAUK FAVORIT MINGGU INI: AYAM`
- `ROBOH HARI INI: 23 kali`

### Tombol & Label
| English | Indonesia (vibe-checked) |
|---------|--------------------------|
| Click to pack | `KEMAS SEKARANG` / `PACK!` |
| Leaderboard | `PAPAN PERINGKAT NASIONAL` |
| Chat | `BULETIN WARGA` |
| Username | `NAMA WARGA` |
| Change name | `GANTI IDENTITAS` |
| Select lauk | `PILIH LAUK` |
| Total meals | `TOTAL TERKEMAS` |
| Stability | `STABILITAS NASIONAL` |
| Active event | `OPERASI BERLANGSUNG` |

### Stability Bar Labels (by stage)
- 0-30%: `✅ STABIL`
- 30-60%: `😐 SEDIKIT GOYANG`
- 60-85%: `⚠️ KOTAK MIRING`
- 85-99%: `🚨 BAHAYA — JANGAN SEMANGAT KELEWAT`
- 100%: `💥 ROBOH`

### Collapse Overlay
- Headline: `🚨 KOTAK NASIONAL ROBOH 🚨`
- Sub: `Penyebab: [USERNAME]`
- Bottom: `Operasi dihentikan sementara. Mohon bersabar.`
- Countdown: `Buka kembali dalam: 0:09`

### Event Banner Copy

| Event | Banner Text |
|-------|-------------|
| Rice Shortage | `🍚 KRISIS BERAS NASIONAL — Produksi nasi -50%` |
| Sambal Festival | `🌶️ FESTIVAL SAMBAL — Sambal multiplier 2x!` |
| Bonus Protein Hour | `💪 JAM PROTEIN BONUS — Ayam & telur double meal!` |
| National Hunger Emergency | `🆘 DARURAT LAPAR NASIONAL — Semua click 3x, tapi stabilitas drop cepet!` |
| Telur Inflation | `🥚 INFLASI TELUR — Telur jadi setengah meal aja` |
| Mysterious Donatur | `🎁 DONATUR MISTERIUS muncul... [USERNAME] dapet +500 instant!` |
| Spice Instability | `🌶️ INSTABILITAS REMPAH NASIONAL — Stabilitas drop 2x cepet` |
| Ayam Mogok | `🐔 AYAM NASIONAL MOGOK — Click ayam ga ngehasilin meal` |

### System Chat Messages (Examples)

**Collapse:**
- `📢 [USERNAME] baru ngerobohin kotak nasional. Malu-maluin.`
- `📢 [USERNAME] adalah penyebab kerobohan ke-23 hari ini.`
- `📢 KOTAK ROBOH. Pak Menteri sedang murka.`

**Achievement:**
- `🏆 [USERNAME] tembus 1000 meals! Pahlawan!`
- `🏆 [USERNAME] resmi jadi Raja Lauk minggu ini.`
- `🏆 [USERNAME] tembus 100 collapse caused. Legenda kelam.`

**Random ambient:**
- `📢 Stok ayam nasional menipis.`
- `📢 Pak Bahlil sedang inspeksi mendadak.`
- `📢 Sambal lagi diskon di kantin sebelah.`
- `📢 Warga, tenang, ini cuma simulasi.`

### Intro Modal Copy

**Step 1:**
> # SELAMAT DATANG
> 
> Anda adalah warga negara terpilih untuk operasi MAKAN BERGIZI GRATIS NASIONAL.
> 
> Tugas Anda sederhana: **KEMAS MAKANAN**.

**Step 2:**
> # PERINGATAN
> 
> Kalo Anda kelewat semangat ngeklik, kotak nasional **akan roboh**.
> 
> Dan nama Anda akan diumumkan ke seluruh negeri.

**Step 3:**
> # MULAI OPERASI
> 
> Identitas warga Anda: **[USERNAME]**
> 
> [Ganti Identitas] [MULAI MENGEMAS →]

### Empty States
- Leaderboard kosong: `Belum ada warga yang ngemas hari ini. Anda berkesempatan jadi pelopor!`
- Chat kosong: `Buletin warga masih sepi. Sapa dulu kek.`

### Loading / Error
- Loading: `Memuat data nasional...`
- Error: `Server pusing. Coba refresh ya warga.`
- Offline: `Koneksi terputus. Operasi pause.`

---

## Easter Eggs (Suggested)

Hal kecil yang bikin orang senyum:

1. **Konami code**: trigger animasi makanan terbang di seluruh layar
2. **Click kotak 1000x sendirian**: unlock badge "Solo Operator"
3. **Pilih sambal 100x berturut-turut**: chat auto-post `[USERNAME] sudah terlalu banyak sambal. Disarankan minum susu.`
4. **Buka jam 00:00**: muncul popup `Anda begadang demi negara. Terima kasih.`
5. **Jumat malem**: BGM auto ganti ke versi remix (kalo ada)
6. **Tab title** ganti dinamis: `(142 warga) MBG Operasional` / kalo collapse: `🚨 ROBOH 🚨`
7. **Console.log** ada pesen rahasia buat dev yang buka inspect: `Halo dev. Selamat datang di simulasi. Jangan curang ya.`

---

## Tone of Voice

**DO:**
- Singkat, punchy
- Gunakan bahasa internet Indonesia ("warga", "anjir" dihindari tapi vibe-nya boleh)
- Formal-but-not-really ("Diharapkan partisipasi aktif Anda dalam mengemas")
- Self-aware ("ya kita tau ini absurd")
- Mix EN+ID natural ("LIVE: 142 warga aktif")

**DON'T:**
- Terlalu serius / corporate
- Terlalu cringe / forced "anak gaul"
- Politis beneran (sindir boleh, tapi jangan partisan)
- Offensive (rasis, seksis, dll — no thanks)
- Gen-Z slang inggris yang ga matching ("slay", "no cap")

---

## Visual Reference Mood
Bayangin campuran:
- 🏛️ BPS / Kemenkeu website (formal grid, banyak stat)
- 📺 TV nasional running text
- 🇮🇩 Iklan Layanan Masyarakat 90an (warna kuat, font tegas)
- 💀 Twitter/X Indonesia (chaos, meme, semua pake huruf gede sesekali)
- 🎮 Cookie Clicker (clicker UX dasar, tapi vibe beda)
