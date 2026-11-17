import type { KAPLAYCtx, GameObj } from "kaplay";
import { GridPathfinder, Point } from "./pathfinding";
import { DialogSystem } from "./dialog";
import { InteractionSystem } from "./interact";
import { TILE } from "../constants";
import { playStep } from "../audio/sfx";

export class PlayerController {
  private k: KAPLAYCtx;
  private player: GameObj;
  private pathfinder: GridPathfinder;
  private dialogSystem: DialogSystem;
  private interactionSystem: InteractionSystem;

  private path: Point[] = [];
  private currentWaypoint: Point | null = null;
  private speed = 75;
  private currentDir: "down" | "up" | "left" | "right" = "down";
  private isMoving = false;
  private stepSoundTimer = 0;
  private pendingInteraction: (() => void) | null = null;

  constructor(
    k: KAPLAYCtx,
    player: GameObj,
    pathfinder: GridPathfinder,
    dialogSystem: DialogSystem,
    interactionSystem: InteractionSystem
  ) {
    this.k = k;
    this.player = player;
    this.pathfinder = pathfinder;
    this.dialogSystem = dialogSystem;
    this.interactionSystem = interactionSystem;

    this.setupInputs();
  }

  private setupInputs() {
    // 1. Sentuh / Klik Layar (Tap-to-Move)
    this.k.onClick(() => {
      if (this.dialogSystem.isActive()) {
        this.dialogSystem.advance();
        return;
      }

      // Jangan gerak jika klik pada area UI atas/bawah tertentu
      const mPos = this.k.mousePos();
      if (mPos.y > 210 && mPos.x > 260) {
        // Area tombol Toot pojok kanan bawah
        return;
      }

      const worldPos = this.k.toWorld(mPos);

      // Cek apakah klik mengenai objek interaktif
      const target = this.interactionSystem.getCurrentTarget();
      if (target && target.obj.pos.dist(worldPos) < 24) {
        this.moveToPoint(worldPos, () => {
          target.onInteract();
        });
        return;
      }

      this.moveToPoint(worldPos);
    });

    // 2. Keyboard Interaksi (Spasi / Enter)
    this.k.onKeyPress(["space", "enter"], () => {
      if (this.dialogSystem.isActive()) {
        this.dialogSystem.advance();
      } else {
        this.interactionSystem.triggerCurrent();
      }
    });
  }

  moveToPoint(targetWorldPos: Point, onArrival?: () => void) {
    if (this.dialogSystem.isActive()) return;

    const startTile: Point = {
      x: Math.floor(this.player.pos.x / TILE),
      y: Math.floor(this.player.pos.y / TILE),
    };
    const endTile: Point = {
      x: Math.floor(targetWorldPos.x / TILE),
      y: Math.floor(targetWorldPos.y / TILE),
    };

    const path = this.pathfinder.findPath(startTile, endTile);
    if (path.length > 0) {
      this.path = path;
      this.currentWaypoint = this.path.shift() || null;
      this.pendingInteraction = onArrival || null;
    } else if (onArrival) {
      // Jika sudah sangat dekat dengan target
      onArrival();
    }
  }

  update() {
    if (this.dialogSystem.isActive()) {
      if (this.isMoving) {
        this.stopMoving();
      }
      return;
    }

    // 1. Dukungan Keyboard WASD / Panah
    let moveX = 0;
    let moveY = 0;

    if (this.k.isKeyDown("left") || this.k.isKeyDown("a")) moveX -= 1;
    if (this.k.isKeyDown("right") || this.k.isKeyDown("d")) moveX += 1;
    if (this.k.isKeyDown("up") || this.k.isKeyDown("w")) moveY -= 1;
    if (this.k.isKeyDown("down") || this.k.isKeyDown("s")) moveY += 1;

    if (moveX !== 0 || moveY !== 0) {
      // Batalkan pathfinding jika pengguna memakai keyboard
      this.path = [];
      this.currentWaypoint = null;
      this.pendingInteraction = null;

      const len = Math.hypot(moveX, moveY);
      const vx = (moveX / len) * this.speed;
      const vy = (moveY / len) * this.speed;

      this.player.move(vx, vy);
      this.updateDirectionAndAnim(moveX, moveY, true);
      this.handleStepSound();
      return;
    }

    // 2. Navigasi Jalur A* Waypoint (Tap-to-Move)
    if (this.currentWaypoint) {
      const dx = this.currentWaypoint.x - this.player.pos.x;
      const dy = this.currentWaypoint.y - this.player.pos.y;
      const dist = Math.hypot(dx, dy);

      if (dist < 2) {
        // Tiba di waypoint ini, ambil waypoint berikutnya
        this.player.pos.x = this.currentWaypoint.x;
        this.player.pos.y = this.currentWaypoint.y;
        this.currentWaypoint = this.path.shift() || null;

        if (!this.currentWaypoint) {
          // Sampai di tujuan akhir!
          this.stopMoving();
          if (this.pendingInteraction) {
            const cb = this.pendingInteraction;
            this.pendingInteraction = null;
            cb();
          }
        }
      } else {
        const vx = (dx / dist) * this.speed;
        const vy = (dy / dist) * this.speed;
        this.player.move(vx, vy);
        this.updateDirectionAndAnim(dx, dy, true);
        this.handleStepSound();
      }
    } else if (this.isMoving) {
      this.stopMoving();
    }
  }

  private handleStepSound() {
    this.stepSoundTimer += this.k.dt();
    if (this.stepSoundTimer >= 0.28) {
      playStep();
      this.stepSoundTimer = 0;
    }
  }

  private updateDirectionAndAnim(dx: number, dy: number, moving: boolean) {
    if (Math.abs(dx) > Math.abs(dy)) {
      this.currentDir = dx > 0 ? "right" : "left";
    } else if (Math.abs(dy) > 0.1) {
      this.currentDir = dy > 0 ? "down" : "up";
    }

    const animName = moving ? `walk-${this.currentDir}` : `idle-${this.currentDir}`;
    if (this.player.curAnim() !== animName) {
      this.player.play(animName);
    }
    this.isMoving = moving;
  }

  private stopMoving() {
    this.isMoving = false;
    this.stepSoundTimer = 0;
    this.player.play(`idle-${this.currentDir}`);
  }
}

