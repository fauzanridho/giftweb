import type { KAPLAYCtx, GameObj } from "kaplay";
import { playDialogBlip, playClick } from "../audio/sfx";

export interface DialogOption {
  text: string;
  onSelect: () => void;
}

export interface DialogStep {
  speaker?: string;
  text: string;
  options?: DialogOption[];
}

export class DialogSystem {
  private k: KAPLAYCtx;
  private queue: DialogStep[] = [];
  private active = false;
  private currentStep: DialogStep | null = null;
  private displayedText = "";
  private fullText = "";
  private charIndex = 0;
  private typeTimer: any = null;
  private isTyping = false;

  // UI Game Objects
  private uiRoot: GameObj | null = null;
  private boxBg: GameObj | null = null;
  private speakerLabel: GameObj | null = null;
  private contentLabel: GameObj | null = null;
  private nextIndicator: GameObj | null = null;
  private optionsContainer: GameObj[] = [];

  constructor(k: KAPLAYCtx) {
    this.k = k;
  }

  isActive(): boolean {
    return this.active;
  }

  start(steps: DialogStep[]) {
    this.queue = [...steps];
    this.active = true;
    this.showNext();
  }

  private createUI() {
    if (this.uiRoot) return;

    // Fixed UI di layar (posisi bawah: y=165 s/d 230)
    this.uiRoot = this.k.add([
      this.k.fixed(),
      this.k.z(300),
    ]);

    // Background Kotak Dialog (Peach muda berbingkai cokelat retro)
    this.boxBg = this.uiRoot.add([
      this.k.rect(300, 65, { radius: 6 }),
      this.k.pos(10, 168),
      this.k.color(255, 245, 238),
      this.k.outline(2, this.k.Color.fromHex("#c47a6a")),
      this.k.area(),
    ]);

    // Label Pembicara
    this.speakerLabel = this.uiRoot.add([
      this.k.text("", { size: 8 }),
      this.k.pos(20, 174),
      this.k.color(196, 122, 106),
    ]);

    // Label Isi Dialog
    this.contentLabel = this.uiRoot.add([
      this.k.text("", { size: 7, width: 280, lineSpacing: 4 }),
      this.k.pos(20, 188),
      this.k.color(60, 50, 50),
    ]);

    // Indikator Lanjut (Segitiga berkedip di pojok kanan bawah)
    this.nextIndicator = this.uiRoot.add([
      this.k.text("▼", { size: 7 }),
      this.k.pos(295, 222),
      this.k.anchor("center"),
      this.k.color(196, 122, 106),
      this.k.opacity(0),
    ]);

    // Klik/tap pada kotak dialog untuk lanjut atau skip
    this.boxBg.onClick(() => {
      this.advance();
    });
  }

  private clearOptions() {
    this.optionsContainer.forEach((opt) => opt.destroy());
    this.optionsContainer = [];
  }

  private showNext() {
    this.clearOptions();

    if (this.queue.length === 0) {
      this.close();
      return;
    }

    this.createUI();
    this.currentStep = this.queue.shift()!;
    this.fullText = this.currentStep.text;
    this.displayedText = "";
    this.charIndex = 0;
    this.isTyping = true;

    if (this.speakerLabel) {
      this.speakerLabel.text = this.currentStep.speaker
        ? `[ ${this.currentStep.speaker} ]`
        : "";
    }
    if (this.nextIndicator) {
      this.nextIndicator.opacity = 0;
    }

    this.typeNextChar();
  }

  private typeNextChar() {
    if (!this.active || !this.currentStep) return;

    if (this.charIndex < this.fullText.length) {
      this.displayedText += this.fullText[this.charIndex];
      if (this.contentLabel) {
        this.contentLabel.text = this.displayedText;
      }
      this.charIndex++;

      // Bunyi tik mesin ketik tiap 2 huruf
      if (this.charIndex % 2 === 0) {
        playDialogBlip();
      }

      const delay = this.fullText[this.charIndex - 1] === "." || this.fullText[this.charIndex - 1] === "," ? 0.08 : 0.025;
      this.typeTimer = this.k.wait(delay, () => this.typeNextChar());
    } else {
      this.finishTyping();
    }
  }

  private finishTyping() {
    this.isTyping = false;
    this.displayedText = this.fullText;
    if (this.contentLabel) {
      this.contentLabel.text = this.displayedText;
    }
    if (this.nextIndicator && (!this.currentStep?.options || this.currentStep.options.length === 0)) {
      this.nextIndicator.opacity = 1;
    }

    // Jika ada opsi pilihan
    if (this.currentStep?.options && this.currentStep.options.length > 0) {
      this.showOptions(this.currentStep.options);
    }
  }

  private showOptions(options: DialogOption[]) {
    if (!this.uiRoot) return;

    options.forEach((opt, idx) => {
      const btnY = 120 + idx * 22;
      const btn = this.uiRoot!.add([
        this.k.rect(140, 18, { radius: 4 }),
        this.k.pos(160, btnY),
        this.k.color(255, 245, 238),
        this.k.outline(1, this.k.Color.fromHex("#c47a6a")),
        this.k.area(),
      ]);

      const label = this.uiRoot!.add([
        this.k.text(opt.text, { size: 6 }),
        this.k.pos(168, btnY + 9),
        this.k.anchor("left"),
        this.k.color(60, 50, 50),
      ]);

      btn.onClick(() => {
        playClick();
        this.clearOptions();
        opt.onSelect();
        this.showNext();
      });

      this.optionsContainer.push(btn, label);
    });
  }

  advance() {
    if (!this.active) return;

    if (this.isTyping) {
      // Langsung selesaikan teks jika sedang mengetik
      if (this.typeTimer) {
        this.typeTimer.cancel();
      }
      this.finishTyping();
    } else if (!this.currentStep?.options || this.currentStep.options.length === 0) {
      // Lanjut ke step berikutnya jika tidak sedang menunggu pilihan
      playClick();
      this.showNext();
    }
  }

  close() {
    this.active = false;
    this.isTyping = false;
    this.currentStep = null;
    this.clearOptions();
    if (this.uiRoot) {
      this.uiRoot.destroy();
      this.uiRoot = null;
    }
  }
}

