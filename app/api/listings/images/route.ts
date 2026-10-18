import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  checkImage,
  MAX_FILES,
  MAX_TOTAL_BYTES,
  overLimitMessage,
} from "@/lib/image-validation";
import { getStorage } from "@/lib/storage";
import { LISTING_DIR } from "@/lib/storage-key";

/**
 * Una foto por peticion: Vercel corta el body en 4.5 MB. El cliente
 * (`components/listing/photo-step.tsx`) las manda de a una.
 */

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Entra a tu cuenta" }, { status: 401 });

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Formulario inválido" }, { status: 400 });
  }
  const listingId = String(form.get("listingId") ?? "");
  if (!listingId) return NextResponse.json({ error: "Falta listingId" }, { status: 400 });

  // Solo se puede tocar un borrador propio.
  const listing = await prisma.product.findFirst({
    where: { id: listingId, ownerId: session.user.id, status: "DRAFT" },
    select: { id: true, images: true },
  });
  if (!listing) {
    return NextResponse.json({ error: "Anuncio no encontrado" }, { status: 404 });
  }

  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  if (files.length === 0) return NextResponse.json({ error: "Sin archivos" }, { status: 400 });
  if (files.length > 1) {
    return NextResponse.json(
      { error: "Sube las fotos de a una. El servidor admite una por petición." },
      { status: 400 },
    );
  }

  const currentCount = listing.images.length;
  const room = MAX_FILES - currentCount;
  if (room <= 0) {
    return NextResponse.json(
      { error: `Ya tienes las ${MAX_FILES} fotos del anuncio.` },
      { status: 400 },
    );
  }

  const storage = getStorage();
  let used = await storage.bytesOf(listing.images);

  // Se valida todo antes de subir nada: si un archivo esta malo no queda ni una
  // foto a medias en el almacenamiento.
  const file = files[0];
  const buffer = Buffer.from(await file.arrayBuffer());
  const check = checkImage(buffer);
  if (!check.ok) {
    const msg =
      check.reason === "no-es-imagen"
        ? `"${file.name}" no es una imagen válida (JPG, PNG, WebP, GIF, AVIF, HEIC o BMP).`
        : check.reason === "vacio"
          ? `"${file.name}" está vacío.`
          : `"${file.name}" supera el máximo por archivo.`;
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  if (used + check.bytes > MAX_TOTAL_BYTES) {
    return NextResponse.json(
      { error: overLimitMessage(used + check.bytes - MAX_TOTAL_BYTES) },
      { status: 413 },
    );
  }
  used += check.bytes;

  const key = `${LISTING_DIR}/${Date.now()}-${randomUUID()}${check.detected.ext}`;
  let url: string;
  try {
    url = await storage.save(key, buffer, check.detected.mime);
  } catch {
    return NextResponse.json(
      { error: "No se pudo guardar la foto. Intenta de nuevo." },
      { status: 502 },
    );
  }

  await prisma.product.update({
    where: { id: listing.id },
    data: { images: [...listing.images, url] },
  });

  return NextResponse.json({ urls: [url], usedBytes: used });
}

/** Quita una foto del borrador y la borra del almacenamiento. */
export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Entra a tu cuenta" }, { status: 401 });

  const url = new URL(req.url).searchParams.get("url");
  if (!url) return NextResponse.json({ error: "Falta url" }, { status: 400 });

  const listing = await prisma.product.findFirst({
    where: { ownerId: session.user.id, status: "DRAFT" },
    select: { id: true, images: true },
  });
  if (!listing || !listing.images.includes(url)) {
    return NextResponse.json({ error: "Foto no encontrada" }, { status: 404 });
  }

  await prisma.product.update({
    where: { id: listing.id },
    data: { images: listing.images.filter((u) => u !== url) },
  });
  await getStorage().remove([url]).catch(() => undefined);
  return NextResponse.json({ ok: true });
}

/** Estado del borrador: fotos y peso usado. */
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Entra a tu cuenta" }, { status: 401 });

  const listingId = new URL(req.url).searchParams.get("listingId");
  if (!listingId) return NextResponse.json({ error: "Falta listingId" }, { status: 400 });

  const listing = await prisma.product.findFirst({
    where: { id: listingId, ownerId: session.user.id },
    select: { id: true, images: true, status: true },
  });
  if (!listing) return NextResponse.json({ error: "Anuncio no encontrado" }, { status: 404 });

  const usedBytes = await getStorage().bytesOf(listing.images);
  return NextResponse.json({ images: listing.images, usedBytes, status: listing.status });
}