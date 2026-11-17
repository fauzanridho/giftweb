// Palet Warna Hangat & Cozy "Pulau Kita"
// Gaya: Pastel lembut, pixel-art retro hangat
export const PALETTE = {
  // Transparan
  ".": "transparent",

  // Peach & Merah Muda
  P1: "#ffebe3", // Peach sangat muda (highlight)
  P2: "#fcd5c7", // Peach muda
  P3: "#f4a68e", // Peach utama (tema)
  P4: "#e2876e", // Peach gelap / bayangan
  P5: "#c47a6a", // Cokelat peach pekat

  // Krem & Tanah
  K1: "#fff9f2", // Krem terang
  K2: "#f5ebd9", // Krem pasir pantai
  K3: "#e0d0b8", // Pasir basah
  K4: "#bfa382", // Tanah kebun muda
  K5: "#856a4b", // Tanah kebun subur
  K6: "#543e2b", // Tanah gelap / batang kayu

  // Sage & Hijau Daun
  G1: "#eef5e6", // Sage muda pucat
  G2: "#c8d8b9", // Sage hijau utama (rumput)
  G3: "#9bb885", // Hijau daun sedang
  G4: "#6f9453", // Hijau daun rimbun
  G5: "#496833", // Hijau bayangan pohon

  // Biru Langit & Air
  W1: "#e0f4ff", // Busa ombak / highlight air
  W2: "#aee0f7", // Air dangkal tepi pantai
  W3: "#6dbce8", // Air laut utama
  W4: "#4593c4", // Air laut dalam
  W5: "#2b678f", // Biru laut malam

  // Nuansa Kayu & Rumah
  woodLight: "#c89d7c",
  woodMid: "#9e7051",
  woodDark: "#6b4731",

  // Karakter & Rambut
  skinFair: "#ffdfd3",
  skinWarm: "#f5c3a8",
  skinTan: "#d99b7b",
  hairBlack: "#2b2323",
  hairBrown: "#5c3d2e",
  hairBlonde: "#e0b86c",
  hairPink: "#e88da2",
  hairBlue: "#5b84b1",

  // Aksen Spesial
  gold: "#f7d047",
  heartRed: "#e65353",
  shadow: "rgba(0,0,0,0.25)",
  outline: "#231a1a",
} as const;

export type PaletteKey = keyof typeof PALETTE;

