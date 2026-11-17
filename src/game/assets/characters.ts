import { PALETTE } from "./palette";

export interface CharacterAppearance {
  skin: "fair" | "warm" | "tan";
  hairStyle: "short" | "messy" | "bob" | "long" | "ponytail" | "hijab";
  hairColor: "black" | "brown" | "blonde" | "pink" | "blue";
  outfit: "blue" | "pink" | "sage" | "cream";
  accessory?: "none" | "glasses" | "ribbon" | "flower";
}

const SKIN_COLORS: Record<string, string> = {
  fair: PALETTE.skinFair,
  warm: PALETTE.skinWarm,
  tan: PALETTE.skinTan,
};

const HAIR_COLORS: Record<string, string> = {
  black: PALETTE.hairBlack,
  brown: PALETTE.hairBrown,
  blonde: PALETTE.hairBlonde,
  pink: PALETTE.hairPink,
  blue: PALETTE.hairBlue,
};

const OUTFIT_COLORS: Record<string, { shirt: string; shirtDark: string; pants: string }> = {
  blue: { shirt: "#76a5af", shirtDark: "#45818e", pants: "#3d5059" },
  pink: { shirt: "#f4a68e", shirtDark: "#c47a6a", pants: "#5a433f" },
  sage: { shirt: "#a8c599", shirtDark: "#7d9e6e", pants: "#414f3b" },
  cream: { shirt: "#fcecd2", shirtDark: "#d6be9a", pants: "#544637" },
};

/**
 * Merender satu frame karakter 16x24 langsung ke canvas context
 * dir: "down" | "up" | "left" | "right"
 * step: 0 (idle), 1 (left foot), 2 (right foot)
 */
function drawCharacterFrame(
  ctx: CanvasRenderingContext2D,
  offsetX: number,
  offsetY: number,
  app: CharacterAppearance,
  dir: "down" | "up" | "left" | "right",
  step: number
) {
  const skin = SKIN_COLORS[app.skin] || PALETTE.skinWarm;
  const hair = HAIR_COLORS[app.hairColor] || PALETTE.hairBlack;
  const outfit = OUTFIT_COLORS[app.outfit] || OUTFIT_COLORS.blue;
  const outline = "#231a1a";

  // Helper pixel drawer
  const p = (x: number, y: number, color: string) => {
    ctx.fillStyle = color;
    ctx.fillRect(offsetX + x, offsetY + y, 1, 1);
  };
  const rect = (x: number, y: number, w: number, h: number, color: string) => {
    ctx.fillStyle = color;
    ctx.fillRect(offsetX + x, offsetY + y, w, h);
  };

  // 1. Bayangan di bawah kaki (krem gelap / semi-transparan)
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.beginPath();
  ctx.ellipse(offsetX + 8, offsetY + 22, 6, 2, 0, 0, Math.PI * 2);
  ctx.fill();

  // 2. Kaki & Sepatu
  const footY = 19;
  if (dir === "down" || dir === "up") {
    const leftOffset = step === 1 ? -1 : 0;
    const rightOffset = step === 2 ? -1 : 0;
    // Kaki Kiri
    rect(5, footY + leftOffset, 2, 3, outfit.pants);
    rect(5, footY + 3 + leftOffset, 2, 1, outline);
    // Kaki Kanan
    rect(9, footY + rightOffset, 2, 3, outfit.pants);
    rect(9, footY + 3 + rightOffset, 2, 1, outline);
  } else if (dir === "right") {
    const stepOffset = step === 1 ? 1 : step === 2 ? -1 : 0;
    rect(6 + stepOffset, footY, 3, 3, outfit.pants);
    rect(6 + stepOffset, footY + 3, 3, 1, outline);
  } else if (dir === "left") {
    const stepOffset = step === 1 ? -1 : step === 2 ? 1 : 0;
    rect(7 + stepOffset, footY, 3, 3, outfit.pants);
    rect(7 + stepOffset, footY + 3, 3, 1, outline);
  }

  // 3. Badan / Baju
  rect(5, 12, 6, 7, outfit.shirt);
  rect(5, 18, 6, 1, outfit.shirtDark);

  // Tangan
  if (dir === "down") {
    rect(3, 13, 2, 4, outfit.shirt);
    rect(3, 17, 2, 2, skin); // tangan kiri
    rect(11, 13, 2, 4, outfit.shirt);
    rect(11, 17, 2, 2, skin); // tangan kanan
  } else if (dir === "up") {
    rect(3, 13, 2, 4, outfit.shirtDark);
    rect(11, 13, 2, 4, outfit.shirtDark);
  } else if (dir === "right") {
    rect(7, 13, 2, 4, outfit.shirt);
    rect(7, 17, 2, 2, skin);
  } else if (dir === "left") {
    rect(7, 13, 2, 4, outfit.shirt);
    rect(7, 17, 2, 2, skin);
  }

  // 4. Kepala & Wajah
  rect(4, 5, 8, 7, skin);

  // Mata & Pipi
  if (dir === "down") {
    p(5, 8, outline); // mata kiri
    p(10, 8, outline); // mata kanan
    p(4, 9, "#e88da2"); // rona pipi kiri
    p(11, 9, "#e88da2"); // rona pipi kanan
  } else if (dir === "right") {
    p(10, 8, outline);
    p(11, 9, "#e88da2");
  } else if (dir === "left") {
    p(5, 8, outline);
    p(4, 9, "#e88da2");
  }

  // 5. Rambut & Aksesori Sesuai Gaya
  if (app.hairStyle === "hijab") {
    // Hijab menutupi kepala dan leher
    rect(3, 3, 10, 5, hair);
    rect(3, 8, 2, 7, hair);
    rect(11, 8, 2, 7, hair);
    rect(4, 11, 8, 3, hair);
  } else {
    // Rambut Atas
    rect(3, 3, 10, 3, hair);
    rect(4, 2, 8, 1, hair);

    if (app.hairStyle === "short") {
      rect(3, 5, 2, 3, hair);
      rect(11, 5, 2, 3, hair);
    } else if (app.hairStyle === "messy") {
      rect(3, 5, 2, 4, hair);
      rect(11, 5, 2, 4, hair);
      p(4, 1, hair);
      p(9, 1, hair);
    } else if (app.hairStyle === "bob") {
      rect(3, 5, 2, 6, hair);
      rect(11, 5, 2, 6, hair);
    } else if (app.hairStyle === "long") {
      rect(3, 5, 2, 10, hair);
      rect(11, 5, 2, 10, hair);
      if (dir === "up") {
        rect(5, 5, 6, 8, hair);
      }
    } else if (app.hairStyle === "ponytail") {
      rect(3, 5, 2, 4, hair);
      rect(11, 5, 2, 4, hair);
      // Kuncir di samping/belakang
      if (dir === "right" || dir === "up") {
        rect(2, 4, 2, 6, hair);
      } else if (dir === "left") {
        rect(12, 4, 2, 6, hair);
      }
    }
  }

  // Aksesori
  if (app.accessory === "glasses" && (dir === "down" || dir === "right" || dir === "left")) {
    ctx.strokeStyle = "#444";
    ctx.lineWidth = 1;
    if (dir === "down") {
      ctx.strokeRect(offsetX + 4.5, offsetY + 7.5, 3, 2);
      ctx.strokeRect(offsetX + 8.5, offsetY + 7.5, 3, 2);
    }
  } else if (app.accessory === "ribbon" || app.accessory === "flower") {
    rect(10, 3, 3, 2, PALETTE.heartRed);
    p(11, 4, PALETTE.gold);
  }
}

