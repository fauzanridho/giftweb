import type { KAPLAYCtx, GameObj } from "kaplay";
import { playClick } from "../audio/sfx";

export interface EmoteOption {
  id: string;
  symbol: string;
}

export const EMOTE_LIST: EmoteOption[] = [
  { id: "heart", symbol: "❤" },
  { id: "laugh", symbol: "😂" },
  { id: "wave", symbol: "👋" },
  { id: "toot", symbol: "💨" },
  { id: "surprised", symbol: "😲" },
];

export class EmoteSystem {
  private k: KAPLAYCtx;
  private player: GameObj | null = null;
  private onSendEmote: ((symbol: string) => void) | null = null;
  private isBarOpen = false;
  private barContainer: GameObj | null = null;

  constructor(k: KAPLAYCtx) {
    this.k = k;
  }

  setup(player: GameObj, onSend: (symbol: string) => void) {
    this.player = player;
    this.onSendEmote = onSend;
    this.createTriggerButton();
  }

  private createTriggerButton() {
    const hud = this.k.add([this.k.fixed(), this.k.z(200)]);

    // Tombol pemicu Emote di dekat tombol Toot (posisi: x=240, y=210)
    const triggerBtn = hud.add([
      this.k.circle(16),
      this.k.pos(242, 212),
      this.k.color(255, 255, 255),
      this.k.outline(1, this.k.Color.fromHex("#c47a6a")),
      this.k.area(),
    ]);

    hud.add([
      this.k.text("❤", { size: 10 }),
      this.k.pos(242, 212),
      this.k.anchor("center"),
      this.k.color(230, 83, 83),
    ]);

    triggerBtn.onClick(() => {
      playClick();
      this.toggleBar();
    });
  }

  private toggleBar() {
    if (this.isBarOpen) {
      this.closeBar();
    } else {
      this.openBar();
    }
  }

  private openBar() {
    this.closeBar();
    this.isBarOpen = true;

    this.barContainer = this.k.add([
      this.k.fixed(),
      this.k.pos(110, 202),
      this.k.z(210),
    ]);

    // Background bar emote
    this.barContainer.add([
      this.k.rect(120, 26, { radius: 13 }),
      this.k.pos(0, 0),
      this.k.color(255, 245, 238),
      this.k.outline(1, this.k.Color.fromHex("#c47a6a")),
    ]);

    // 5 Tombol Emote
    EMOTE_LIST.forEach((em, idx) => {
      const btn = this.barContainer!.add([
        this.k.rect(20, 20, { radius: 10 }),
        this.k.pos(6 + idx * 22, 3),
        this.k.color(255, 255, 255),
        this.k.area(),
      ]);

      this.barContainer!.add([
        this.k.text(em.symbol, { size: 9 }),
        this.k.pos(16 + idx * 22, 13),
        this.k.anchor("center"),
      ]);

      btn.onClick(() => {
        playClick();
        this.showLocalBubble(em.symbol);
        if (this.onSendEmote) {
          this.onSendEmote(em.symbol);
        }
        this.closeBar();
      });
    });
  }

  private closeBar() {
    this.isBarOpen = false;
    if (this.barContainer) {
      this.barContainer.destroy();
      this.barContainer = null;
    }
  }

  showLocalBubble(symbol: string) {
    if (!this.player) return;

    const bubble = this.k.add([
      this.k.rect(18, 18, { radius: 9 }),
      this.k.pos(this.player.pos.x, this.player.pos.y - 24),
      this.k.anchor("center"),
      this.k.color(255, 255, 255),
      this.k.outline(1, this.k.Color.fromHex("#c47a6a")),
      this.k.z(150),
    ]);

    bubble.add([
      this.k.text(symbol, { size: 10 }),
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
}

