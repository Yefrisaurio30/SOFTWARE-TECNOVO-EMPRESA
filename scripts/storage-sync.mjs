/**
 * Sincroniza imagenes entre el bucket de Supabase Storage y `public/uploads`.
 *
 * Se usa para dos cosas:
 *   - Llevar a Supabase las fotos que quedaron en `public/uploads` y no viajan
 *     al repo porque estan en `.gitignore`.
 *   - Bajarlas del bucket cuando la app pase al VPS con `STORAGE_DRIVER=disk`.
 *
 * Uso:
 *   node scripts/storage-sync.mjs upload public/uploads/listing/1792214700946-...png ...
 *   node scripts/storage-sync.mjs upload --prefix listing public/uploads/listing/*.png
 *   node scripts/storage-sync.mjs download --prefix listing
 *   node scripts/storage-sync.mjs list
 *
 * Nunca imprime el valor de las llaves: solo el mapeo clave -> URL.
 *
 * Lee las variables de `.env.production.local`, o de `.env` si no existe.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, extname, join } from "node:path";

const BUCKET = "uploads";
const DISK_ROOT = join(process.cwd(), "public", "uploads");

/** Sniffer minimo: los primeros bytes mandan, no la extension. */
function sniff(bytes) {
  const starts = (sig, offset = 0) =>
    sig.every((b, i) => bytes[offset + i] === b) && bytes.length >= offset + sig.length;
  if (starts([0xff, 0xd8, 0xff])) return { ext: ".jpg", mime: "image/jpeg" };
  if (starts([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return { ext: ".png", mime: "image/png" };
  if (starts([0x47, 0x49, 0x46, 0x38])) return { ext: ".gif", mime: "image/gif" };
  if (starts([0x42, 0x4d])) return { ext: ".bmp", mime: "image/bmp" };
  if (
    starts([0x52, 0x49, 0x46, 0x46]) &&
    bytes.length >= 12 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return { ext: ".webp", mime: "image/webp" };
  }
  if (bytes.length >= 12 && bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70) {
    const brand = String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11]);
    if (brand.startsWith("avif") || brand.startsWith("avis")) return { ext: ".avif", mime: "image/avif" };
  }
  return null;
}

function loadEnv() {
  for (const name of [".env.production.local", ".env"]) {
    const path = join(process.cwd(), name);
    if (!existsSync(path)) continue;
    try {
      process.loadEnvFile(path);
    } catch {
      // Node viejo: se parsea a mano.
      for (const raw of readFileSync(path, "utf8").split(/\r?\n/)) {
        const line = raw.trim();
        if (!line || line.startsWith("#")) continue;
        const eq = line.indexOf("=");
        if (eq === -1) continue;
        const key = line.slice(0, eq).trim();
        if (key && process.env[key] === undefined) process.env[key] = line.slice(eq + 1).trim();
      }
    }
  }
}

function config() {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!base) throw new Error("Falta NEXT_PUBLIC_SUPABASE_URL.");
  if (!key) throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY.");
  return { base, key };
}

async function api(path, init) {
  const { base, key } = config();
  const res = await fetch(`${base}/storage/v1${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${key}`, apikey: key, ...(init.headers ?? {}) },
  });
  if (!res.ok) {
    throw new Error(`${init.method ?? "GET"} ${path}: ${res.status} ${await res.text().catch(() => "")}`);
  }
  return res;
}

const publicUrl = (key) => `${config().base}/storage/v1/object/public/${BUCKET}/${key}`;

async function upload(file, prefix) {
  const bytes = readFileSync(file);
  const detected = sniff(bytes);
  if (!detected) {
    console.error(`  FALLO ${file}: no es una imagen reconocida.`);
    return null;
  }
  // La clave se deriva del archivo (1792214700946-5705cd10-...), no de la
  // fecha del upload: asi el mapeo con la base de datos es estable y el
  // nombre sobrevive a una segunda subida.
  const stem = basename(file, extname(file));
  const key = `${prefix}/${stem}${detected.ext}`;
  await api(`/object/${BUCKET}/${key}`, {
    method: "POST",
    headers: {
      "Content-Type": detected.mime,
      "x-upsert": "true",
      "cache-control": "31536000",
    },
    body: bytes,
  });
  console.log(`  ${key}\t${publicUrl(key)}`);
  return { key, url: publicUrl(key), ext: detected.ext, source: file };
}

