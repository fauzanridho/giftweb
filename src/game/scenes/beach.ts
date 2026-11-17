import type { KAPLAYCtx } from "kaplay";
import { TILE, VIRTUAL_W, VIRTUAL_H } from "../constants";
import { GridPathfinder } from "../systems/pathfinding";
import { DialogSystem } from "../systems/dialog";
import { InteractionSystem } from "../systems/interact";
import { PlayerController } from "../systems/input";
import { MemoryManager } from "../systems/memory";
import { getOrCreateCurrentIsland } from "../systems/islandManager";
import { playClick, playCoin, playSuccess, playToot } from "../audio/sfx";

export function beachScene(k: KAPLAYCtx) {
  k.scene("beach", async () => {
    const mapW = 30;
    const mapH = 22;
    const pixelW = mapW * TILE;
    const pixelH = mapH * TILE;

    const pathfinder = new GridPathfinder(mapW, mapH);
    const dialogSystem = new DialogSystem(k);
    const interactionSystem = new InteractionSystem(k);

    const profile = await getOrCreateCurrentIsland();
    const memoryManager = new MemoryManager(k, profile?.islandId || "default");
    await memoryManager.loadMemories();

    // 1. Render Pantai (Pasir di Utara/Tengah, Ombak Air di Selatan)
    for (let y = 0; y < mapH; y++) {
      for (let x = 0; x < mapW; x++) {
        if (y >= 14) {
          // Air laut
          const water = k.add([k.sprite("tile_water"), k.pos(x * TILE, y * TILE), k.z(10)]);
          water.play("wave");
          pathfinder.setWalkable(x, y, false);
        } else {
          // Pasir
          k.add([k.sprite("tile_sand"), k.pos(x * TILE, y * TILE), k.z(10)]);
        }
      }
    }

    // Beberapa Pohon Kelapa
    const trees = [{ x: 4, y: 5 }, { x: 10, y: 4 }, { x: 24, y: 6 }];
    trees.forEach((tp) => {
      k.add([k.sprite("prop_tree"), k.pos(tp.x * TILE - 8, tp.y * TILE - 16), k.z(25)]);
      pathfinder.setWalkable(tp.x, tp.y, false);
    });

    // 2. PUZZLE: CARI 3 KERANG DI PASIR
    let shellsCollected = 0;
    let puzzleSolved = memoryManager.isUnlocked("beach");

    const shellPositions = [
      { x: 7, y: 9 },
      { x: 18, y: 7 },
      { x: 22, y: 11 },
    ];

    shellPositions.forEach((sp, idx) => {
      const shell = k.add([
        k.text("🐚", { size: 10 }),
        k.pos(sp.x * TILE, sp.y * TILE),
        k.z(20),
      ]);

      interactionSystem.register({
        obj: shell,
        name: `Kerang Pantai ${idx + 1}`,
        interactDistance: 24,
        onInteract: () => {
          if (!shell.exists()) return;
          shell.destroy();
          shellsCollected++;
          playCoin();

          dialogSystem.start([
            {
              speaker: "Penemuan",
              text: `Menemukan kerang pantai cantik! (${shellsCollected}/3) 🐚`,
            },
          ]);

          if (shellsCollected >= 3 && !puzzleSolved) {
            puzzleSolved = true;
            k.wait(0.5, async () => {
              playSuccess();
              await memoryManager.unlockMemory("beach");
            });
          }
        },
      });
    });

    // Perahu Kayu di Tepi Air
    const boat = k.add([
      k.sprite("prop_boat"),
      k.pos(13 * TILE, 13 * TILE),
      k.z(25),
    ]);
    pathfinder.setWalkable(13, 13, false);
    pathfinder.setWalkable(14, 13, false);

    interactionSystem.register({
      obj: boat,
      name: "Perahu Pantai",
      interactDistance: 32,
      onInteract: () => {
        playToot(2);
        dialogSystem.start([
          {
            speaker: "Fauzan",
            text: "Kekuatan Toot mendorong perahu berlayar perlahan ke laut tenang! ⛵💨",
          },
        ]);
      },
    });

    // Pemain
    const player = k.add([
      k.sprite("char_fauzan"),
      k.pos(15 * TILE, 8 * TILE),
      k.anchor("center"),
      k.z(100),
      k.area({ shape: new k.Rect(k.vec2(0, 4), 10, 10) }),
    ]);
    player.play("idle-down");

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

