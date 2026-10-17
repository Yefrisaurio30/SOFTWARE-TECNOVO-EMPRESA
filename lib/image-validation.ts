/**
 * Validación de imágenes por contenido real, no por nombre ni por el
 * Content-Type que declara el navegador.
 *
 * Por qué: si aceptamos lo que el cliente dice, un archivo HTML o SVG con
 * JavaScript se guardaría en `public/` y se serviría desde nuestro propio
 * dominio → XSS almacenado (robo de sesión). Mirar los primeros bytes es la
 * única forma fiable de saber qué es realmente el archivo.
 */

/** Tope del anuncio: 8 MB entre todas las fotos. */
export const MAX_TOTAL_BYTES = 8 * 1024 * 1024;
/** Máximo de archivos por anuncio. */
export const MAX_FILES = 5;
/** Tope por archivo: evita que uno solo se coma todo el presupuesto. */
export const MAX_FILE_BYTES = 8 * 1024 * 1024;

export interface DetectedImage {
  ext: string;
  mime: string;
}

function startsWith(buf: Uint8Array, bytes: number[], offset = 0): boolean {
  if (buf.length < offset + bytes.length) return false;
  return bytes.every((b, i) => buf[offset + i] === b);
}

/**
 * Detecta el tipo real de una imagen por sus bytes iniciales.
 * Devuelve null si no es una imagen reconocida.
 */
export function detectImage(buf: Uint8Array): DetectedImage | null {
  // JPEG: FF D8 FF
  if (startsWith(buf, [0xff, 0xd8, 0xff])) return { ext: ".jpg", mime: "image/jpeg" };
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (startsWith(buf, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
    return { ext: ".png", mime: "image/png" };
  // GIF: "GIF87a" / "GIF89a"
  if (buf.length >= 6 && buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x38)
    return { ext: ".gif", mime: "image/gif" };
  // RIFF....WEBP
  if (startsWith(buf, [0x52, 0x49, 0x46, 0x46]) && buf.length >= 12) {
    const isWebp =
      buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50;
    if (isWebp) return { ext: ".webp", mime: "image/webp" };
  }
  // AVIF/HEIC: ....ftyp
  if (buf.length >= 12 && buf[4] === 0x66 && buf[5] === 0x74 && buf[6] === 0x79 && buf[7] === 0x70) {
    const brand = String.fromCharCode(buf[8], buf[9], buf[10], buf[11]);
    if (brand.startsWith("avif") || brand.startsWith("avis"))
      return { ext: ".avif", mime: "image/avif" };
    if (brand.startsWith("heic") || brand.startsWith("heix") || brand.startsWith("mif1"))
      return { ext: ".heic", mime: "image/heic" };
  }
  // BMP: "BM"
  if (startsWith(buf, [0x42, 0x4d])) return { ext: ".bmp", mime: "image/bmp" };
  return null;
}

export type ImageCheck =
  | { ok: true; bytes: number; detected: DetectedImage }
  | { ok: false; reason: "vacio" | "demasiado-grande" | "no-es-imagen" };

/**
 * Valida un archivo: tamaño y que sea una imagen de verdad.
 * La extensión final la decide `detected`, nunca el nombre enviado.
 */
export function checkImage(bytes: Uint8Array, maxBytes = MAX_FILE_BYTES): ImageCheck {
  if (bytes.length === 0) return { ok: false, reason: "vacio" };
  if (bytes.length > maxBytes) return { ok: false, reason: "demasiado-grande" };
  const detected = detectImage(bytes);
  if (!detected) return { ok: false, reason: "no-es-imagen" };
  return { ok: true, bytes: bytes.length, detected };
}

export function formatKB(bytes: number): string {
  const kb = Math.ceil(bytes / 1024);
  if (kb >= 1024) {
    const mb = Math.floor(kb / 1024);
    const rest = kb % 1024;
    return rest === 0 ? `${mb} MB` : `${mb} MB ${rest} KB`;
  }
  return `${kb} KB`;
}

/** Texto de error cuando el anuncio se pasa del tope. */
export function overLimitMessage(excessBytes: number): string {
  return `Te pasaste por ${formatKB(excessBytes)}. No se puede subir la publicación.`;
}