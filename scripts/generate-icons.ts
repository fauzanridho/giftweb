// Script to generate PWA icons using canvas (run with: node --experimental-modules scripts/generate-icons.mjs)
// Or just create simple colored squares as placeholder icons

import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = join(__dirname, "..", "public", "icons");
mkdirSync(iconsDir, { recursive: true });

// Generate a simple SVG icon and convert to PNG-like data
function generateIconSVG(size: number): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#fce4d6"/>
  <rect x="${size * 0.1}" y="${size * 0.1}" width="${size * 0.8}" height="${size * 0.8}" rx="${size * 0.1}" fill="#f4a68e"/>
  <rect x="${size * 0.15}" y="${size * 0.15}" width="${size * 0.7}" height="${size * 0.7}" rx="${size * 0.08}" fill="#fff5eb"/>
  <!-- Palm tree -->
  <rect x="${size * 0.45}" y="${size * 0.35}" width="${size * 0.1}" height="${size * 0.35}" fill="#8b6914"/>
  <!-- Leaves -->
  <ellipse cx="${size * 0.35}" cy="${size * 0.32}" rx="${size * 0.15}" ry="${size * 0.08}" fill="#6b8e5a" transform="rotate(-20 ${size * 0.35} ${size * 0.32})"/>
  <ellipse cx="${size * 0.65}" cy="${size * 0.32}" rx="${size * 0.15}" ry="${size * 0.08}" fill="#7da06a" transform="rotate(20 ${size * 0.65} ${size * 0.32})"/>
  <ellipse cx="${size * 0.5}" cy="${size * 0.28}" rx="${size * 0.12}" ry="${size * 0.08}" fill="#8db87a"/>
  <!-- Island -->
  <ellipse cx="${size * 0.5}" cy="${size * 0.72}" rx="${size * 0.3}" ry="${size * 0.1}" fill="#c8d8b9"/>
  <!-- Water -->
  <rect x="${size * 0.15}" y="${size * 0.75}" width="${size * 0.7}" height="${size * 0.12}" rx="${size * 0.03}" fill="#87ceeb" opacity="0.6"/>
  <!-- Heart -->
  <text x="${size * 0.5}" y="${size * 0.58}" text-anchor="middle" font-size="${size * 0.12}" fill="#e06060">♥</text>
</svg>`;
}

// Write SVG icons (browser will handle them fine as icons too)
[192, 512].forEach((size) => {
  const svg = generateIconSVG(size);
  writeFileSync(join(iconsDir, `icon-${size}.svg`), svg);
  console.log(`Generated icon-${size}.svg`);
});

console.log("\nNote: For production, convert SVGs to PNGs using a tool like sharp or online converter.");
console.log("For now, update manifest.webmanifest to reference .svg files, or use a PNG converter.");

