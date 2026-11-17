import type { KAPLAYCtx } from "kaplay";
import { TILE, VIRTUAL_W, VIRTUAL_H } from "../constants";
import { DialogSystem } from "../systems/dialog";
import { MemoryManager } from "../systems/memory";
import { getOrCreateCurrentIsland } from "../systems/islandManager";
import { playClick, playCoin, playSuccess, playToot } from "../audio/sfx";

export function baksoScene(k: KAPLAYCtx) {
  k.scene("bakso", async () => {
    const dialogSystem = new DialogSystem(k);
    const profile = await getOrCreateCurrentIsland();
    const memoryManager = new MemoryManager(k, profile?.islandId || "default");
    await memoryManager.loadMemories();

    // Background Warung Bakso Cozy (Lantai Kayu Hangat)
    k.add([
      k.rect(320, 240),
      k.pos(0, 0),
      k.color(245, 235, 217),
    ]);

    for (let x = 0; x < 20; x++) {
      for (let y = 0; y < 15; y++) {
        k.add([k.sprite("tile_wood"), k.pos(x * 16, y * 16), k.z(10)]);
      }
    }

    // Gerobak Bakso Besar di Tengah
    k.add([
      k.sprite("prop_bakso_cart"),
      k.pos(130, 40),
      k.scale(1.5),
      k.z(20),
    ]);

    // Karakter Fauzan & Ay duduk di meja
    k.add([k.sprite("char_fauzan"), k.pos(110, 100), k.z(30)]);
    k.add([k.sprite("char_ay"), k.pos(180, 100), k.z(30)]);

    // Meja & Mangkuk Bakso
    k.add([
      k.rect(60, 24, { radius: 4 }),
      k.pos(130, 105),
      k.color(158, 112, 81),
      k.outline(1, k.Color.fromHex("#6b4731")),
      k.z(40),
    ]);
    k.add([k.sprite("prop_bowl"), k.pos(145, 102), k.z(45)]);

    // Status Mini-game
    let soupStirCount = 0;
    const requiredStirs = 5;
    let sambalCount = 0;
    let isCompleted = memoryManager.isUnlocked("bakso");

    // UI Instruksi Mini-game
    const hud = k.add([k.fixed(), k.z(200)]);

    const instructionCard = hud.add([
      k.rect(260, 45, { radius: 6 }),
      k.pos(160, 160),
      k.anchor("center"),
      k.color(255, 255, 255),
      k.outline(1, k.Color.fromHex("#c47a6a")),
    ]);

    const statusText = hud.add([
      k.text(
        isCompleted
          ? "Bakso hangat favorit Ay sudah siap dinikmati! 🍜"
          : "Ketuk tombol untuk mengaduk kuah & racik bumbu (0/5):",
        { size: 7 }
      ),
      k.pos(160, 150),
      k.anchor("center"),
      k.color(100, 60, 60),
    ]);

    // Tombol Aduk Kuah
    const stirBtn = hud.add([
      k.rect(70, 20, { radius: 4 }),
      k.pos(115, 195),
      k.anchor("center"),
      k.color(244, 166, 142),
      k.outline(1, k.Color.fromHex("#c47a6a")),
      k.area(),
    ]);
    hud.add([k.text("🥄 Aduk Kuah", { size: 6 }), k.pos(115, 195), k.anchor("center"), k.color(255, 255, 255)]);

    // Tombol Tambah Sambal (Gag Lucu)
    const sambalBtn = hud.add([
      k.rect(70, 20, { radius: 4 }),
      k.pos(205, 195),
      k.anchor("center"),
      k.color(230, 83, 83),
      k.outline(1, k.Color.fromHex("#a83232")),
      k.area(),
    ]);
    hud.add([k.text("🌶️ + Sambal", { size: 6 }), k.pos(205, 195), k.anchor("center"), k.color(255, 255, 255)]);

    stirBtn.onClick(async () => {
      playClick();
      soupStirCount++;
      playCoin();

      if (soupStirCount < requiredStirs) {
        statusText.text = `Mengaduk kuah kaldu hangat... (${soupStirCount}/${requiredStirs}) 🍜`;
      } else if (!isCompleted) {
        isCompleted = true;
        statusText.text = "Aroma kuah baksonya sempurna! Kenangan Terbuka! ✨";
        playSuccess();
        await memoryManager.unlockMemory("bakso");
      }
    });

    sambalBtn.onClick(() => {
      sambalCount++;
      if (sambalCount >= 3) {
        playToot(1);
        dialogSystem.start([
          {
            speaker: "Fauzan",
            text: "*Uhuk!* Kebanyakan sambal sampai kepedasan dan perut bunyi konyol! 😂💨",
          },
        ]);
        sambalCount = 0;
      } else {
        playClick();
        statusText.text = `Tambah sambal level ${sambalCount}! Hati-hati kepedasan ya Ay~ 🌶️`;
      }
    });

    // Tombol Kembali
    const backBtn = hud.add([
      k.rect(50, 16, { radius: 4 }),
      k.pos(10, 10),
      k.color(255, 255, 255),
      k.outline(1, k.Color.fromHex("#c47a6a")),
      k.area(),
    ]);
    hud.add([k.text("< Ke Hub", { size: 6 }), k.pos(35, 18), k.anchor("center"), k.color(120, 80, 70)]);

    backBtn.onClick(() => {
      playClick();
      k.go("hub");
    });
  });
}