/**
 * Menghasilkan spritesheet lengkap (12 frame: 4 arah x 3 frame jalan)
 * Ukuran frame: 16x24. Total lebar canvas: 16 * 12 = 192, tinggi 24.
 */
export function generateCharacterSpritesheet(app: CharacterAppearance): {
  dataURL: string;
  frameWidth: number;
  frameHeight: number;
  sliceX: number;
  sliceY: number;
  anims: Record<string, { from: number; to: number; loop: boolean; speed: number }>;
} {
  const frameWidth = 16;
  const frameHeight = 24;
  const totalFrames = 12;

  if (typeof document === "undefined") {
    return { dataURL: "", frameWidth, frameHeight, sliceX: 12, sliceY: 1, anims: {} as any };
  }

  const canvas = document.createElement("canvas");
  canvas.width = frameWidth * totalFrames;
  canvas.height = frameHeight;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = false;

  const directions: Array<"down" | "right" | "left" | "up"> = ["down", "right", "left", "up"];
  let frameIdx = 0;

  directions.forEach((dir) => {
    // 3 frame per arah: 0 = idle, 1 = walk left, 2 = walk right
    [0, 1, 2].forEach((step) => {
      drawCharacterFrame(ctx, frameIdx * frameWidth, 0, app, dir, step);
      frameIdx++;
    });
  });

  return {
    dataURL: canvas.toDataURL("image/png"),
    frameWidth,
    frameHeight,
    sliceX: 12,
    sliceY: 1,
    anims: {
      "idle-down": { from: 0, to: 0, loop: true, speed: 1 },
      "walk-down": { from: 0, to: 2, loop: true, speed: 7 },
      "idle-right": { from: 3, to: 3, loop: true, speed: 1 },
      "walk-right": { from: 3, to: 5, loop: true, speed: 7 },
      "idle-left": { from: 6, to: 6, loop: true, speed: 1 },
      "walk-left": { from: 6, to: 8, loop: true, speed: 7 },
      "idle-up": { from: 9, to: 9, loop: true, speed: 1 },
      "walk-up": { from: 9, to: 11, loop: true, speed: 7 },
    },
  };
}

