import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { auth } from "@/lib/auth";
import { audit } from "@/lib/admin";
import { checkImage, MAX_PRODUCT_FILE_BYTES } from "@/lib/image-validation";
import { getStorage } from "@/lib/storage";
import { PRODUCTS_DIR } from "@/lib/storage-key";

/**
 * Una foto por peticion.
 *
 * Vercel corta el body en 4.5 MB, asi que mandar las ocho juntas revienta
 * aunque cada una pase el limite. El cliente (`components/admin/product-form.tsx`)
 * las manda de a una.
 */

/**
 * Tipos que el optimizador de `next/image` sabe convertir. Un pre-filtro
 * barato sobre lo que declara el navegador.
 */
const MIME_BY_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/avif": ".avif",
};

export async function POST(req: Request) {
  const session = await auth();
  if (session?.user?.role !== "SUPERADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Formulario inválido" }, { status: 400 });
  }

  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  if (files.length === 0) return NextResponse.json({ error: "Sin archivos" }, { status: 400 });
  if (files.length > 1) {
    return NextResponse.json(
      { error: "Sube las fotos de a una. El servidor admite una por petición." },
      { status: 400 },
    );
  }

  const file = files[0];
  if (!MIME_BY_EXT[file.type]) {
    return NextResponse.json(
      { error: `Tipo no permitido: ${file.type || file.name}` },
      { status: 400 },
    );
  }

  const bytes = Buffer.from(await file.arrayBuffer());

  // El Content-Type del navegador no vale como prueba: se mira el contenido.
  const check = checkImage(bytes, MAX_PRODUCT_FILE_BYTES);
  if (!check.ok) {
    const message =
      check.reason === "vacio"
        ? `"${file.name}" está vacío.`
        : check.reason === "no-es-imagen"
          ? `"${file.name}" no es una imagen válida.`
          : `"${file.name}" supera ${Math.round(MAX_PRODUCT_FILE_BYTES / 1024 / 1024)} MB.`;
    return NextResponse.json({ error: message }, { status: 400 });
  }

  // La extension la decide lo que realmente es el archivo, no el nombre.
  const key = `${PRODUCTS_DIR}/${Date.now()}-${randomUUID()}${check.detected.ext}`;
  const url = await getStorage().save(key, bytes, check.detected.mime);

  await audit("product.upload", "Product", undefined, session.user.id);
  return NextResponse.json({ urls: [url] });
}