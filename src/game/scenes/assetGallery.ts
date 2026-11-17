import type { KAPLAYCtx } from "kaplay";
import {
  playStep,
  playClick,
  playDialogBlip,
  playCoin,
  playToot,
  playSuccess,
} from "../audio/sfx";

export function assetGalleryScene(k: KAPLAYCtx) {
  k.scene("assetGallery", () => {
    // Background hangat
    k.add([
      k.rect(320, 240),
      k.pos(0, 0),
      k.color(252, 228, 214),
    ]);

    // Header Title
    k.add([
      k.text("GALERI ASSET PROSEDURAL", { size: 10 }),
      k.pos(160, 10),
      k.anchor("center"),
      k.color(120, 70, 60),
    ]);

    // 1. Bagian Tile
    k.add([k.text("Tiles (16x16):", { size: 7 }), k.pos(12, 24), k.color(80, 80, 80)]);
    const tileNames = ["tile_grass", "tile_grass_flower", "tile_sand", "tile_wood", "tile_soil"];
    tileNames.forEach((tName, i) => {
      k.add([k.sprite(tName), k.pos(14 + i * 20, 36)]);
    });

    // Tile Air Beranimasi
    const waterObj = k.add([k.sprite("tile_water"), k.pos(14 + tileNames.length * 20, 36)]);
    waterObj.play("wave");

    // 2. Bagian Props
    k.add([k.text("Props & Objek:", { size: 7 }), k.pos(12, 60), k.color(80, 80, 80)]);
    k.add([k.sprite("prop_tree"), k.pos(14, 72)]);
    k.add([k.sprite("prop_bakso_cart"), k.pos(56, 78)]);
    k.add([k.sprite("prop_boat"), k.pos(98, 86)]);
    k.add([k.sprite("prop_flower_bush"), k.pos(140, 86)]);
    k.add([k.sprite("prop_lantern"), k.pos(166, 86)]);
    k.add([k.sprite("prop_bowl"), k.pos(192, 86)]);
    k.add([k.sprite("prop_helper_stone"), k.pos(218, 86)]);

    // 3. Karakter & Animasi Jalan (Fauzan & Ay)
    k.add([k.text("Karakter (Animasi 4-Arah):", { size: 7 }), k.pos(12, 114), k.color(80, 80, 80)]);

    // Fauzan (Walk Down & Right)
    const f1 = k.add([k.sprite("char_fauzan"), k.pos(20, 128)]);
    f1.play("walk-down");
    k.add([k.text("Fauzan", { size: 6 }), k.pos(28, 156), k.anchor("center"), k.color(100, 100, 100)]);

    const f2 = k.add([k.sprite("char_fauzan"), k.pos(48, 128)]);
    f2.play("walk-right");

    // Ay (Walk Down & Left)
    const a1 = k.add([k.sprite("char_ay"), k.pos(84, 128)]);
    a1.play("walk-down");
    k.add([k.text("Ay 💕", { size: 6 }), k.pos(92, 156), k.anchor("center"), k.color(100, 100, 100)]);

    const a2 = k.add([k.sprite("char_ay"), k.pos(112, 128)]);
    a2.play("walk-left");

    // 4. Panel Uji Efek Suara (WebAudio Synthesizer)
    k.add([k.text("Uji Efek Suara (Sentuh/Klik Tombol):", { size: 7 }), k.pos(12, 172), k.color(80, 80, 80)]);

    const soundButtons = [
      { label: "👣 Langkah", fn: playStep, x: 12, y: 184 },
      { label: "🔘 Klik UI", fn: playClick, x: 68, y: 184 },
      { label: "💬 Blip", fn: playDialogBlip, x: 124, y: 184 },
      { label: "🍢 Pentol", fn: playCoin, x: 172, y: 184 },
      { label: "✨ Chime", fn: playSuccess, x: 232, y: 184 },
      { label: "💨 Toot 1", fn: () => playToot(1), x: 12, y: 208 },
      { label: "💨 Toot 2", fn: () => playToot(2), x: 68, y: 208 },
      { label: "💨 Toot 3", fn: () => playToot(3), x: 124, y: 208 },
    ];

    soundButtons.forEach((btn) => {
      const box = k.add([
        k.rect(50, 18, { radius: 3 }),
        k.pos(btn.x, btn.y),
        k.color(244, 166, 142),
        k.outline(1, k.Color.fromHex("#c47a6a")),
        k.area(),
      ]);

      k.add([
        k.text(btn.label, { size: 6 }),
        k.pos(btn.x + 25, btn.y + 9),
        k.anchor("center"),
        k.color(255, 255, 255),
      ]);

      box.onClick(() => {
        btn.fn();
        box.color = k.Color.fromHex("#ffffff");
        k.wait(0.1, () => {
          box.color = k.Color.fromHex("#f4a68e");
        });
      });
    });

    // Tombol Lanjut ke Boot Scene
    const switchBtn = k.add([
      k.rect(80, 18, { radius: 3 }),
      k.pos(220, 208),
      k.color(155, 184, 133),
      k.outline(1, k.Color.fromHex("#496833")),
      k.area(),
    ]);

    k.add([
      k.text("Ke Menu Utama >", { size: 6 }),
      k.pos(260, 217),
      k.anchor("center"),
      k.color(255, 255, 255),
    ]);

    switchBtn.onClick(() => {
      playClick();
      k.go("hub");
    });
  });
}