async function download(key) {
  const res = await api(`/object/${BUCKET}/${encodeURI(key)}`);
  const bytes = Buffer.from(await res.arrayBuffer());
  const dest = join(DISK_ROOT, key);
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, bytes);
  console.log(`  ${key}\t${bytes.length} bytes`);
  return bytes.length;
}

async function list(prefix) {
  let total = 0;
  for (let offset = 0; ; offset += 1000) {
    const res = await api(`/object/list/${BUCKET}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prefix, limit: 1000, offset }),
    });
    const page = await res.json();
    if (!Array.isArray(page) || page.length === 0) break;
    for (const o of page) {
      const size = o.metadata?.size ?? 0;
      total += size;
      console.log(`  ${String(size).padStart(9)}  ${o.name}`);
    }
    if (page.length < 1000) break;
  }
  console.log(`\n  Total: ${total} bytes (${(total / 1024 / 1024).toFixed(2)} MB) en el plan gratis de 1 GB`);
}

/**
 * Prueba de extremo a extremo del almacenamiento: sube un PNG de 1x1, lo pide
 * por la URL publica SIN credencial (como lo haria next/image) y compara.
 *
 * Es la unica forma de probar de verdad las tres capas: la escritura con llave
 * de servicio, la politica de lectura de storage.objects, y que la API de
 * Storage resuelva el bucket. Un INSERT en storage.buckets no garantiza nada
 * de eso: si falta la politica de RLS, o la API no refresca el bucket, todo
 * pasa en silencio y las fotos dan 403.
 */
async function verify() {
  // PNG de 1x1 transparente, minimo valido.
  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    "base64",
  );
  const key = `listing/_verificacion-${Date.now()}.png`;

  console.log("1. Subiendo con la llave de servicio...");
  await api(`/object/${BUCKET}/${key}`, {
    method: "POST",
    headers: { "Content-Type": "image/png", "x-upsert": "true" },
    body: png,
  });
  console.log("   ok");

  console.log("2. Pidiendo por la URL publica, sin credencial...");
  const url = publicUrl(key);
  const res = await fetch(url);
  const text = await res.text();
  if (!res.ok) {
    console.error(`   FALLA: HTTP ${res.status} ${text}`);
    console.error("");
    console.error("   Si dice NoSuchBucket, a la API de Storage no le llega el bucket.");
    console.error("   Revisa que exista en el dashboard y que este Public.");
    process.exit(1);
  }
  if (text.includes("NoSuchBucket")) {
    console.error("   FALLA: NoSuchBucket. El bucket existe en la tabla pero la API no lo ve.");
    process.exit(1);
  }
  console.log(`   ok (${res.status}, ${text.length} bytes)`);

  console.log("3. Borrando...");
  await api(`/object/${BUCKET}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prefixes: [key] }),
  });
  console.log("   ok");

  console.log("\nLas tres capas funcionan: escritura, lectura publica y borrado.");
}

/**
 * Reescribe en la base de datos las rutas locales /uploads/... por las URL
 * publicas del bucket.
 *
 * Es el paso que hace falta cuando `public/uploads` esta en .gitignore: las
 * filas de la base apuntan a /uploads/listing/x.png, ese archivo no viaja al
 * repo, y en Vercel (sin disco) la foto sale rota.
 *
 * Solo reescribe si el objeto EXISTE en el bucket. Si falta, avisa y no toca
 * la fila: es preferible una URL rota y visible a perder la referencia sin
 * saberlo. Es idempotente, se puede correr las veces que haga falta.
 */
