"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/admin";
import { bytesOnDisk } from "@/lib/listing-images";
import { MAX_TOTAL_BYTES, overLimitMessage } from "@/lib/image-validation";
import { ListingDraftInput, MAX_LISTINGS_PER_DAY } from "@/lib/listing-validation";

async function ownListing(listingId: string) {
  const session = await auth();
  if (!session?.user) return null;
  const p = await prisma.product.findFirst({
    where: { id: listingId, ownerId: session.user.id },
  });
  return p ? { session, product: p } : null;
}

/** Paso 2 → 3: el borrador pasa a la cola de moderación. */
export async function submitForReview(listingId: string) {
  const own = await ownListing(listingId);
  if (!own) return { ok: false as const, error: "Anuncio no encontrado" };
  if (own.product.status !== "DRAFT") {
    return { ok: false as const, error: "Este anuncio ya fue enviado" };
  }

  // Revalida el peso por si alguien tocó los archivos por fuera.
  const used = await bytesOnDisk(own.product.images);
  if (used > MAX_TOTAL_BYTES) {
    return { ok: false as const, error: overLimitMessage(used - MAX_TOTAL_BYTES) };
  }

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const publishedToday = await prisma.product.count({
    where: {
      ownerId: own.session.user.id,
      status: { in: ["PENDING", "APPROVED", "REJECTED"] },
      createdAt: { gte: startOfToday },
    },
  });
  if (publishedToday >= MAX_LISTINGS_PER_DAY) {
    return {
      ok: false as const,
      error: `Llegaste al límite de ${MAX_LISTINGS_PER_DAY} publicaciones de hoy. Intenta mañana.`,
    };
  }

  await prisma.product.update({
    where: { id: listingId },
    data: { status: "PENDING", active: true, draftExpiresAt: null, reviewNote: null },
  });
  await audit("listing.submit", "Product", listingId, own.session.user.id);
  revalidatePath("/mis-anuncios");
  return { ok: true as const };
}

/** El dueño marca su moto como vendida: sale del catálogo de inmediato. */
export async function markAsSold(listingId: string) {
  const own = await ownListing(listingId);
  if (!own) return { ok: false as const, error: "Anuncio no encontrado" };
  if (own.product.status !== "APPROVED" || own.product.soldAt) {
    return {
      ok: false as const,
      error: "Solo puedes marcar como vendida un anuncio que ya fue aprobado.",
    };
  }
  await prisma.product.update({
    where: { id: listingId },
    data: { soldAt: new Date(), active: false },
  });
  await audit("listing.sold", "Product", listingId, own.session.user.id);
  revalidatePath("/mis-anuncios");
  revalidatePath("/motos-usadas");
  return { ok: true as const };
}

/** Edita un anuncio rechazado y lo devuelve a revisión. */
export async function resubmitListing(listingId: string, input: unknown) {
  const own = await ownListing(listingId);
  if (!own) return { ok: false as const, error: "Anuncio no encontrado" };
  if (own.product.status !== "REJECTED") {
    return { ok: false as const, error: "Solo puedes editar anuncios rechazados" };
  }
  const parsed = ListingDraftInput.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues[0].message };
  const d = parsed.data;

  await prisma.product.update({
    where: { id: listingId },
    data: {
      name: d.name,
      brand: d.brand,
      priceRetail: d.price,
      description: d.description,
      specs: {
        anio: d.year,
        kilometraje_km: d.km,
        ciudad: d.city,
        telefono: d.phone,
      },
      status: "PENDING",
      active: true,
      reviewNote: null,
    },
  });
  await audit("listing.resubmit", "Product", listingId, own.session.user.id);
  revalidatePath("/mis-anuncios");
  return { ok: true as const };
}

/** Descarta un borrador (o un rechazado sin editar). */
export async function discardListing(listingId: string) {
  const own = await ownListing(listingId);
  if (!own) return { ok: false as const, error: "Anuncio no encontrado" };
  if (own.product.status !== "DRAFT") {
    return { ok: false as const, error: "Solo puedes descartar borradores" };
  }
  await prisma.product.delete({ where: { id: listingId } });
  await audit("listing.discard", "Product", listingId, own.session.user.id);
  revalidatePath("/mis-anuncios");
  revalidatePath("/publicar");
  return { ok: true as const };
}