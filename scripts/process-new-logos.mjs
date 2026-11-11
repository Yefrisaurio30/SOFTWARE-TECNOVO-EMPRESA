/**
 * One-off: convierte los JPEG de logos nuevos (fondo checkerboard) en PNG
 * con transparencia real, y genera la marca circular + favicon.
 * Uso: node scripts/process-new-logos.mjs
 */
import sharp from "sharp";
import { mkdirSync, copyFileSync } from "node:fs";
import path from "node:path";

const DOWNLOADS = "C:/Users/MAIN/Downloads";
const PUBLIC_BRAND = "public/brand";
const ASSETS_BRAND = "assets/brand";
mkdirSync(ASSETS_BRAND, { recursive: true });

const isContentBlack = (r, g, b, a) => {
  if (a === 0) return false;
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return lum < 150; // el logo es negro puro; el checkerboard es claro
};

const isContentGreen = (r, g, b, a) => {
  if (a === 0) return false;
  return g > 110 && g > r * 1.25 && g > b * 1.25; // verde neón; el checkerboard es gris neutro
};

async function extract(input, keep) {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const out = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0; i < info.width * info.height; i++) {
    const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2], a = data[i * 4 + 3];
    const [or, og, ob, oa] = keep(r, g, b, a) ? [r, g, b, 255] : [0, 0, 0, 0];
    out[i * 4] = or; out[i * 4 + 1] = og; out[i * 4 + 2] = ob; out[i * 4 + 3] = oa;
  }
  return sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } });
}

async function saveLogo(input, keep, outName) {
  const img = await extract(input, keep);
  const trimmed = await img.trim({ threshold: 10 }).png().toBuffer();
  const meta = await sharp(trimmed).metadata();
  await sharp(trimmed).toFile(path.join(PUBLIC_BRAND, outName));
  copyFileSync(path.join(PUBLIC_BRAND, outName), path.join(ASSETS_BRAND, outName));
  console.log(`${outName}: ${meta.width}x${meta.height}`);
  return trimmed;
}

async function emblemSquare(fullPng, outName, size) {
  // Recorta el emblema circular (primer blob desde la izquierda)
  const { data, info } = await sharp(fullPng).raw().toBuffer({ resolveWithObject: true });
  const colHasContent = (x) => {
    for (let y = 0; y < info.height; y++) {
      if (data[(y * info.width + x) * 4 + 3] > 0) return true;
    }
    return false;
  };
  let start = -1, gapStart = -1;
  for (let x = 0; x < info.width; x++) {
    const has = colHasContent(x);
    if (has && start === -1) start = x;
    if (start !== -1 && !has) { gapStart = x; break; }
  }
  if (start === -1) throw new Error("no content");
  const end = gapStart === -1 ? info.width : gapStart;
  let top = info.height, bottom = 0;
  for (let y = 0; y < info.height; y++) {
    for (let x = start; x < end; x++) {
      if (data[(y * info.width + x) * 4 + 3] > 0) {
        top = Math.min(top, y); bottom = Math.max(bottom, y);
      }
    }
  }
  const side = Math.max(end - start, bottom - top + 1);
  const emblem = await sharp(fullPng)
    .extract({ left: start, top, width: end - start, height: bottom - top + 1 })
    .extend({
      top: Math.floor((side - (bottom - top + 1)) / 2),
      bottom: Math.ceil((side - (bottom - top + 1)) / 2),
      left: Math.floor((side - (end - start)) / 2),
      right: Math.ceil((side - (end - start)) / 2),
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .resize(size, size)
    .png()
    .toBuffer();
  await sharp(emblem).toFile(path.join(PUBLIC_BRAND, outName));
  copyFileSync(path.join(PUBLIC_BRAND, outName), path.join(ASSETS_BRAND, outName));
  console.log(`${outName}: ${size}x${size} (recorte ${start}..${end})`);
}

const black = await saveLogo(
  path.join(DOWNLOADS, "Logo-nuevo-negro.jpeg"),
  isContentBlack,
  "tecnovo-logo-negro.png",
);
await saveLogo(
  path.join(DOWNLOADS, "Logo-nuevo-verde.jpeg"),
  isContentGreen,
  "tecnovo-logo-verde.png",
);
await emblemSquare(black, "tecnovo-mark-512.png", 512);
await emblemSquare(black, "favicon-64.png", 64);
console.log("OK");
