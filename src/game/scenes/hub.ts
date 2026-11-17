import type { KAPLAYCtx, GameObj } from "kaplay";
import { TILE, VIRTUAL_W, VIRTUAL_H } from "../constants";
import { GridPathfinder } from "../systems/pathfinding";
import { DialogSystem } from "../systems/dialog";
import { InteractionSystem } from "../systems/interact";
import { PlayerController } from "../systems/input";
import { EmoteSystem } from "../systems/emote";
import { IslandRoom } from "../net/room";
import { RemotePlayerManager } from "../net/remotePlayer";
import { getOrCreateCurrentIsland } from "../systems/islandManager";
import { playToot, playClick, playCoin } from "../audio/sfx";
import { getSupabase } from "@/lib/supabaseClient";

export function hubScene(k: KAPLAYCtx) {
  k.scene("hub", async () => {
    // Ukuran Peta: 36 x 26 tile (576 x 416 px)
    const mapW = 36;
    const mapH = 26;
    const pixelW = mapW * TILE;
    const pixelH = mapH * TILE;

    const pathfinder = new GridPathfinder(mapW, mapH);
    const dialogSystem = new DialogSystem(k);
    const interactionSystem = new InteractionSystem(k);
    const emoteSystem = new EmoteSystem(k);
    const remotePlayers = new RemotePlayerManager(k, "hub");

    // 1. Render Layer Dasar Peta (Rumput, Pasir, Air)
    for (let y = 0; y < mapH; y++) {
      for (let x = 0; x < mapW; x++) {
        // Tepi terluar adalah air laut
        if (x <= 2 || x >= mapW - 3 || y <= 2 || y >= mapH - 3) {
          const water = k.add([
            k.sprite("tile_water"),
            k.pos(x * TILE, y * TILE),
            k.z(10),
          ]);
          water.play("wave");
          pathfinder.setWalkable(x, y, false);
        } else if (x <= 5 || y >= mapH - 6) {
          // Area pantai pasir
          k.add([
            k.sprite("tile_sand"),
            k.pos(x * TILE, y * TILE),
            k.z(10),
          ]);
        } else {
          // Area daratan rumput
          const isFlower = (x + y * 7) % 9 === 0;
          k.add([
            k.sprite(isFlower ? "tile_grass_flower" : "tile_grass"),
            k.pos(x * TILE, y * TILE),
            k.z(10),
          ]);
        }
      }
    }

    // 2. Tambahkan Props & Rintangan Solid

    // 4 PORTAL ZONA KENANGAN DI 4 MATA ANGIN
    // 1. Portal Utara: Gerbang Sekolah
    const schoolSign = k.add([
      k.rect(32, 14, { radius: 3 }),
      k.pos(18 * TILE, 3 * TILE),
      k.anchor("center"),
      k.color(255, 245, 238),
      k.outline(1, k.Color.fromHex("#c47a6a")),
      k.z(25),
    ]);
    schoolSign.add([
      k.text("🏫 Sekolah >", { size: 6 }),
      k.pos(0, 0),
      k.anchor("center"),
      k.color(120, 70, 60),
    ]);
    interactionSystem.register({
      obj: schoolSign,
      name: "Jalan ke Sekolah",
      interactDistance: 30,
      onInteract: () => {
        playClick();
        k.go("school");
      },
    });

    // 2. Portal Timur: Kedai Bakso
    const baksoSign = k.add([
      k.rect(36, 14, { radius: 3 }),
      k.pos(31 * TILE, 12 * TILE),
      k.anchor("center"),
      k.color(255, 245, 238),
      k.outline(1, k.Color.fromHex("#c47a6a")),
      k.z(25),
    ]);
    baksoSign.add([
      k.text("🍜 Kedai Bakso", { size: 6 }),
      k.pos(0, 0),
      k.anchor("center"),
      k.color(120, 70, 60),
    ]);
    interactionSystem.register({
      obj: baksoSign,
      name: "Jalan ke Kedai Bakso",
      interactDistance: 30,
      onInteract: () => {
        playClick();
        k.go("bakso");
      },
    });

    // 3. Portal Selatan: Pantai Santai
    const beachSign = k.add([
      k.rect(32, 14, { radius: 3 }),
      k.pos(18 * TILE, 22 * TILE),
      k.anchor("center"),
      k.color(255, 245, 238),
      k.outline(1, k.Color.fromHex("#c47a6a")),
      k.z(25),
    ]);
    beachSign.add([
      k.text("🌊 Pantai >", { size: 6 }),
      k.pos(0, 0),
      k.anchor("center"),
      k.color(120, 70, 60),
    ]);
    interactionSystem.register({
      obj: beachSign,
      name: "Jalan ke Pantai",
      interactDistance: 30,
      onInteract: () => {
        playClick();
        k.go("beach");
      },
    });

    // 4. Portal Barat: Bukit Senja
    const hillSign = k.add([
      k.rect(36, 14, { radius: 3 }),
      k.pos(5 * TILE, 12 * TILE),
      k.anchor("center"),
      k.color(255, 245, 238),
      k.outline(1, k.Color.fromHex("#c47a6a")),
      k.z(25),
    ]);
    hillSign.add([
      k.text("🌅 Bukit Senja", { size: 6 }),
      k.pos(0, 0),
      k.anchor("center"),
      k.color(120, 70, 60),
    ]);
    interactionSystem.register({
      obj: hillSign,
      name: "Jalan ke Bukit Senja",
      interactDistance: 30,
      onInteract: () => {
        playClick();
        k.go("hill");
      },
    });

    // Perahu di tepi pantai (Barat daya)
    const boat = k.add([
      k.sprite("prop_boat"),
      k.pos(4 * TILE, (mapH - 5) * TILE),
      k.z(20),
    ]);
    pathfinder.setWalkable(4, mapH - 5, false);
    pathfinder.setWalkable(5, mapH - 5, false);

    interactionSystem.register({
      obj: boat,
      name: "Perahu Santai",
      interactDistance: 32,
      bubbleOffset: { x: 16, y: -6 },
      onInteract: () => {
        dialogSystem.start([
          { speaker: "Perahu Pantai", text: "Perahu kayu kecil yang siap mengarungi lautan kenangan berdua." },
          {
            speaker: "Perahu Pantai",
            text: "Mau berlayar menyusuri ombak, Ay?",
            options: [
              { text: "Nanti dulu, masih asyik di sini", onSelect: () => {} },
              {
                text: "Toot buat dorong perahu!",
                onSelect: () => {
                  playToot(2);
                },
              },
            ],
          },
        ]);
      },
    });

    // Pepohonan Rindang
    const treePositions = [
      { x: 8, y: 5 },
      { x: 14, y: 4 },
      { x: 26, y: 6 },
      { x: 28, y: 12 },
      { x: 10, y: 18 },
      { x: 22, y: 19 },
    ];

    treePositions.forEach((tp) => {
      k.add([
        k.sprite("prop_tree"),
        k.pos(tp.x * TILE - 8, tp.y * TILE - 16),
        k.z(30),
      ]);
      // Area solid batang pohon
      pathfinder.setWalkable(tp.x, tp.y, false);
    });

    // Semak Bunga & Lentera
    const flowerPositions = [
      { x: 12, y: 11 },
      { x: 20, y: 11 },
      { x: 18, y: 15 },
    ];
    flowerPositions.forEach((fp) => {
      k.add([
        k.sprite("prop_flower_bush"),
        k.pos(fp.x * TILE, fp.y * TILE),
        k.z(25),
      ]);
    });

    // Lentera Hangat
    k.add([
      k.sprite("prop_lantern"),
      k.pos(15 * TILE, 12 * TILE),
      k.z(25),
    ]);

    // Kedai Bakso Legendaris (Pusat Hub)
    const cartX = 16;
    const cartY = 8;
    const baksoCart = k.add([
      k.sprite("prop_bakso_cart"),
      k.pos(cartX * TILE, cartY * TILE),
      k.z(35),
    ]);
    pathfinder.setWalkable(cartX, cartY + 1, false);
    pathfinder.setWalkable(cartX + 1, cartY + 1, false);

    interactionSystem.register({
      obj: baksoCart,
      name: "Kedai Bakso Ay & Fauzan",
      interactDistance: 36,
      bubbleOffset: { x: 16, y: -8 },
      onInteract: () => {
        dialogSystem.start([
          {
            speaker: "Kedai Bakso",
            text: "Selamat datang di Kedai Bakso Legendaris Fauzan & Ay! Wangi kuah kaldu hangatnya menggoda selera~ 🍜",
          },
          {
            speaker: "Fauzan",
            text: "Ay mau pesan semangkuk bakso urat favorit dengan sambal ekstra?",
            options: [
              {
                text: "Mau dong! (+10 Pentol)",
                onSelect: () => {
                  playCoin();
                },
              },
              {
                text: "Bagi kuahnya aja, hangat~",
                onSelect: () => {},
              },
            ],
          },
        ]);
      },
    });

    // Batu Penolong (NPC Solo Fallback)
    const helperStone = k.add([
      k.sprite("prop_helper_stone"),
      k.pos(24 * TILE, 15 * TILE),
      k.z(25),
    ]);
    pathfinder.setWalkable(24, 15, false);

    interactionSystem.register({
      obj: helperStone,
      name: "Batu Penolong",
      interactDistance: 28,
      bubbleOffset: { x: 8, y: -8 },
      onInteract: () => {
        dialogSystem.start([
          {
            speaker: "Batu Penolong",
            text: "Halo! Aku Batu Penolong setia. Kalau Ay bermain sendirian, aku siap membantu menekan tombol puzzle kedua! ✨",
          },
        ]);
      },
    });

    // 3. Karakter Pemain Utama (Spawn di dekat gerobak bakso)
    const player = k.add([
      k.sprite("char_fauzan"),
      k.pos(17 * TILE, 12 * TILE),
      k.anchor("center"),
      k.z(100),
      k.area({ shape: new k.Rect(k.vec2(0, 4), 10, 10) }),
    ]);
    player.play("idle-down");

    interactionSystem.setPlayer(player);

    const controller = new PlayerController(
      k,
      player,
      pathfinder,
      dialogSystem,
      interactionSystem
    );

    // Setup Room & Realtime Co-op
    let islandRoom: IslandRoom | null = null;
    try {
      const profile = await getOrCreateCurrentIsland();
      const sb = getSupabase();
      const { data: { user } } = await sb.auth.getUser();

      if (profile && user) {
        islandRoom = new IslandRoom(profile.islandId);
        await islandRoom.connect(user.id, profile.displayName, "hub");

        // Terima pergerakan partner
        islandRoom.onPos((partnerState) => {
          remotePlayers.handlePlayerPos(partnerState);
        });

        // Terima Emote partner
        islandRoom.onEmote(({ userId, emote }) => {
          remotePlayers.showEmote(userId, emote);
        });

        // Terima Toot partner
        islandRoom.onToot(({ x, y, variant }) => {
          playToot(variant);
          const puff = k.add([
            k.text("💨", { size: 12 }),
            k.pos(x, y - 8),
            k.anchor("center"),
            k.z(150),
          ]);
          k.wait(0.5, () => puff.destroy());
        });
      }
    } catch (err) {
      console.warn("Realtime co-op running in solo mode:", err);
    }

    // Setup Emote System untuk Pemain Lokal
    emoteSystem.setup(player, (symbol) => {
      if (islandRoom) {
        islandRoom.sendEmote(symbol);
      }
    });

    // 4. Update Loop: Input, Interaksi, & Kamera Mengikuti Pemain
    k.onUpdate(() => {
      controller.update();
      interactionSystem.update();
      remotePlayers.update();

      // Kirim posisi pemain ke partner jika terhubung
      if (islandRoom) {
        islandRoom.sendPosition(
          player.pos.x,
          player.pos.y,
          "down",
          player.curAnim() || "idle-down"
        );
      }

      // Kamera follow pemain dengan batas tepi peta
      const camTargetX = Math.max(
        VIRTUAL_W / 2,
        Math.min(pixelW - VIRTUAL_W / 2, player.pos.x)
      );
      const camTargetY = Math.max(
        VIRTUAL_H / 2,
        Math.min(pixelH - VIRTUAL_H / 2, player.pos.y)
      );

      // Lerp kamera halus
      const currentCam = k.camPos();
      k.camPos(
        currentCam.x + (camTargetX - currentCam.x) * 0.1,
        currentCam.y + (camTargetY - currentCam.y) * 0.1
      );
    });

    // 5. HUD Sentuh Tetap di Layar (Fixed Screen UI)
    const hud = k.add([k.fixed(), k.z(200)]);

    // Status Partner Online di HUD
    const partnerStatusLabel = hud.add([
      k.text("Partner: Menunggu Ay...", { size: 6 }),
      k.pos(12, 12),
      k.color(180, 150, 140),
    ]);

    if (islandRoom) {
      islandRoom.onPresence((onlinePlayers) => {
        if (onlinePlayers.length > 0) {
          const partner = onlinePlayers[0];
          partnerStatusLabel.text = `Online: ${partner.displayName} 💕`;
          partnerStatusLabel.color = k.Color.fromHex("#6f9453");
        } else {
          partnerStatusLabel.text = "Partner: Menunggu Ay...";
          partnerStatusLabel.color = k.Color.fromHex("#b4968c");
        }
      });
    }

    // Tombol Toot Besar Pojok Kanan Bawah (Ramah Jempol iPad)
    const tootBtn = hud.add([
      k.circle(22),
      k.pos(290, 210),
      k.color(244, 166, 142),
      k.outline(2, k.Color.fromHex("#c47a6a")),
      k.scale(1),
      k.area(),
    ]);

    hud.add([
      k.text("💨", { size: 14 }),
      k.pos(290, 209),
      k.anchor("center"),
    ]);

    let tootCooldown = false;
    tootBtn.onClick(() => {
      if (tootCooldown || dialogSystem.isActive()) return;
      tootCooldown = true;

      // Putar suara toot acak 1-3
      const variant = (Math.floor(Math.random() * 3) + 1) as 1 | 2 | 3;
      playToot(variant);

      // Siarkan ke partner lewat realtime
      if (islandRoom) {
        islandRoom.sendToot(player.pos.x, player.pos.y, variant);
      }

      // Efek visual tombol ditekan
      tootBtn.scale = k.vec2(0.9);
      k.wait(0.1, () => {
        tootBtn.scale = k.vec2(1);
      });

      // Partikel asap toot pastel mengapung di dekat pemain
      const puff = k.add([
        k.text("💨", { size: 12 }),
        k.pos(player.pos.x, player.pos.y - 8),
        k.anchor("center"),
        k.z(150),
        k.opacity(1),
      ]);

      let puffLife = 0;
      puff.onUpdate(() => {
        puffLife += k.dt();
        puff.pos.y -= 12 * k.dt();
        puff.opacity = 1 - puffLife / 0.6;
        if (puffLife >= 0.6) {
          puff.destroy();
        }
      });

      k.wait(0.4, () => {
        tootCooldown = false;
      });
    });

    // Tombol Galeri Asset di Pojok Kanan Atas
    const galleryBtn = hud.add([
      k.rect(58, 16, { radius: 4 }),
      k.pos(254, 8),
      k.color(255, 255, 255),
      k.outline(1, k.Color.fromHex("#c47a6a")),
      k.area(),
    ]);

    hud.add([
      k.text("Galeri Asset", { size: 6 }),
      k.pos(283, 16),
      k.anchor("center"),
      k.color(120, 80, 70),
    ]);

    galleryBtn.onClick(() => {
      playClick();
      k.go("assetGallery");
    });
  });
}
