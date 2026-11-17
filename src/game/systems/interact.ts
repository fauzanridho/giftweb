import type { KAPLAYCtx, GameObj } from "kaplay";

export interface InteractableTarget {
  obj: GameObj;
  name: string;
  interactDistance: number;
  onInteract: () => void;
  bubbleOffset?: { x: number; y: number };
}

export class InteractionSystem {
  private k: KAPLAYCtx;
  private targets: InteractableTarget[] = [];
  private player: GameObj | null = null;
  private activeBubble: GameObj | null = null;
  private currentTarget: InteractableTarget | null = null;

  constructor(k: KAPLAYCtx) {
    this.k = k;
  }

  setPlayer(player: GameObj) {
    this.player = player;
  }

  register(target: InteractableTarget) {
    this.targets.push(target);
  }

  clear() {
    this.targets = [];
    this.player = null;
    this.hideBubble();
  }

  update() {
    if (!this.player) return;

    const pPos = this.player.pos;
    let closestTarget: InteractableTarget | null = null;
    let minDistance = Infinity;

    for (const t of this.targets) {
      if (!t.obj.exists()) continue;
      const dist = pPos.dist(t.obj.pos);
      if (dist <= t.interactDistance && dist < minDistance) {
        minDistance = dist;
        closestTarget = t;
      }
    }

    if (closestTarget !== this.currentTarget) {
      this.currentTarget = closestTarget;
      if (this.currentTarget) {
        this.showBubble(this.currentTarget);
      } else {
        this.hideBubble();
      }
    }
  }

  getCurrentTarget(): InteractableTarget | null {
    return this.currentTarget;
  }

  triggerCurrent() {
    if (this.currentTarget) {
      this.currentTarget.onInteract();
    }
  }

  private showBubble(target: InteractableTarget) {
    this.hideBubble();

    const offset = target.bubbleOffset || { x: 0, y: -24 };
    const bubbleX = target.obj.pos.x + offset.x;
    const bubbleY = target.obj.pos.y + offset.y;

    this.activeBubble = this.k.add([
      this.k.rect(14, 14, { radius: 7 }),
      this.k.pos(bubbleX, bubbleY),
      this.k.anchor("center"),
      this.k.color(255, 255, 255),
      this.k.outline(1, this.k.Color.fromHex("#c47a6a")),
      this.k.z(160),
    ]);

    this.activeBubble.add([
      this.k.text("!", { size: 9 }),
      this.k.pos(0, 0),
      this.k.anchor("center"),
      this.k.color(196, 122, 106),
    ]);

    // Efek mengapung naik-turun lembut
    let time = 0;
    this.activeBubble.onUpdate(() => {
      if (!this.activeBubble) return;
      time += this.k.dt() * 4;
      this.activeBubble.pos.y = bubbleY + Math.sin(time) * 2;
    });
  }

  private hideBubble() {
    if (this.activeBubble) {
      this.activeBubble.destroy();
      this.activeBubble = null;
    }
  }
}

