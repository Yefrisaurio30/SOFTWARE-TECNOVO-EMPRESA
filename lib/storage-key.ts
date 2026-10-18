/**
 * Vocabulario compartido del almacenamiento de imagenes.
 *
 * Vive aparte de `lib/storage.ts` para que los drivers no dependan del
 * modulo que los elige: si `storage.ts` importara a los drivers y los
 * drivers importaran a `storage.ts`, habria un ciclo.
 */

/** Bucket de Supabase Storage. */
export const BUCKET = "uploads";

/** Subcarpetas dentro del bucket. */
export const PRODUCTS_DIR = "products";
export const LISTING_DIR = "listing";

/**
 * Carpeta local que el driver de disco usa como equivalente del bucket.
 * Con esta base las rutas son relativas (`/uploads/listing/x.png`), que es
 * lo que `next/image` resuelve contra el propio origen.
 */
export const DISK_PREFIX = "/uploads/";

/** Segmento que distingue una URL publica de objeto en la REST de Supabase. */
const OBJECT_MARK = "/storage/v1/object/";

function supabaseBase(): string {
  // Es una URL, no un secreto: puede ir con prefijo NEXT_PUBLIC_ sin que eso
  // exponga nada. Se lee aqui y no en el tope del modulo para que importar el
  // driver durante el build no reviente si la variable todavia no existe.
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!base) {
    throw new Error("Falta NEXT_PUBLIC_SUPABASE_URL (requerido por el driver supabase).");
  }
  return base.replace(/\/+$/, "");
}

/** URL publica de un objeto del bucket. */
export function publicUrl(key: string): string {
  return `${supabaseBase()}${OBJECT_MARK}public/${BUCKET}/${key}`;
}

/** URL de la REST de Storage, sin el bucket. */
export function storageUrl(suffix: string): string {
  return `${supabaseBase()}/storage/v1${suffix}`;
}

/**
 * Clave de un objeto dentro del bucket, deducida de su URL.
 *
 * Acepta las dos formas que conviven en la base de datos:
 *   - absoluta de Supabase: https://<ref>.supabase.co/storage/v1/object/public/uploads/listing/x.png
 *   - local del driver de disco: /uploads/listing/x.png
 *
 * Devuelve `null` cuando la URL no apunta al bucket. Eso incluye los
 * archivos estaticos del repo (`/motos/tec-force/lado-1.png`) y cualquier
 * URL externa: borrarlos o medirlos aqui seria un error.
 */
export function keyFromUrl(url: string): string | null {
  if (url.startsWith(DISK_PREFIX)) {
    const key = url.slice(DISK_PREFIX.length);
    return key || null;
  }
  const mark = url.indexOf(OBJECT_MARK);
  if (mark === -1) return null;
  const bucketMark = `/${BUCKET}/`;
  const start = url.indexOf(bucketMark, mark);
  if (start === -1) return null;
  const key = url.slice(start + bucketMark.length);
  return key || null;
}