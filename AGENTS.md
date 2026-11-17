# Pulau Kita — Master Context (Arah Publik & Multi-Tenant)

## Apa ini
Game pixel art 2D cozy-romantis + humor dengan universe 3 lapisan:
1. **Pulau Pribadi (Multi-tenant):** Tiap pasangan/pemain punya pulau sendiri (rumah, dekor, kebun, jurnal). Diundang lewat kode/link (maks 2-4 anggota).
2. **Plaza Publik:** Hub bersama (Kedai Bakso, papan pengumuman, Tugu Pasangan Pendiri "Ay & Fauzan"). Realtime max 20 pemain/instance, komunikasi HANYA lewat Emote & Toot (tanpa chat bebas).
3. **Kunjungan:** Orang bisa bertamu ke pulau lain (read-only/interaksi terbatas, salam Toot di buku tamu).

Stack: Next.js (App Router, TypeScript), Kaplay.js, Supabase (Auth, Realtime, Postgres, Storage), PWA, Vercel.

## Aturan Keras
1. **TIDAK ADA asset eksternal.** Semua sprite/tile/ikon digenerate dari kode (grid string -> canvas -> data URL). Semua audio via WebAudio/ZzFX.
2. **PRIVASI KONTEN PRIBADI:** Kenangan, foto, dan surat personal TIDAK BOLEH di-hardcode di file JS bundle (`content/*.ts`). Semua kenangan disimpan di database `island_memories` dan dilindungi Row Level Security (RLS) per `island_id`.
3. **Target utama:** iPad Safari landscape. Touch-first. Area sentuh besar (min 44px efektif).
4. **Resolusi virtual 320x240**, letterbox, skala bulat, crisp (tanpa smoothing). Pixel-perfect.
5. **Kaplay HARUS di-mount di client saja** (dynamic import, ssr:false). Cegah double-init StrictMode dan cleanup saat unmount.
6. **Audio hanya mulai setelah gestur pengguna pertama** (layar title "Ketuk untuk mulai").
7. **Auth:** Support Google OAuth (permanen), Guest Login (Supabase Anonymous Auth), dan Magic Link/OTP cadangan iOS PWA.
8. **Ekonomi Pentol:** Perubahan Pentol melalui fungsi RPC Postgres (`add_pentol`), anti-cheat & rate limited.
9. **Karakter & Lore:** Karakter Fauzan & Ay adalah Pasangan Pendiri Dunia (ada tugu & Kedai Bakso di Plaza). Pemain umum mendapatkan pulau starter dengan "Kenangan Builder".
10. **Gaya:** Palet hangat (peach, krem, sage, biru langit), nuansa lo-fi. Humor lembut (Toot), momen kenangan serius dan manis.
11. **Bahasa UI & Dialog:** Bahasa Indonesia santai. Panggilan sayang default: "Ay".
12. **Kode kecil, modular, bertipe.** Tiap sistem di file sendiri. Hindari god-file.

## Urutan Rilis
1. **Tahap 1 (Sekarang):** Skema multi-tenant (`islands`, `island_members`, `island_memories`), Google OAuth + Guest login, pulau personal Fauzan & Ay selesai sampai Phase 5 (Hadiah pacar aman!).
2. **Tahap 2 (Beta Tertutup):** Share link kunjungan pulau untuk teman/kerabat.
3. **Tahap 3 (Publik):** Buka Plaza Publik bersama (Kedai Bakso & Tugu Pendiri) + Kenangan Builder untuk semua pengguna.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
