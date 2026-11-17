import { spriteToDataURL, createSpritesheetDataURL } from "./pixel";
import { PALETTE } from "./palette";

// Palette shorthand khusus Tile 16x16
const TP: Record<string, string> = {
  ".": "transparent",
  g: PALETTE.G2, // rumput sage
  G: PALETTE.G3, // rumput gelap
  d: PALETTE.G4, // bayangan rumput
  l: PALETTE.G1, // highlight rumput
  s: PALETTE.K2, // pasir
  S: PALETTE.K3, // pasir gelap
  w: PALETTE.W3, // air
  W: PALETTE.W4, // air dalam
  h: PALETTE.W1, // buih ombak
  t: PALETTE.K5, // tanah
  T: PALETTE.K6, // tanah gelap
  k: PALETTE.woodMid,
  K: PALETTE.woodDark,
  j: PALETTE.woodLight,
};

// 1. Rumput Utama (16x16)
const grassGrid1 = [
  "gggggggggggggggg",
  "gggggggGgggggggg",
  "ggggggGGgggggggg",
  "gggggggggggglggg",
  "ggGggggggggglggg",
  "ggGGgggggggggggg",
  "gggggggggggggggg",
  "gggggggggggggGgg",
  "gggglgggggggGGgg",
  "gggglggggggggggg",
  "gggggggggggggggg",
  "gggggggGgggggggg",
  "ggggggGGgggglggg",
  "ggggggggggglgggg",
  "gggggggggggggggg",
  "gggggggggggggggg",
];

// Rumput Bunga Kecil (Variasi)
const grassFlowerGrid = [
  "gggggggggggggggg",
  "gggggggGgggggggg",
  "ggdggggGgggggggg",
  "ggdggggggggggggg",
  "gggggghggggggggg",
  "gggggP3hgggglggg",
  "ggggghgggggglggg",
  "gggggggggggggggg",
  "gggggggggggggGgg",
  "gggglgggggggGGgg",
  "gggglggggggggggg",
  "gggggggggP3ggggg",
  "gggggggGghP3hggg",
  "ggggggGGgghggggg",
  "gggggggggggggggg",
  "gggggggggggggggg",
];

// 2. Pasir Pantai (16x16)
const sandGrid = [
  "ssssssssssssssss",
  "ssssssssssssSsss",
  "sssssssssssSSsss",
  "ssSsssssssssssss",
  "ssSSssssssssssss",
  "ssssssssssssssss",
  "ssssssssssssssss",
  "sssssssSssssssss",
  "ssssssSSssssssss",
  "ssssssssssssssss",
  "ssssssssssssssss",
  "sssssssssSssssss",
  "sssssssssSssssss",
  "ssSsssssssssssss",
  "ssssssssssssssss",
  "ssssssssssssssss",
];

// 3. Air Laut Beranimasi (3 Frame Ombak)
const waterFrame1 = [
  "wwwwwwwwwwwwwwww",
  "wwwwwwwwwwwwwwww",
  "hhhhwwwwwwwwwwww",
  "wwWhhhhhhhhhwwww",
  "wwwwwwwwwwwwwwww",
  "wwwwwwwwwwwwwwww",
  "wwwwwwwwwwwwwwww",
  "wwwwwwwwWhhhhhww",
  "wwwwwwwwwwwwwwww",
  "wwwwwwwwwwwwwwww",
  "whhhhhwwwwwwwwww",
  "wwwwwwwwwwwwwwww",
  "wwwwwwwwwwwwwwww",
  "wwwwwwwwwwwwwwww",
  "wwwwwwwwwhhhhwww",
  "wwwwwwwwwwwwwwww",
];

const waterFrame2 = [
  "wwwwwwwwwwwwwwww",
  "wwwwwwwwwwwwwwww",
  "wWhhhhwwwwwwwwww",
  "wwwwWhhhhhwwwwww",
  "wwwwwwwwwwwwwwww",
  "wwwwwwwwwwwwwwww",
  "wwwwwwwwwwwwwwww",
  "wwwwwwwwwwWhhhww",
  "wwwwwwwwwwwwwwww",
  "wwwwwwwwwwwwwwww",
  "wwWhhhhwwwwwwwww",
  "wwwwwwwwwwwwwwww",
  "wwwwwwwwwwwwwwww",
  "wwwwwwwwwwwwwwww",
  "wwwwwwwwwwWhhhww",
  "wwwwwwwwwwwwwwww",
];

const waterFrame3 = [
  "wwwwwwwwwwwwwwww",
  "wwwwwwwwwwwwwwww",
  "wwWhhhwwwwwwwwww",
  "wwwwwWhhhhwwwwww",
  "wwwwwwwwwwwwwwww",
  "wwwwwwwwwwwwwwww",
  "wwwwwwwwwwwwwwww",
  "wwwwwwwwwwwWhhww",
  "wwwwwwwwwwwwwwww",
  "wwwwwwwwwwwwwwww",
  "wwwWhhhwwwwwwwww",
  "wwwwwwwwwwwwwwww",
  "wwwwwwwwwwwwwwww",
  "wwwwwwwwwwwwwwww",
  "wwwwwwwwwwwWhhww",
  "wwwwwwwwwwwwwwww",
];

// 4. Lantai Kayu (16x16)
const woodFloorGrid = [
  "jjjjjjjjjjjjjjjj",
  "kkkkkkkkkkkkkkkk",
  "kkkkkkkKkkkkkkkk",
  "kkkkkkkKkkkkkkkk",
  "KKKKKKKKKKKKKKKK",
  "jjjjjjjjjjjjjjjj",
  "kkkkkkkkkkkkkkkk",
  "kkkkkkkkkkkkkkkK",
  "kkkkkkkkkkkkkkkK",
  "KKKKKKKKKKKKKKKK",
  "jjjjjjjjjjjjjjjj",
  "kkkkkkkkkkkkkkkk",
  "kkkkkKkkkkkkkkkk",
  "kkkkkKkkkkkkkkkk",
  "KKKKKKKKKKKKKKKK",
  "kkkkkkkkkkkkkkkk",
];

// 5. Tanah Kebun (16x16)
const soilGrid = [
  "tttttttttttttttt",
  "ttttttTttttttttt",
  "ttTtttTTttttTttt",
  "ttTTtttttttTTttt",
  "tttttttttttttttt",
  "ttttttttttTttttt",
  "ttTttttttTTttttt",
  "ttTTtttttttttttt",
  "tttttttttttttttt",
  "ttttttTttttttttt",
  "ttTtttTTtttttttt",
  "ttTTttttttttTttt",
  "tttttttttttTTttt",
  "tttttttttttttttt",
  "ttttTttttttttttt",
  "tttTTttttttttttt",
];

export function generateTileAssets() {
  const grass = spriteToDataURL(grassGrid1, TP);
  const grassFlower = spriteToDataURL(grassFlowerGrid, { ...TP, P3: PALETTE.P3 });
  const sand = spriteToDataURL(sandGrid, TP);
  const woodFloor = spriteToDataURL(woodFloorGrid, TP);
  const soil = spriteToDataURL(soilGrid, TP);

  // Spritesheet animasi air (3 frame)
  const water = createSpritesheetDataURL([waterFrame1, waterFrame2, waterFrame3], TP);

  return {
    grass,
    grassFlower,
    sand,
    woodFloor,
    soil,
    water,
  };
}

