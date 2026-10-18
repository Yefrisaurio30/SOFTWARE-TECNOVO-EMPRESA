import { BUCKET, keyFromUrl, publicUrl, storageUrl } from "./storage-key";

/**
 * Driver de Supabase Storage vía REST, sin dependencias.
 *
 * Por que no `@supabase/supabase-js`: `AGENTS.md` fija el stack y aqui solo
 * hacen falta cuatro operaciones (subir, borrar, listar, medir). Traer el SDK
 * por eso seria meterle Bundle extra a las rutas de imagen.
 *
 * Habla con el bucket y solo con el bucket: una URL ajena (un archivo estatico
 * del repo, un `/motos/...`) se ignora en silencio.
 */

/** La REST lista como mucho esta cantidad de objetos por peticion. */
const PAGE = 1000;

interface StorageObject {
  name: string;
  metadata?: { size?: number | null } | null;
}

function serviceKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!key) {
    throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY (requerido por el driver supabase).");
  }
  return key;
}

async function call(suffix: string, init: RequestInit): Promise<Response> {
  const res = await fetch(storageUrl(suffix), {
    ...init,
    headers: {
      Authorization: `Bearer ${serviceKey()}`,
      apikey: serviceKey(),
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Supabase Storage ${init.method ?? "GET"} ${suffix}: ${res.status} ${body}`);
  }
  return res;
}

/** Claves unicas, en orden, ignorando lo que no sea del bucket. */
function keysOf(urls: string[]): string[] {
  const seen = new Set<string>();
  const keys: string[] = [];
  for (const url of urls) {
    const key = keyFromUrl(url);
    if (key && !seen.has(key)) {
      seen.add(key);
      keys.push(key);
    }
  }
  return keys;
}

/**
 * Lista una carpeta del bucket y devuelve nombre -> tamano.
 *
 * Storage usa carpetas virtuales: el listado recibe un `prefix` y devuelve los
 * nombres RELATIVOS a ese prefijo. Con `prefix: ""` no salen los archivos, solo
 * la raiz con las carpetas dentro. Por eso hay que listar carpeta por carpeta y
 * no una sola vez por todo el bucket.
 */
async function listDir(dir: string): Promise<Map<string, number>> {
  const sizes = new Map<string, number>();
  for (let offset = 0; ; offset += PAGE) {
    const res = await call(`/object/list/${BUCKET}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // `prefix` es obligatorio: sin la propiedad la API responde 400
      // "body must have required property 'prefix'".
      body: JSON.stringify({ prefix: dir, limit: PAGE, offset }),
    });
    const page = (await res.json()) as StorageObject[];
    if (!Array.isArray(page) || page.length === 0) break;
    for (const object of page) {
      const size = object?.metadata?.size;
      if (typeof size === "number") sizes.set(object.name, size);
    }
    if (page.length < PAGE) break;
  }
  return sizes;
}

export const supabaseDriver = {
  async save(key: string, bytes: Uint8Array, mime: string): Promise<string> {
    await call(`/object/${BUCKET}/${key}`, {
      method: "POST",
      headers: {
        "Content-Type": mime || "application/octet-stream",
        // Re-subir la misma clave reemplaza el objeto en vez de fallar.
        "x-upsert": "true",
        "cache-control": "31536000",
      },
      // Blob y no el Uint8Array crudo: es lo que acepta BodyInit, y ademas
      // respeta el offset si el buffer es una vista de uno mas grande.
      body: new Blob([bytes as BlobPart], { type: mime || "application/octet-stream" }),
    });
    return publicUrl(key);
  },

  async remove(urls: string[]): Promise<void> {
    const keys = keysOf(urls);
    if (keys.length === 0) return;
    await call(`/object/${BUCKET}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prefixes: keys }),
    });
  },

  /**
   * Suma el tamano de los objetos pedidos.
   *
   * Va por listado en vez de un HEAD por URL: son pocas llamadas de red en
   * lugar de N, y el tamano sale del `metadata.size` que Storage ya devuelve.
   * Agrupa por carpeta porque la API solo lista lo relativo al prefijo que se
   * le pase.
   */
  async bytesOf(urls: string[]): Promise<number> {
    const wanted = keysOf(urls);
    if (wanted.length === 0) return 0;

    const byDir = new Map<string, Set<string>>();
    for (const key of wanted) {
      const cut = key.lastIndexOf("/");
      const dir = cut === -1 ? "" : key.slice(0, cut + 1);
      const name = cut === -1 ? key : key.slice(cut + 1);
      let names = byDir.get(dir);
      if (!names) {
        names = new Set<string>();
        byDir.set(dir, names);
      }
      names.add(name);
    }

    let total = 0;
    for (const [dir, names] of byDir) {
      const sizes = await listDir(dir);
      for (const name of names) total += sizes.get(name) ?? 0;
    }
    return total;
  },
};