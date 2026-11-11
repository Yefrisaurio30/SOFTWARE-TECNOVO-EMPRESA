import { afterAll, describe, expect, it } from "vitest";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getCatalog, getProductBySlug, getBrandsByType } from "@/lib/products";
import { priceOrderItems } from "@/lib/orders";
import { MAX_CONCURRENT_DRAFTS, MAX_LISTINGS_PER_DAY } from "@/lib/listing-validation";

const TAG = `test-c2c-${Date.now()}`;

async function mkUser() {
  return prisma.user.create({
    data: {
      email: `${TAG}-${Math.random().toString(36).slice(2, 8)}@test.co`,
      name: "Vendedor Test",
      passwordHash: await bcrypt.hash("x", 4),
    },
  });
}

async function mkListing(
  ownerId: string,
  status: "DRAFT" | "PENDING" | "APPROVED" | "REJECTED",
  extra: Partial<{ active: boolean; soldAt: Date | null; stock: number }> = {},
) {
  return prisma.product.create({
    data: {
      slug: `${TAG}-${status}-${Math.random().toString(36).slice(2, 8)}`,
      name: "TEC-ONE de prueba",
      type: "MOTO_USADA",
      brand: "TECNOVO",
      priceRetail: 1_849_900,
      stock: 1,
      description: "Anuncio de prueba para verificar la moderación del marketplace.",
      specs: { anio: 2022, kilometraje_km: 8000, ciudad: "Villavicencio", telefono: "3000000000" },
      ownerId,
      status,
      active: extra.active ?? status === "APPROVED",
      soldAt: extra.soldAt ?? null,
      ...(extra.stock != null ? { stock: extra.stock } : {}),
    },
  });
}

const owners: string[] = [];
const ids: string[] = [];

afterAll(async () => {
  if (ids.length > 0) {
    await prisma.orderItem.deleteMany({ where: { productId: { in: ids } } });
    await prisma.product.deleteMany({ where: { id: { in: ids } } });
  }
  await prisma.user.deleteMany({ where: { email: { contains: TAG } } });
  await prisma.$disconnect();
}, 20000);

describe("Moderación: el catálogo solo muestra APPROVED", () => {
  it("oculta DRAFT, PENDING y REJECTED del catálogo de usadas", async () => {
    const u = await mkUser();
    owners.push(u.id);
    const draft = await mkListing(u.id, "DRAFT");
    const pending = await mkListing(u.id, "PENDING");
    const rejected = await mkListing(u.id, "REJECTED");
    const approved = await mkListing(u.id, "APPROVED");
    ids.push(draft.id, pending.id, rejected.id, approved.id);

    const { items } = await getCatalog(["MOTO_USADA"], {});
    const visibles = items.map((p) => p.id);
    expect(visibles).not.toContain(draft.id);
    expect(visibles).not.toContain(pending.id);
    expect(visibles).not.toContain(rejected.id);
    expect(visibles).toContain(approved.id);
  });

  it("no deja ver un anuncio pendiente por URL directa", async () => {
    const u = await mkUser();
    owners.push(u.id);
    const pending = await mkListing(u.id, "PENDING");
    ids.push(pending.id);
    expect(await getProductBySlug(pending.slug)).toBeNull();
  });

  it("un anuncio aprobado se ve por su slug", async () => {
    const u = await mkUser();
    owners.push(u.id);
    const ok = await mkListing(u.id, "APPROVED");
    ids.push(ok.id);
    const found = await getProductBySlug(ok.slug);
    expect(found?.id).toBe(ok.id);
  });

  it("el inventario de la tienda (sin dueño) sigue visible", async () => {
    const { items } = await getCatalog(["MOTO_USADA"], {});
    const sinDueño = items.filter((p) => p.ownerId == null);
    expect(sinDueño.length).toBeGreaterThan(0);
  });

  it("getBrandsByType ignora anuncios no aprobados", async () => {
    const u = await mkUser();
    owners.push(u.id);
    const marca = `MarcaTest${Math.random().toString(36).slice(2, 6)}`;
    const pendiente = await prisma.product.create({
      data: {
        slug: `${TAG}-brand-${Math.random().toString(36).slice(2, 8)}`,
        name: "X",
        type: "MOTO_USADA",
        brand: marca,
        priceRetail: 100,
        ownerId: u.id,
        status: "PENDING",
        active: true,
      },
    });
    ids.push(pendiente.id);
    const marcas = await getBrandsByType(["MOTO_USADA"]);
    expect(marcas).not.toContain(marca);
  });
});

describe("Moderación: no se puede comprar lo no aprobado", () => {
  it("priceOrderItems rechaza PENDING, DRAFT y REJECTED con 410", async () => {
    const u = await mkUser();
    owners.push(u.id);
    for (const status of ["PENDING", "DRAFT", "REJECTED"] as const) {
      const l = await mkListing(u.id, status);
      ids.push(l.id);
      await expect(priceOrderItems([{ productId: l.id, qty: 1 }])).rejects.toMatchObject({
        code: 410,
      });
    }
  });

  it("sí permite comprar un APPROVED", async () => {
    const u = await mkUser();
    owners.push(u.id);
    const l = await mkListing(u.id, "APPROVED");
    ids.push(l.id);
    const { total } = await priceOrderItems([{ productId: l.id, qty: 1 }]);
    expect(total).toBe(l.priceRetail);
  });

  it("un anuncio vendido (soldAt) ya no está en el catálogo", async () => {
    const u = await mkUser();
    owners.push(u.id);
    const vendido = await mkListing(u.id, "APPROVED", {
      active: false,
      soldAt: new Date(),
    });
    ids.push(vendido.id);
    const { items } = await getCatalog(["MOTO_USADA"], {});
    expect(items.map((p) => p.id)).not.toContain(vendido.id);
  });
});

describe("Cuotas del marketplace", () => {
  it("permite hasta MAX_CONCURRENT_DRAFTS borradores y luego corta", async () => {
    const u = await mkUser();
    owners.push(u.id);
    for (let i = 0; i < MAX_CONCURRENT_DRAFTS; i++) {
      const d = await mkListing(u.id, "DRAFT");
      ids.push(d.id);
    }
    const { getListingQuota } = await import("@/lib/listings");
    const q = await getListingQuota(u.id);
    expect(q.drafts).toBe(MAX_CONCURRENT_DRAFTS);
    expect(q.draftSlots).toBe(0);
  });

  it("el tope diario de publicaciones es 10", () => {
    expect(MAX_LISTINGS_PER_DAY).toBe(10);
  });

  it("cuenta lo publicado hoy y descuenta del remanente", async () => {
    const u = await mkUser();
    owners.push(u.id);
    const hoy = await mkListing(u.id, "PENDING");
    ids.push(hoy.id);
    const { getListingQuota } = await import("@/lib/listings");
    const q = await getListingQuota(u.id);
    expect(q.publishedToday).toBe(1);
    expect(q.remainingToday).toBe(MAX_LISTINGS_PER_DAY - 1);
  });
});