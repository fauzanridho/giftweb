import type { KAPLAYCtx } from "kaplay";
import { playDialogBlip, playClick } from "../audio/sfx";

export function introScene(k: KAPLAYCtx) {
  k.scene("intro", () => {
    k.add([
      k.rect(320, 240),
      k.pos(0, 0),
      k.color(30, 25, 35), // Gelap hangat malam
    ]);

    const lines = [
      "Di tengah samudra waktu yang tak bertepi...",
      "Ada sebuah pulau kecil yang sepi dan tenang.",
      "Pulau tempat semua cerita, tawa konyol, dan kenangan kita tersimpan.",
      "Selamat datang di Pulau Kita, Ay...",
    ];

    let currentLineIdx = 0;
    let displayedText = "";
    let charIdx = 0;
    let isTyping = true;
    let timer: any = null;

    const label = k.add([
      k.text("", { size: 8, width: 260, lineSpacing: 6 }),
      k.pos(160, 110),
      k.anchor("center"),
      k.color(252, 228, 214),
    ]);

    const prompt = k.add([
      k.text("Ketuk untuk lanjut >", { size: 6 }),
      k.pos(160, 180),
      k.anchor("center"),
      k.color(180, 150, 140),
      k.opacity(0),
    ]);

    function typeLine() {
      if (charIdx < lines[currentLineIdx].length) {
        displayedText += lines[currentLineIdx][charIdx];
        label.text = displayedText;
        charIdx++;
        if (charIdx % 2 === 0) {
          playDialogBlip();
        }
        timer = k.wait(0.04, typeLine);
      } else {
        isTyping = false;
        prompt.opacity = 1;
      }
    }

    function advance() {
      if (isTyping) {
        if (timer) timer.cancel();
        displayedText = lines[currentLineIdx];
        label.text = displayedText;
        isTyping = false;
        prompt.opacity = 1;
      } else {
        playClick();
        currentLineIdx++;
        if (currentLineIdx < lines.length) {
          displayedText = "";
          charIdx = 0;
          isTyping = true;
          prompt.opacity = 0;
          typeLine();
        } else {
          // Selesai intro -> Lanjut ke Character Creator
          k.go("creator");
        }
      }
    }

    k.onClick(advance);
    k.onKeyPress(["space", "enter"], advance);

    typeLine();
  });
}