async function relocate() {
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();
  try {
    // hasSome exige el arreglo completo y no admite subcadenas, asi que no
    // sirve para encontrar rutas /uploads/... Se buscan los que tienen imagenes
    // y se filtra aqui: el catalogo es de decenas de filas, no compensa paginar.
    const candidates = await prisma.product.findMany({
      where: { images: { isEmpty: false } },
      select: { id: true, name: true, images: true },
    });
    const products = candidates.filter((p) => p.images.some((u) => u.startsWith("/uploads/")));

    if (products.length === 0) {
      console.log("Ningun producto apunta a /uploads/. Nada que hacer.");
      return;
    }

    // Indice de lo que hay en el bucket. La API lista relativo al prefijo y con
    // prefix "" solo sale la raiz, asi que hay que listar carpeta por carpeta y
    // volver a armar la clave completa.
    const present = new Map();
    const dirs = new Set([""]);
    for (const p of products) {
      for (const url of p.images) {
        const key = url.startsWith("/uploads/") ? url.slice("/uploads/".length) : null;
        if (!key) continue;
        const cut = key.lastIndexOf("/");
        dirs.add(cut === -1 ? "" : key.slice(0, cut + 1));
      }
    }
    for (const dir of dirs) {
      for (let offset = 0; ; offset += 1000) {
        const res = await api(`/object/list/${BUCKET}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prefix: dir, limit: 1000, offset }),
        });
        const page = await res.json();
        if (!Array.isArray(page) || page.length === 0) break;
        for (const o of page) {
          if (typeof o?.metadata?.size === "number") present.set(`${dir}${o.name}`, o.metadata.size);
        }
        if (page.length < 1000) break;
      }
    }
    console.log(`${present.size} objeto(s) en el bucket.`);

    let changed = 0;
    let missing = 0;
    for (const p of products) {
      const next = [];
      let dirty = false;
      for (const url of p.images) {
        const key = url.startsWith("/uploads/") ? url.slice("/uploads/".length) : null;
        if (!key) {
          next.push(url);
          continue;
        }
        if (!present.has(key)) {
          console.error(`  FALTA en el bucket: ${key}  (lo dejo como esta)`);
          missing += 1;
          next.push(url);
          continue;
        }
        next.push(publicUrl(key));
        dirty = true;
      }
      if (dirty) {
        await prisma.product.update({ where: { id: p.id }, data: { images: next } });
        changed += 1;
        console.log(`  ${p.name} [${p.id}]`);
        for (const u of next) console.log(`    ${u}`);
      }
    }

    console.log(`\n${changed} producto(s) reescrito(s), ${missing} imagen(es) sin equivalente en el bucket.`);
  } finally {
    await prisma.$disconnect();
  }
}

function parseArgs(argv) {
  const args = argv.slice(2);
  const command = args.shift();
  let prefix = "listing";
  const files = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--prefix") prefix = args[++i];
    else files.push(args[i]);
  }
  return { command, prefix, files };
}

const { command, prefix, files } = parseArgs(process.argv);

try {
  loadEnv();

  if (command === "upload") {
    if (files.length === 0) {
      console.error("Faltan archivos. Ejemplo:");
      console.error("  node scripts/storage-sync.mjs upload --prefix listing public/uploads/listing/x.png");
      process.exit(1);
    }
    console.log(`Subiendo ${files.length} archivo(s) a ${BUCKET}/${prefix}/`);
    const results = [];
    for (const file of files) {
      const r = await upload(file, prefix);
      if (r) results.push(r);
    }
    console.log(`\n${results.length} archivo(s) subidos. Actualiza la base de datos con:`);
    console.log(`  psql -> UPDATE "Product" SET images = ARRAY[...] WHERE id = '...'`);
    console.log(`Las URL publicas van en la primera columna de cada linea de arriba.`);
  } else if (command === "download") {
    console.log(`Descargando ${BUCKET}/${prefix}/ a public/uploads/`);
    const res = await api(`/object/list/${BUCKET}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prefix, limit: 1000 }),
    });
    const page = await res.json();
    for (const o of page) await download(o.name);
    console.log(`\nListo. Cambia STORAGE_DRIVER a disk y reescribe las URLs de la base de datos.`);
  } else if (command === "verify") {
    await verify();
  } else if (command === "relocate") {
    await relocate();
  } else if (command === "list") {
    console.log(`Contenido de ${BUCKET}/${prefix}/`);
    await list(prefix);
  } else {
    console.log("Uso:");
    console.log("  node scripts/storage-sync.mjs verify");
    console.log("  node scripts/storage-sync.mjs upload --prefix listing <archivo...>");
    console.log("  node scripts/storage-sync.mjs relocate");
    console.log("  node scripts/storage-sync.mjs download --prefix listing");
    console.log("  node scripts/storage-sync.mjs list [--prefix listing]");
    process.exit(1);
  }
} catch (error) {
  console.error(`ERROR: ${error.message}`);
  process.exit(1);
}