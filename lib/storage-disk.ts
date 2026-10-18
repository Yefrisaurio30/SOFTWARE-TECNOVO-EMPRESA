import { mkdir, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { DISK_PREFIX, keyFromUrl } from "./storage-key";

/**
 * Driver de disco: escribe en `public/uploads/...`.
 *
 * Es el que se usa en local y en el VPS con Docker (el volumen persistente).
 * Devuelve rutas relativas, que es lo que hay hoy y lo que `next/image`
 * sirve desde el propio origen sin pedirle al optimizador remoto.
 *
 * En Vercel este driver no sirve: el filesystem de una funcion es de solo
 * lectura y `writeFile` falla con EROFS. Para eso esta `STORAGE_DRIVER`.
 */
const ROOT = path.join(process.cwd(), "public", "uploads");

/** Resuelve una clave dentro del bucket rechazando cualquier `..`. */
function safePath(key: string): string | null {
  const dest = path.resolve(ROOT, key);
  if (dest !== ROOT && !dest.startsWith(ROOT + path.sep)) return null;
  return dest;
}

export const diskDriver = {
  async save(key: string, bytes: Uint8Array): Promise<string> {
    const dest = safePath(key);
    if (!dest) throw new Error(`Clave de imagen invalida: ${key}`);
    await mkdir(path.dirname(dest), { recursive: true });
    await writeFile(dest, bytes);
    return `${DISK_PREFIX}${key}`;
  },

  async remove(urls: string[]): Promise<void> {
    for (const url of urls) {
      const key = keyFromUrl(url);
      if (!key) continue;
      const dest = safePath(key);
      if (!dest) continue;
      await unlink(dest).catch(() => undefined);
    }
  },

  async bytesOf(urls: string[]): Promise<number> {
    let total = 0;
    for (const url of urls) {
      const key = keyFromUrl(url);
      if (!key) continue;
      const dest = safePath(key);
      if (!dest) continue;
      try {
        total += (await stat(dest)).size;
      } catch {
        // Si el archivo ya no esta, no cuenta para el tope.
      }
    }
    return total;
  },
};