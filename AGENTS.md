# Pulau Kita — Master Context

## Apa ini
Game pixel art 2D cozy-romantis + humor, hadiah untuk pacar, dimainkan berdua realtime.
Stack: Next.js (App Router, TypeScript), Kaplay.js, Supabase (Auth, Realtime, Postgres, Storage), PWA, Vercel.

## Aturan keras
1. TIDAK ADA asset eksternal. Semua sprite/tile/ikon digenerate dari kode (grid string -> canvas -> data URL).
   Semua audio dibuat via WebAudio/ZzFX. Font: bawaan Kaplay atau font pixel via next/font (Google).
2. Target utama: iPad Safari landscape. Touch-first. Area sentuh besar (min 44px efektif).
3. Resolusi virtual 320x240, letterbox, skala bulat, crisp (tanpa smoothing). Pixel-perfect.
4. Kaplay HARUS di-mount di client saja (dynamic import, ssr:false). Cegah double-init karena React StrictMode
   dan lakukan cleanup saat unmount.
5. Sebelum menulis kode Kaplay, cek dokumentasi terbaru di kaplayjs.com. Jangan menebak API.
6. Audio hanya mulai setelah gestur pengguna pertama (aturan iOS) -> layar title "Ketuk untuk mulai".
7. Realtime: kirim posisi throttled ~10 Hz, terima dengan interpolasi. Event lain (emote, toot, puzzle) idempoten.
8. Progres disimpan di Supabase, BUKAN hanya localStorage (Safari bisa menghapus data lokal).
9. Sign-up publik DIMATIKAN. Hanya 2 akun. Semua tabel dilindungi RLS per couple_id.
10. Konten personal (memori, surat) ada di src/game/content/ dan repo harus PRIVATE.
11. Gift session pertama harus bisa solo; puzzle co-op punya fallback "Batu Penolong".
12. Gaya: palet hangat (peach, krem, sage, biru langit), nuansa lo-fi. Humor lembut, momen inti (surat/memori) serius dan manis.
13. Bahasa UI & dialog: Bahasa Indonesia santai. Panggilan sayang: "Ay".
14. Kode kecil, modular, bertipe. Tiap sistem di file sendiri. Hindari god-file.

## Cara kerja
- Kerjakan satu phase per sesi sesuai walkthrough.
- Akhiri tiap phase dengan: ringkasan perubahan, cara menjalankan, dan cek acceptance criteria.
- Jangan menambah fitur di luar phase yang sedang dikerjakan.
- Bila ada keputusan ambigu, pilih opsi paling sederhana dan catat di NOTES.md.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
