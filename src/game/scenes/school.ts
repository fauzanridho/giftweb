import type { KAPLAYCtx } from "kaplay";
import { TILE, VIRTUAL_W, VIRTUAL_H } from "../constants";
import { GridPathfinder } from "../systems/pathfinding";
import { DialogSystem } from "../systems/dialog";
import { InteractionSystem } from "../systems/interact";
import { PlayerController } from "../systems/input";
import { MemoryManager } from "../systems/memory";
import { getOrCreateCurrentIsland } from "../systems/islandManager";
import { playToot, playSuccess, playClick, playStep } from "../audio/sfx";

export function schoolScene(k: KAPLAYCtx) {
  k.scene("school", async () => {
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

    // 1. Render Lapangan Sekolah (Lantai Bata & Rumput)
    for (let y = 0; y < mapH; y++) {
      for (let x = 0; x < mapW; x++) {
        if (x <= 1 || x >= mapW - 2 || y <= 1 || y >= mapH - 2) {
          k.add([k.sprite("tile_wood"), k.pos(x * TILE, y * TILE), k.z(10)]);
          pathfinder.setWalkable(x, y, false);
        } else if (y >= 5 && y <= 15 && x >= 6 && x <= 21) {
          k.add([k.sprite("tile_sand"), k.pos(x * TILE, y * TILE), k.z(10)]);
        } else {
          k.add([k.sprite("tile_grass"), k.pos(x * TILE, y * TILE), k.z(10)]);
        }
      }
    }

    // Bangunan Gerbang Sekolah di Bagian Atas
    const gateY = 4;
    for (let x = 8; x <= 19; x++) {
      if (x !== 13 && x !== 14) {
        // Pagar solid
        k.add([k.sprite("prop_tree"), k.pos(x * TILE - 8, gateY * TILE - 16), k.z(25)]);
        pathfinder.setWalkable(x, gateY, false);
      }
    }

    // Papan Bel Sekolah (Gag Lucu)
    const schoolBell = k.add([
      k.sprite("prop_lantern"),
      k.pos(13.5 * TILE, 3 * TILE),
      k.z(30),
    ]);
    interactionSystem.register({
      obj: schoolBell,
      name: "Bel Sekolah",
      interactDistance: 32,
      onInteract: () => {
        playToot(1);
        dialogSystem.start([
          {
            speaker: "Bel Sekolah",
            text: "*Teng... Teng... TTOOOOT!* 🔔💨",
          },
          {
            speaker: "Fauzan",
            text: "Dulu tiap bel pulang bunyi, kita selalu sengaja lama-lamain beresin tas biar bisa pulang bareng~",
          },
        ]);
      },
    });

    // 2. PUZZLE GERBANG: DUA PRESSURE PLATE
    let plate1Pressed = false;
    let plate2Pressed = false;
    let puzzleSolved = memoryManager.isUnlocked("school");

    // Pressure Plate Kiri (x=10, y=9)
    const plate1 = k.add([
      k.rect(14, 14, { radius: 3 }),
      k.pos(10 * TILE + 1, 9 * TILE + 1),
      k.color(244, 166, 142),
      k.outline(1, k.Color.fromHex("#c47a6a")),
      k.z(15),
    ]);

    // Pressure Plate Kanan (x=17, y=9)
    const plate2 = k.add([
      k.rect(14, 14, { radius: 3 }),
      k.pos(17 * TILE + 1, 9 * TILE + 1),
      k.color(244, 166, 142),
      k.outline(1, k.Color.fromHex("#c47a6a")),
      k.z(15),
    ]);

    // Gerbang Tengah (x=13 & 14, y=4)
    const gateDoor = k.add([
      k.rect(32, 14, { radius: 2 }),
      k.pos(13 * TILE, 4 * TILE),
      k.color(150, 100, 90),
      k.opacity(1),
      k.z(30),
    ]);
    if (!puzzleSolved) {
      pathfinder.setWalkable(13, 4, false);
      pathfinder.setWalkable(14, 4, false);
    } else {
      gateDoor.opacity = 0.3;
    }

    // FALLBACK SOLO: Batu Penolong menekan plate kedua jika main sendiri
    const helperStone = k.add([
      k.sprite("prop_helper_stone"),
      k.pos(17 * TILE, 9 * TILE),
      k.z(20),
    ]);

    // Pemain
    const player = k.add([
      k.sprite("char_fauzan"),
      k.pos(14 * TILE, 16 * TILE),
      k.anchor("center"),
      k.z(100),
      k.area({ shape: new k.Rect(k.vec2(0, 4), 10, 10) }),
    ]);
    player.play("idle-up");

    interactionSystem.setPlayer(player);
    const controller = new PlayerController(k, player, pathfinder, dialogSystem, interactionSystem);

    function checkPuzzle() {
      if (puzzleSolved) return;

      const pTileX = Math.floor(player.pos.x / TILE);
      const pTileY = Math.floor(player.pos.y / TILE);

      // Pemain menginjak Plate 1
      plate1Pressed = pTileX === 10 && pTileY === 9;
      // Batu Penolong atau partner menginjak Plate 2
      plate2Pressed = true; // Fallback otomatis membantu

      plate1.color = plate1Pressed ? k.Color.fromHex("#c8d8b9") : k.Color.fromHex("#f4a68e");
      plate2.color = plate2Pressed ? k.Color.fromHex("#c8d8b9") : k.Color.fromHex("#f4a68e");

      if (plate1Pressed && plate2Pressed) {
        puzzleSolved = true;
        playSuccess();
        gateDoor.opacity = 0.3;
        pathfinder.setWalkable(13, 4, true);
        pathfinder.setWalkable(14, 4, true);

        k.wait(0.5, async () => {
          await memoryManager.unlockMemory("school");
        });
      }
    }

    k.onUpdate(() => {
      controller.update();
      interactionSystem.update();
      checkPuzzle();

      // Kamera
      const camTargetX = Math.max(VIRTUAL_W / 2, Math.min(pixelW - VIRTUAL_W / 2, player.pos.x));
      const camTargetY = Math.max(VIRTUAL_H / 2, Math.min(pixelH - VIRTUAL_H / 2, player.pos.y));
      k.camPos(camTargetX, camTargetY);
    });

    // Tombol Kembali ke Hub
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
