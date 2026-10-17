import { stat } from "node:fs/promises";
import path from "node:path";

export const LISTING_UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "listing");

/** Tamaño en disco de un conjunto de imágenes ya guardadas. */
export async function bytesOnDisk(urls: string[]): Promise<number> {
  let total = 0;
  for (const url of urls) {
    try {
      const s = await stat(path.join(LISTING_UPLOAD_DIR, path.basename(url)));
      total += s.size;
    } catch {
      // Si el archivo ya no existe, no cuenta para el tope.
    }
  }
  return total;
}