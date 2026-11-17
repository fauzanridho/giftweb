/**
 * Mengonversi array baris string pixel menjadi Canvas Data URL (PNG).
 * Tiap karakter merepresentasikan kode warna pada palette.
 */
export function spriteToDataURL(
  rows: string[],
  palette: Record<string, string>,
  scale = 1
): string {
  if (typeof document === "undefined") return "";

  const h = rows.length;
  const w = rows[0]?.length || 0;
  if (w === 0 || h === 0) return "";

  const canvas = document.createElement("canvas");
  canvas.width = w * scale;
  canvas.height = h * scale;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  ctx.imageSmoothingEnabled = false;

  for (let y = 0; y < h; y++) {
    const row = rows[y];
    for (let x = 0; x < w; x++) {
      const char = row[x];
      const color = palette[char];
      if (color && color !== "transparent" && color !== ".") {
        ctx.fillStyle = color;
        ctx.fillRect(x * scale, y * scale, scale, scale);
      }
    }
  }

  return canvas.toDataURL("image/png");
}

/**
 * Menggabungkan beberapa frame sprite menjadi satu horizontal Spritesheet Data URL.
 * Sangat berguna untuk animasi (Kaplay sliceX).
 */
export function createSpritesheetDataURL(
  frames: string[][],
  palette: Record<string, string>,
  scale = 1
): { dataURL: string; frameWidth: number; frameHeight: number; count: number } {
  if (typeof document === "undefined" || frames.length === 0) {
    return { dataURL: "", frameWidth: 0, frameHeight: 0, count: 0 };
  }

  const count = frames.length;
  const frameHeight = frames[0].length;
  const frameWidth = frames[0][0]?.length || 0;

  const canvas = document.createElement("canvas");
  canvas.width = frameWidth * count * scale;
  canvas.height = frameHeight * scale;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return { dataURL: "", frameWidth: 0, frameHeight: 0, count: 0 };
  }

  ctx.imageSmoothingEnabled = false;

  frames.forEach((rows, fIdx) => {
    const offsetX = fIdx * frameWidth * scale;
    for (let y = 0; y < frameHeight; y++) {
      const row = rows[y];
      for (let x = 0; x < frameWidth; x++) {
        const char = row[x];
        const color = palette[char];
        if (color && color !== "transparent" && color !== ".") {
          ctx.fillStyle = color;
          ctx.fillRect(offsetX + x * scale, y * scale, scale, scale);
        }
      }
    }
  });

  return {
    dataURL: canvas.toDataURL("image/png"),
    frameWidth,
    frameHeight,
    count,
  };
}

