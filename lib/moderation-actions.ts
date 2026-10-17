"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { audit, requireAdmin } from "@/lib/admin";

const Decision = z.enum(["APPROVED", "REJECTED"]);

/**
 * Aprueba o rechaza un anuncio. El motivo solo se exige al rechazar:
 * el usuario lo lee en /mis-anuncios y corrige con esa información.
 */
export async function reviewListing(
  listingId: string,
  decision: string,
  reviewNote?: string,
) {
  const session = await requireAdmin();
  const parsed = Decision.safeParse(decision);
  if (!parsed.success) return { ok: false as const, error: "Decisión inválida" };

  const note = (reviewNote ?? "").trim().slice(0, 500);
  if (parsed.data === "REJECTED" && note.length < 5) {
    return {
      ok: false as const,
      error: "Escribe el motivo del rechazo: el usuario lo necesita para corregir.",
    };
  }

  const listing = await prisma.product.findUnique({
    where: { id: listingId },
    select: { id: true, status: true, ownerId: true, name: true },
  });
  if (!listing) return { ok: false as const, error: "Anuncio no encontrado" };
  // Un DRAFT nunca entra a moderación.
  if (listing.status === "DRAFT") {
    return { ok: false as const, error: "Ese anuncio está a medio hacer" };
  }

  await prisma.product.update({
    where: { id: listingId },
    data: {
      status: parsed.data,
      // Aprobar lo hace visible; rechazar lo saca del aire.
      active: parsed.data === "APPROVED",
      reviewNote: parsed.data === "REJECTED" ? note : null,
    },
  });
  await audit(
    `listing.${parsed.data === "APPROVED" ? "approve" : "reject"}`,
    "Product",
    listingId,
    session.user.id,
  );
  revalidatePath("/admin/anuncios");
  revalidatePath("/mis-anuncios");
  revalidatePath("/motos-usadas");
  revalidatePath("/");
  return { ok: true as const };
}