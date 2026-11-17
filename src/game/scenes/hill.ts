import type { KAPLAYCtx, GameObj } from "kaplay";
import { TILE, VIRTUAL_W, VIRTUAL_H } from "../constants";
import { GridPathfinder } from "../systems/pathfinding";
import { DialogSystem } from "../systems/dialog";
import { InteractionSystem } from "../systems/interact";
import { PlayerController } from "../systems/input";
import { MemoryManager } from "../systems/memory";
import { getOrCreateCurrentIsland } from "../systems/islandManager";
import { playClick, playCoin, playSuccess, playToot } from "../audio/sfx";

export function hillScene(k: KAPLAYCtx) {
  k.scene("hill", async () => {
    const mapW = 28;
    const mapH = 22;
    const pixelW = mapW * TILE;
    const pixelH = mapH * TILE;

    const pathfinder = new GridPathfinder(mapW, mapH);
    const dialogSystem = new DialogSystem(k);
    const interactionSystem = new InteractionSystem(k);

    const profile = await getOrCreateCurrentIsland();
    const memoryManager = new MemoryManager(k, profile?.islandId || "default");
    await memoryManager.loadMemories();

    // 1. Render Bukit Senja (Langit Oranye Lembayung & Rumput Sage)
    for (let y = 0; y < mapH; y++) {
      for (let x = 0; x < mapW; x++) {
        if (x <= 1 || x >= mapW - 2 || y <= 1 || y >= mapH - 2) {
          k.add([k.sprite("tile_wood"), k.pos(x * TILE, y * TILE), k.z(10)]);
          pathfinder.setWalkable(x, y, false);
        } else {
          k.add([k.sprite("tile_grass_flower"), k.pos(x * TILE, y * TILE), k.z(10)]);
        }
      }
    }

    // Pohon & Semak di Puncak Bukit
    k.add([k.sprite("prop_tree"), k.pos(12 * TILE, 3 * TILE), k.z(25)]);
    k.add([k.sprite("prop_flower_bush"), k.pos(10 * TILE, 5 * TILE), k.z(25)]);
    k.add([k.sprite("prop_flower_bush"), k.pos(16 * TILE, 5 * TILE), k.z(25)]);

    // 2. PUZZLE: NYALAKAN 5 LENTERA SENJA
    const lanternCoords = [
      { x: 6, y: 8 },
      { x: 10, y: 12 },
      { x: 14, y: 15 },
      { x: 18, y: 12 },
      { x: 22, y: 8 },
    ];

    let litLanternsCount = 0;
    let puzzleSolved = memoryManager.isUnlocked("hill");

    lanternCoords.forEach((lc, idx) => {
      const lantern = k.add([
        k.sprite("prop_lantern"),
        k.pos(lc.x * TILE, lc.y * TILE),
        k.z(25),
      ]);
      pathfinder.setWalkable(lc.x, lc.y, false);

      let isLit = false;
      interactionSystem.register({
        obj: lantern,
        name: `Lentera Senja ${idx + 1}`,
        interactDistance: 28,
        onInteract: () => {
          if (isLit) return;
          isLit = true;
          litLanternsCount++;
          playCoin();

          // Efek cahaya lentera menyala
          k.add([
            k.circle(12),
            k.pos(lc.x * TILE + 8, lc.y * TILE + 8),
            k.color(247, 208, 71),
            k.opacity(0.4),
            k.z(24),
          ]);

          if (litLanternsCount >= 5 && !puzzleSolved) {
            puzzleSolved = true;
            k.wait(0.5, async () => {
              playSuccess();
              await memoryManager.unlockMemory("hill");

              // Surat Ending Romantis Terbuka
              dialogSystem.start([
                {
                  speaker: "Fauzan",
                  text: "Semua lentera telah menyala, menerangi senja kita, Ay... ✨",
                },
                {
                  speaker: "Fauzan",
                  text: "Terima kasih sudah selalu ada, menemani dengan segala senyum manismu. Selamat menjelajahi Pulau Kita berdua! 💌",
                },
              ]);
            });
          }
        },
      });
    });

    // Pemain
    const player = k.add([
      k.sprite("char_fauzan"),
      k.pos(14 * TILE, 18 * TILE),
      k.anchor("center"),
      k.z(100),
      k.area({ shape: new k.Rect(k.vec2(0, 4), 10, 10) }),
    ]);
    player.play("idle-up");

    interactionSystem.setPlayer(player);
    const controller = new PlayerController(k, player, pathfinder, dialogSystem, interactionSystem);

    k.onUpdate(() => {
      controller.update();
      interactionSystem.update();

      const camTargetX = Math.max(VIRTUAL_W / 2, Math.min(pixelW - VIRTUAL_W / 2, player.pos.x));
      const camTargetY = Math.max(VIRTUAL_H / 2, Math.min(pixelH - VIRTUAL_H / 2, player.pos.y));
      k.camPos(camTargetX, camTargetY);
    });

    // Tombol Kembali
    const hud = k.add([k.fixed(), k.z(200)]);
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

