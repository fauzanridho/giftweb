import type { KAPLAYCtx, GameObj } from "kaplay";
import { getSupabase } from "@/lib/supabaseClient";
import { playSuccess, playClick } from "../audio/sfx";

export interface MemoryData {
  id: string;
  zone: string;
  title: string;
  body: string;
  dateNote?: string;
  unlocked: boolean;
}

export class MemoryManager {
  private k: KAPLAYCtx;
  private islandId: string;
  private memories: Map<string, MemoryData> = new Map();
  private modalRoot: GameObj | null = null;

  constructor(k: KAPLAYCtx, islandId: string) {
    this.k = k;
    this.islandId = islandId;
  }

  // Muat atau inisialisasi kenangan dari database Supabase
  async loadMemories(): Promise<void> {
    const sb = getSupabase();
    const { data, error } = await sb
      .from("island_memories")
      .select("*")
      .eq("island_id", this.islandId);

    if (error) {
      console.warn("Gagal memuat memories dari database:", error.message);
      return;
    }

    if (data && data.length > 0) {
      data.forEach((m) => {
        this.memories.set(m.zone, {
          id: m.id,
          zone: m.zone,
          title: m.title,
          body: m.body,
          dateNote: m.date_note,
          unlocked: m.unlocked,
        });
      });
    } else {
      // Inisialisasi 4 template memori jika belum ada di database pulau ini
      await this.initDefaultMemories();
    }
  }

  private async initDefaultMemories() {
    const sb = getSupabase();
    const defaults = [
      {
        island_id: this.islandId,
        zone: "school",
        title: "Hari Jadian di Gerbang Sekolah",
        body: "Ingat waktu bel pulang berbunyi dan kita jalan bareng di koridor kelas 3? Jantung rasanya berdebar lebih kencang dari biasanya saat pertama kali bilang sayang padamu.",
        date_note: "Masa SMA Kelas 3 💕",
        unlocked: false,
      },
      {
        island_id: this.islandId,
        zone: "bakso",
        title: "Semangkuk Bakso Favorit Ay",
        body: "Selalu pesan kuah ekstra panas dan sambal yang bikin hidung berkerut. Duduk di kedai pinggir jalan sambil dengerin ceritamu seharian adalah momen paling sederhana tapi paling membahagiakan.",
        date_note: "Kedai Bakso Langganan 🍜",
        unlocked: false,
      },
      {
        island_id: this.islandId,
        zone: "beach",
        title: "Debur Ombak & Angin Pantai",
        body: "Genggaman tangan di tepi pasir sambil melihat matahari tenggelam perlahan. Lautan luas jadi saksi betapa berharganya setiap langkah kecil yang kita lalui berdua.",
        date_note: "Pantai Kenangan 🌊",
        unlocked: false,
      },
      {
        island_id: this.islandId,
        zone: "hill",
        title: "Bukit Senja & Surat Untuk Ay",
        body: "Terima kasih sudah hadir di setiap halaman hidup ini. Melalui tawa, canda, tootan konyol, sampai mimpi-mimpi indah yang sedang kita bangun bersama. Selamat hari spesial, sayang!",
        date_note: "Puncak Bukit Senja ✨",
        unlocked: false,
      },
    ];

    const { data } = await sb.from("island_memories").insert(defaults).select();
    if (data) {
      data.forEach((m) => {
        this.memories.set(m.zone, {
          id: m.id,
          zone: m.zone,
          title: m.title,
          body: m.body,
          dateNote: m.date_note,
          unlocked: m.unlocked,
        });
      });
    }
  }

  isUnlocked(zone: string): boolean {
    return this.memories.get(zone)?.unlocked || false;
  }

  async unlockMemory(zone: string): Promise<MemoryData | null> {
    const mem = this.memories.get(zone);
    if (!mem) return null;

    if (!mem.unlocked) {
      mem.unlocked = true;
      const sb = getSupabase();
      await sb
        .from("island_memories")
        .update({ unlocked: true, unlocked_at: new Date().toISOString() })
        .eq("id", mem.id);

      playSuccess();
    }

    this.showPolaroidModal(mem);
    return mem;
  }

  showPolaroidModal(mem: MemoryData) {
    this.closeModal();

    this.modalRoot = this.k.add([this.k.fixed(), this.k.z(400)]);

    // Dimmed Overlay
    const overlay = this.modalRoot.add([
      this.k.rect(320, 240),
      this.k.pos(0, 0),
      this.k.color(0, 0, 0),
      this.k.opacity(0.6),
      this.k.area(),
    ]);

    // Polaroid Card (Krem hangat 240x190)
    const card = this.modalRoot.add([
      this.k.rect(240, 190, { radius: 8 }),
      this.k.pos(160, 120),
      this.k.anchor("center"),
      this.k.color(255, 252, 248),
      this.k.outline(2, this.k.Color.fromHex("#c47a6a")),
      this.k.area(),
    ]);

    // Area "Foto" di dalam Polaroid (Peach Sage 210x80)
    card.add([
      this.k.rect(210, 80, { radius: 4 }),
      this.k.pos(0, -42),
      this.k.anchor("center"),
      this.k.color(252, 228, 214),
      this.k.outline(1, this.k.Color.fromHex("#e2876e")),
    ]);

    // Ikon Ilustrasi Polaroid
    const icon = mem.zone === "school" ? "🏫" : mem.zone === "bakso" ? "🍜" : mem.zone === "beach" ? "🌊" : "🌅";
    card.add([
      this.k.text(icon, { size: 28 }),
      this.k.pos(0, -45),
      this.k.anchor("center"),
    ]);

    // Judul Kenangan
    card.add([
      this.k.text(mem.title, { size: 8 }),
      this.k.pos(0, 8),
      this.k.anchor("center"),
      this.k.color(196, 122, 106),
    ]);

    // Tanggal / Catatan
    if (mem.dateNote) {
      card.add([
        this.k.text(mem.dateNote, { size: 6 }),
        this.k.pos(0, 20),
        this.k.anchor("center"),
        this.k.color(140, 120, 110),
      ]);
    }

    // Isi Cerita Kenangan
    card.add([
      this.k.text(mem.body, { size: 6, width: 210, lineSpacing: 4 }),
      this.k.pos(0, 48),
      this.k.anchor("center"),
      this.k.color(50, 40, 40),
    ]);

    // Tombol Tutup
    const closeBtn = card.add([
      this.k.rect(70, 18, { radius: 4 }),
      this.k.pos(0, 80),
      this.k.anchor("center"),
      this.k.color(244, 166, 142),
      this.k.area(),
    ]);

    closeBtn.add([
      this.k.text("Simpan di Hati 💕", { size: 6 }),
      this.k.pos(0, 0),
      this.k.anchor("center"),
      this.k.color(255, 255, 255),
    ]);

    closeBtn.onClick(() => {
      playClick();
      this.closeModal();
    });

    overlay.onClick(() => {
      this.closeModal();
    });
  }

  closeModal() {
    if (this.modalRoot) {
      this.modalRoot.destroy();
      this.modalRoot = null;
    }
  }
}

