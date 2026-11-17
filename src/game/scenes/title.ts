import type { KAPLAYCtx } from "kaplay";
import { playClick, playStep } from "../audio/sfx";

export function titleScene(k: KAPLAYCtx) {
  k.scene("title", () => {
    // Background Langit Senja Peach
    k.add([
      k.rect(320, 240),
      k.pos(0, 0),
      k.color(252, 228, 214),
    ]);

    // Siluet Pulau Kecil & Pohon di Tengah
    k.add([
      k.rect(120, 24, { radius: 12 }),
      k.pos(160, 155),
      k.anchor("center"),
      k.color(200, 216, 185), // Sage
    ]);
    k.add([
      k.rect(140, 30),
      k.pos(90, 160),
      k.color(109, 188, 232), // Air
    ]);

    k.add([
      k.sprite("prop_tree"),
      k.pos(125, 120),
    ]);
    k.add([
      k.sprite("prop_flower_bush"),
      k.pos(165, 145),
    ]);

    // Judul Game
    k.add([
      k.text("PULAU KITA", { size: 22 }),
      k.pos(160, 60),
      k.anchor("center"),
      k.color(196, 122, 106),
    ]);

    k.add([
      k.text("Kisah Kecil Fauzan & Ay 💕", { size: 8 }),
      k.pos(160, 85),
      k.anchor("center"),
      k.color(140, 100, 90),
    ]);

    // Tombol Ketuk untuk Mulai (Blinking)
    const startPrompt = k.add([
      k.text("- Ketuk layar untuk mulai -", { size: 8 }),
      k.pos(160, 195),
      k.anchor("center"),
      k.color(180, 110, 95),
      k.opacity(1),
    ]);

    let blink = true;
    k.loop(0.5, () => {
      blink = !blink;
      startPrompt.opacity = blink ? 1 : 0.3;
    });

    // Sentuh Layar -> Membuka audio iOS dan lanjut ke Intro
    k.onClick(() => {
      playClick();
      playStep();
      k.go("intro");
    });
  });
}
