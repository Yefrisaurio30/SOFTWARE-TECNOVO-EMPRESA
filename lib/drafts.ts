import { prisma } from "@/lib/prisma";
import { DRAFT_TTL_MINUTES } from "@/lib/listing-validation";

/**
 * Elimina borradores vencidos (los que el usuario dejó a medias).
 * Corre de forma perezosa: en producción se puede llamar desde un cron.
 * Devuelve cuántos se fueron.
 */
export async function purgeExpiredDrafts(): Promise<number> {
  const now = new Date();
  const stale = await prisma.product.findMany({
    where: {
      status: "DRAFT",
      OR: [{ draftExpiresAt: { lt: now } }, { draftExpiresAt: null }],
    },
    select: { id: true, images: true },
  });
  if (stale.length === 0) return 0;

  // Sus imágenes se borran junto con el anuncio.
  const { unlink } = await import("node:fs/promises");
  const path = await import("node:path");
  const dir = path.join(process.cwd(), "public", "uploads", "listing");

  for (const d of stale) {
    for (const url of d.images) {
      await unlink(path.join(dir, path.basename(url))).catch(() => {});
    }
  }
  await prisma.product.deleteMany({ where: { id: { in: stale.map((d) => d.id) } } });
  return stale.length;
}

/** Extiende la vida de un borrador mientras el usuario sigue en la página. */
export async function touchDraft(id: string, userId: string): Promise<void> {
  await prisma.product
    .updateMany({
      where: { id, ownerId: userId, status: "DRAFT" },
      data: { draftExpiresAt: new Date(Date.now() + DRAFT_TTL_MINUTES * 60_000) },
    })
    .catch(() => undefined);
}