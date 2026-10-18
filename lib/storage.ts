import { diskDriver } from "./storage-disk";
import { supabaseDriver } from "./storage-supabase";

/**
 * Almacenamiento de imagenes detras de una interfaz.
 *
 * Por que existe: en Vercel el filesystem de una funcion es de solo lectura,
 * asi que escribir en `public/uploads` falla con EROFS. En el VPS con Docker si
 * hay disco. Con este adaptador pasar de uno al otro es cambiar
 * `STORAGE_DRIVER`, no reescribir las rutas.
 *
 * Contrato:
 *  - `save` devuelve una URL lista para `next/image`: absoluta en Supabase,
 *    relativa en disco.
 *  - `remove` y `bytesOf` ignoran lo que no viva en el bucket (por ejemplo un
 *    `/motos/tec-force/lado-1.png`, que es un archivo estatico del repo).
 */
export interface StorageDriver {
  save(key: string, bytes: Uint8Array, mime: string): Promise<string>;
  remove(urls: string[]): Promise<void>;
  bytesOf(urls: string[]): Promise<number>;
}

/**
 * Valores admitidos: `disk` (local y VPS) y `supabase` (Vercel).
 * Por defecto `disk`, para que `npm run dev` siga funcionando sin tocar `.env`.
 */
export function getStorage(): StorageDriver {
  switch ((process.env.STORAGE_DRIVER ?? "disk").trim().toLowerCase()) {
    case "":
    case "disk":
      return diskDriver;
    case "supabase":
      return supabaseDriver;
    default:
      throw new Error(
        "STORAGE_DRIVER inválido. Valores admitidos: disk, supabase.",
      );
  }
}