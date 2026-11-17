import { spriteToDataURL } from "./pixel";
import { PALETTE } from "./palette";

const PP: Record<string, string> = {
  ".": "transparent",
  G: PALETTE.G4, // daun hijau tua
  g: PALETTE.G3, // daun hijau muda
  l: PALETTE.G2, // pucuk daun
  b: PALETTE.K6, // batang cokelat tua
  B: PALETTE.woodMid, // batang kayu sedang
  w: PALETTE.woodLight, // kayu muda
  k: PALETTE.K2, // kain tenda krem
  m: PALETTE.P3, // kain tenda merah/peach
  p: PALETTE.P5, // gerobak/besi
  o: PALETTE.gold, // lentera/kuah emas
  c: "#ffffff", // mangkuk/asap putih
  q: "#8c6239", // pentol bakso
  r: PALETTE.heartRed, // cabai/saus/bunga
  s: PALETTE.K3, // batu abu-abu/pasir
  S: PALETTE.K4, // batu bayangan
};

// 1. Pohon Rindang / Tropis (32x32)
export function generateTreeSprite(): string {
  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = false;

  // Bayangan tanah
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.beginPath();
  ctx.ellipse(16, 29, 10, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Batang Pohon
  ctx.fillStyle = PALETTE.K6;
  ctx.fillRect(14, 18, 4, 11);
  ctx.fillStyle = PALETTE.woodMid;
  ctx.fillRect(15, 18, 2, 10);

  // Daun Lingkar (Pixel Chibi)
  const drawFoliageCircle = (cx: number, cy: number, r: number, color: string) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  };

  // Lapisan Daun Belakang & Tengah
  drawFoliageCircle(16, 12, 11, PALETTE.G5);
  drawFoliageCircle(12, 11, 8, PALETTE.G4);
  drawFoliageCircle(20, 11, 8, PALETTE.G4);
  drawFoliageCircle(16, 8, 8, PALETTE.G3);

  // Highlight pucuk
  drawFoliageCircle(14, 7, 5, PALETTE.G2);
  drawFoliageCircle(18, 8, 4, PALETTE.G2);

  return canvas.toDataURL("image/png");
}

// 2. Gerobak Bakso Legendaris (32x24)
export function generateBaksoCartSprite(): string {
  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 24;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = false;

  // Bayangan
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.fillRect(2, 21, 28, 3);

  // Roda gerobak
  ctx.fillStyle = PALETTE.K6;
  ctx.fillRect(5, 17, 5, 5);
  ctx.fillRect(22, 17, 5, 5);
  ctx.fillStyle = PALETTE.K3;
  ctx.fillRect(6, 18, 3, 3);
  ctx.fillRect(23, 18, 3, 3);

  // Badan Gerobak Kayu
  ctx.fillStyle = PALETTE.woodMid;
  ctx.fillRect(3, 10, 26, 8);
  ctx.fillStyle = PALETTE.woodDark;
  ctx.fillRect(3, 10, 26, 1);
  ctx.fillRect(3, 17, 26, 1);

  // Etalase Kaca & Panci Bakso
  ctx.fillStyle = "#8ecae6"; // Kaca
  ctx.fillRect(5, 4, 12, 6);
  ctx.fillStyle = "#adb5bd"; // Panci Kuah Panas
  ctx.fillRect(19, 6, 8, 4);
  ctx.fillStyle = PALETTE.gold; // Kuah kaldu berkilau
  ctx.fillRect(20, 6, 6, 2);

  // Tiang & Atap Tenda Belang-belang (Peach & Krem)
  ctx.fillStyle = PALETTE.woodDark;
  ctx.fillRect(3, 2, 1, 8);
  ctx.fillRect(28, 2, 1, 8);

  // Atap kanopi
  for (let i = 0; i < 7; i++) {
    ctx.fillStyle = i % 2 === 0 ? PALETTE.P3 : PALETTE.K1;
    ctx.fillRect(2 + i * 4, 0, 4, 3);
  }

  return canvas.toDataURL("image/png");
}

// 3. Mangkuk Bakso Pentol (16x16)
const bowlGrid = [
  "................",
  "......cc........",
  ".....c..c.......",
  "................",
  "....qq..qq......",
  "...qqqqqqqq.....",
  "..qqqrqqqqqq....",
  "..oooooooooo....",
  "..cccccccccc....",
  "...cccccccc.....",
  "....cccccc......",
  ".....cccc.......",
  "......cc........",
  "................",
  "................",
  "................",
];

// 4. Lentera Malam Hangat (16x16)
const lanternGrid = [
  "................",
  "......bb........",
  ".....bwwb.......",
  ".....boob.......",
  "....boooolb.....",
  "....boooool.....",
  "....boooool.....",
  ".....boob.......",
  ".....bwwb.......",
  "......bb........",
  "......bb........",
  "......bb........",
  "......bb........",
  ".....bbbb.......",
  "....bbbbbb......",
  "................",
];

// 5. Semak Bunga Romantis (16x16)
const flowerBushGrid = [
  "................",
  ".....GGGG.......",
  "...GGggggGG.....",
  "..GgggglgggG....",
  ".GggggrgggggG...",
  ".GgggrrrogggG...",
  "GgggggrroggggG..",
  "GggrgggggggggG..",
  "GgrrrgggggrggG..",
  "GggrgggggrrrgG..",
  ".GgggggggrrggG..",
  ".GgggggggggggG..",
  "..GGggggggGG....",
  "....GGGGGG......",
  ".....bbbb.......",
  "................",
];

// 6. Perahu Pantai Kecil (32x16)
export function generateBoatSprite(): string {
  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 16;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = false;

  // Bayangan di air
  ctx.fillStyle = "rgba(43, 103, 143, 0.4)";
  ctx.fillRect(2, 12, 28, 3);

  // Lambung Perahu Kayu
  ctx.fillStyle = PALETTE.woodMid;
  ctx.beginPath();
  ctx.moveTo(2, 6);
  ctx.lineTo(30, 6);
  ctx.lineTo(26, 12);
  ctx.lineTo(6, 12);
  ctx.closePath();
  ctx.fill();

  // Garis kayu & detail
  ctx.fillStyle = PALETTE.woodDark;
  ctx.fillRect(4, 5, 24, 1);
  ctx.fillRect(8, 7, 16, 1);
  ctx.fillStyle = PALETTE.woodLight;
  ctx.fillRect(10, 8, 12, 3);

  return canvas.toDataURL("image/png");
}

// 7. Batu Penolong (NPC Puzzle Fallback) (16x16)
const helperStoneGrid = [
  "................",
  "................",
  ".....ssss.......",
  "...ssSSSSss.....",
  "..sSS....SSs....",
  "..sS..P3..Ss....",
  ".sSS......SSs...",
  ".sS..r..r..Ss...",
  ".sSS......SSs...",
  ".sSS......SSs...",
  "..sSS.ww.SSs....",
  "..sSSSSSSSSs....",
  "...ssSSSSss.....",
  ".....ssss.......",
  "................",
  "................",
];

export function generatePropAssets() {
  const tree = generateTreeSprite();
  const baksoCart = generateBaksoCartSprite();
  const boat = generateBoatSprite();
  const bowl = spriteToDataURL(bowlGrid, PP);
  const lantern = spriteToDataURL(lanternGrid, PP);
  const flowerBush = spriteToDataURL(flowerBushGrid, PP);
  const helperStone = spriteToDataURL(helperStoneGrid, { ...PP, r: PALETTE.heartRed });

  return {
    tree,
    baksoCart,
    boat,
    bowl,
    lantern,
    flowerBush,
    helperStone,
  };
}

