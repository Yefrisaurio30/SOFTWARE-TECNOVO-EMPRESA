import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { stat, unlink } from "node:fs/promises";
import path from "node:path";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  checkImage,
  MAX_FILES,
  MAX_TOTAL_BYTES,
  overLimitMessage,
} from "@/lib/image-validation";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "listing");

/** Tamaño en disco de las imágenes ya guardadas en este anuncio. */
async function bytesOnDisk(urls: string[]): Promise<number> {
  let total = 0;
  for (const url of urls) {
    const name = path.basename(url);
    try {
      const s = await stat(path.join(UPLOAD_DIR, name));
      total += s.size;
    } catch {
      // Si el archivo ya no está, no cuenta.
    }
  }
  return total;
}

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

  const currentCount = listing.images.length;
  const room = MAX_FILES - currentCount;
  if (room <= 0) {
    return NextResponse.json(
      { error: `Ya tienes las ${MAX_FILES} fotos del anuncio.` },
      { status: 400 },
    );
  }
  if (files.length > room) {
    return NextResponse.json(
      { error: `Solo te caben ${room} foto(s) más: el máximo es ${MAX_FILES}.` },
      { status: 400 },
    );
  }

  let used = await bytesOnDisk(listing.images);
  await mkdir(UPLOAD_DIR, { recursive: true });

  const saved: string[] = [];
  const written: string[] = [];

  // Primero valida todo; si algo falla, no deja archivos a medias.
  const prepared: Array<{ name: string; buffer: Buffer; size: number }> = [];
  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const check = checkImage(buffer);
    if (!check.ok) {
      for (const p of written) await unlink(path.join(UPLOAD_DIR, p)).catch(() => {});
      const msg =
        check.reason === "no-es-imagen"
          ? `"${file.name}" no es una imagen válida (JPG, PNG, WebP, GIF, AVIF, HEIC o BMP).`
          : check.reason === "vacio"
            ? `"${file.name}" está vacío.`
            : `"${file.name}" supera el máximo por archivo.`;
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    if (used + check.bytes > MAX_TOTAL_BYTES) {
      for (const p of written) await unlink(path.join(UPLOAD_DIR, p)).catch(() => {});
      return NextResponse.json(
        { error: overLimitMessage(used + check.bytes - MAX_TOTAL_BYTES) },
        { status: 413 },
      );
    }
    used += check.bytes;
    // La extensión la decide lo que realmente es el archivo.
    const name = `${Date.now()}-${randomUUID()}${check.detected.ext}`;
    prepared.push({ name, buffer, size: check.bytes });
  }

  for (const p of prepared) {
    await writeFile(path.join(UPLOAD_DIR, p.name), p.buffer);
    written.push(p.name);
    saved.push(`/uploads/listing/${p.name}`);
  }

  await prisma.product.update({
    where: { id: listing.id },
    data: { images: [...listing.images, ...saved] },
  });

  return NextResponse.json({ urls: saved, usedBytes: used });
}

/** Quita una foto del borrador y la borra del disco. */
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
  await unlink(path.join(UPLOAD_DIR, path.basename(url))).catch(() => {});
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

  const usedBytes = await bytesOnDisk(listing.images);
  return NextResponse.json({ images: listing.images, usedBytes, status: listing.status });
}