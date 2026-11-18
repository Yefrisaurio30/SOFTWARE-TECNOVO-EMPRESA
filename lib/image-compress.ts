/**
 * Compresión automática de fotos subidas, con `sharp`.
 *
 * Objetivo: aceptar cualquier formato de imagen que mande el usuario
 * (JPG, PNG, WebP, GIF, AVIF, HEIC, BMP, TIFF, SVG) y guardar un archivo
 * liviano y uniforme, para que la tienda no cargue megas de más.
 *
 * Qué hace:
 *  - Corrige la orientación EXIF (fotos de celular de lado).
 *  - Reduce a máximo 1600px por lado (suficiente para web, nunca agranda).
 *  - Convierte a WebP calidad 78 → en general 5-10 veces menos peso.
 *  - Rasteriza los SVG: el archivo guardado es un bitmap sin JavaScript,
 *    así que el riesgo de XSS del SVG desaparece al convertirlo.
 *
 * Excepción: los GIF animados se guardan tal cual, porque convertirlos a
 * WebP estático perdería la animación.
 */

import sharp from "sharp";
import type { DetectedImage } from "@/lib/image-validation";

/** Lado máximo de la foto guardada. */
const MAX_DIMENSION = 1600;
/** Calidad WebP: equilibrio peso/calidad para fotos de producto. */
const QUALITY = 78;
/** Tope de píxeles de entrada: evita descompresión excesiva (SVG gigante). */
const MAX_INPUT_PIXELS = 50_000_000;

export interface CompressedImage {
  buffer: Buffer;
  ext: string;
  mime: string;
  /** true si el archivo pasó por sharp (no es el original). */
  compressed: boolean;
}

/**
 * Comprime y normaliza una imagen ya validada. Nunca falla: si sharp no
 * puede procesar el formato, devuelve el original tal cual para que no se
 * rechace una foto válida.
 */
export async function compressImage(
  input: Buffer,
  detected: DetectedImage,
): Promise<CompressedImage> {
  // GIF animado: sin conversión para no perder la animación.
  if (detected.mime === "image/gif") {
    return { buffer: input, ext: detected.ext, mime: detected.mime, compressed: false };
  }

  try {
    const output = await sharp(input, {
      failOn: "none",
      limitInputPixels: MAX_INPUT_PIXELS,
    })
      .rotate() // respeta el EXIF de orientación
      .resize({
        width: MAX_DIMENSION,
        height: MAX_DIMENSION,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: QUALITY })
      .toBuffer();

    return { buffer: output, ext: ".webp", mime: "image/webp", compressed: true };
  } catch {
    // Formato que sharp no pudo procesar: se guarda el original.
    return { buffer: input, ext: detected.ext, mime: detected.mime, compressed: false };
  }
}
