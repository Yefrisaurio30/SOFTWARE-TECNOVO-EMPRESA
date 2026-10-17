import { prisma } from "@/lib/prisma";
import {
  DRAFT_TTL_MINUTES,
  ListingDraftInput,
  MAX_CONCURRENT_DRAFTS,
  MAX_LISTINGS_PER_DAY,
  type ListingDraftData,
} from "@/lib/listing-validation";

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 70);
}

/** Slug único: si ya existe se agrega un sufijo corto. */
async function uniqueSlug(base: string): Promise<string> {
  const root = base || "moto-usada";
  const clash = await prisma.product.findUnique({ where: { slug: root }, select: { id: true } });
  if (!clash) return root;
  return `${root}-${Date.now().toString(36)}`;
}

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function getListingQuota(userId: string) {
  const [publishedToday, drafts] = await Promise.all([
    prisma.product.count({
      where: {
        ownerId: userId,
        status: { in: ["PENDING", "APPROVED", "REJECTED"] },
        createdAt: { gte: startOfToday() },
      },
    }),
    prisma.product.count({ where: { ownerId: userId, status: "DRAFT" } }),
  ]);
  return {
    publishedToday,
    drafts,
    remainingToday: Math.max(0, MAX_LISTINGS_PER_DAY - publishedToday),
    draftSlots: Math.max(0, MAX_CONCURRENT_DRAFTS - drafts),
  };
}

export type CreateDraftResult =
  | { ok: true; id: string }
  | { ok: false; error: string; code?: "quota" };

/**
 * Paso 1 del marketplace. Crea el producto como DRAFT: invisible, sin moderar
 * y sin contar contra la cuota diaria. El usuario lo envía a revisión al final.
 */
export async function createDraft(userId: string, input: unknown): Promise<CreateDraftResult> {
  const parsed = ListingDraftInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const q = await getListingQuota(userId);
  if (q.draftSlots <= 0) {
    return {
      ok: false,
      error: `Ya tienes ${MAX_CONCURRENT_DRAFTS} publicaciones a medio hacer. Termina una o descártala antes de empezar otra.`,
      code: "quota",
    };
  }

  const d: ListingDraftData = parsed.data;
  const slug = await uniqueSlug(slugify(`${d.brand}-${d.name}-${d.year}`));

  const product = await prisma.product.create({
    data: {
      slug,
      name: d.name,
      type: "MOTO_USADA",
      brand: d.brand,
      priceRetail: d.price,
      priceWholesale: null,
      stock: 1,
      description: d.description,
      images: [],
      specs: {
        anio: d.year,
        kilometraje_km: d.km,
        ciudad: d.city,
        telefono: d.phone,
      },
      featured: false,
      active: false,
      status: "DRAFT",
      ownerId: userId,
      draftExpiresAt: new Date(Date.now() + DRAFT_TTL_MINUTES * 60_000),
    },
    select: { id: true },
  });

  return { ok: true, id: product.id };
}