import type { KAPLAYCtx, GameObj } from "kaplay";
import { PlayerState } from "./room";

export class RemotePlayerManager {
  private k: KAPLAYCtx;
  private currentScene: string;
  private remotePlayers: Map<
    string,
    {
      obj: GameObj;
      nameTag: GameObj;
      targetX: number;
      targetY: number;
      currentAnim: string;
      scene: string;
    }
  > = new Map();

  constructor(k: KAPLAYCtx, currentScene = "hub") {
    this.k = k;
    this.currentScene = currentScene;
  }

  handlePlayerPos(state: PlayerState) {
    let entry = this.remotePlayers.get(state.userId);

    if (!entry) {
      // Spawn karakter partner baru (Gunakan sprite Ay secara default atau Fauzan)
      const spriteName = "char_ay";

      const obj = this.k.add([
        this.k.sprite(spriteName),
        this.k.pos(state.x, state.y),
        this.k.anchor("center"),
        this.k.z(99),
      ]);
      obj.play(state.anim || "idle-down");

      // Nametag di atas kepala partner
      const nameTag = this.k.add([
        this.k.text(state.displayName || "Ay 💕", { size: 6 }),
        this.k.pos(state.x, state.y - 18),
        this.k.anchor("center"),
        this.k.color(196, 122, 106),
        this.k.z(101),
      ]);

      entry = {
        obj,
        nameTag,
        targetX: state.x,
        targetY: state.y,
        currentAnim: state.anim,
        scene: state.scene || this.currentScene,
      };

      this.remotePlayers.set(state.userId, entry);
    } else {
      entry.targetX = state.x;
      entry.targetY = state.y;
      entry.scene = state.scene || this.currentScene;

      // Update animasi
      if (state.anim && entry.currentAnim !== state.anim) {
        entry.currentAnim = state.anim;
        try {
          entry.obj.play(state.anim);
        } catch {
          // ignore
        }
      }
    }

    // Sembunyikan karakter jika partner sedang berada di scene lain
    const isSameScene = entry.scene === this.currentScene;
    entry.obj.hidden = !isSameScene;
    entry.nameTag.hidden = !isSameScene;
  }

  showEmote(userId: string, emoteSymbol: string) {
    const entry = this.remotePlayers.get(userId);
    if (!entry || entry.obj.hidden) return;

    const bubble = this.k.add([
      this.k.rect(18, 18, { radius: 9 }),
      this.k.pos(entry.obj.pos.x, entry.obj.pos.y - 24),
      this.k.anchor("center"),
      this.k.color(255, 255, 255),
      this.k.outline(1, this.k.Color.fromHex("#c47a6a")),
      this.k.z(150),
    ]);

    bubble.add([
      this.k.text(emoteSymbol, { size: 10 }),
      this.k.pos(0, 0),
      this.k.anchor("center"),
    ]);

    let age = 0;
    bubble.onUpdate(() => {
      age += this.k.dt();
      bubble.pos.y -= 8 * this.k.dt();
      if (age > 2) {
        bubble.destroy();
      }
    });
  }

  update() {
    // Lerp posisi setiap frame (60 FPS) menuju target posisi
    this.remotePlayers.forEach((entry) => {
      if (entry.obj.exists()) {
        const currentPos = entry.obj.pos;
        const lerpFactor = 0.25;

        currentPos.x += (entry.targetX - currentPos.x) * lerpFactor;
        currentPos.y += (entry.targetY - currentPos.y) * lerpFactor;

        // Nametag mengikuti posisi partner
        entry.nameTag.pos.x = currentPos.x;
        entry.nameTag.pos.y = currentPos.y - 18;
      }
    });
  }

  removePlayer(userId: string) {
    const entry = this.remotePlayers.get(userId);
    if (entry) {
      entry.obj.destroy();
      entry.nameTag.destroy();
      this.remotePlayers.delete(userId);
    }
  }

  clear() {
    this.remotePlayers.forEach((entry) => {
      entry.obj.destroy();
      entry.nameTag.destroy();
    });
    this.remotePlayers.clear();
  }
}

