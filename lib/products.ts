import { prisma } from "@/lib/prisma";
import type { Product, ProductType } from "@prisma/client";

export type Specs = Record<string, string | number>;

export function getSpecs(p: Pick<Product, "specs">): Specs {
  if (p.specs && typeof p.specs === "object" && !Array.isArray(p.specs)) {
    return p.specs as Specs;
  }
  return {};
}

export const CATEGORY_TO_TYPES: Record<string, ProductType[]> = {
  "motos-electricas": ["MOTO_NUEVA"],
  "motos-usadas": ["MOTO_USADA"],
  "repuestos-accesorios": ["REPUESTO", "ACCESORIO"],
};

export function isCatalogCategory(v: string): v is keyof typeof CATEGORY_TO_TYPES {
  return v in CATEGORY_TO_TYPES;
}

export async function getFeaturedProducts(limit = 6): Promise<Product[]> {
  return prisma.product.findMany({
    where: { active: true, featured: true },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: limit,
  });
}

export async function getProductsByType(type: ProductType, limit = 8): Promise<Product[]> {
  return prisma.product.findMany({
    where: { active: true, type },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: limit,
  });
}

export async function getBrandsByType(types: ProductType[]): Promise<string[]> {
  const rows = await prisma.product.findMany({
    where: { active: true, type: { in: types } },
    select: { brand: true },
    distinct: ["brand"],
    orderBy: { brand: "asc" },
  });
  return rows.map((r) => r.brand);
}

export type CatalogOrder = "relevancia" | "precio-asc" | "precio-desc" | "recientes";

export interface CatalogFilters {
  q?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  year?: number;
  maxKm?: number;
  order?: CatalogOrder;
  page?: number;
}

export const PAGE_SIZE = 12;

function sortItems(items: Product[], order: CatalogOrder): Product[] {
  const arr = [...items];
  switch (order) {
    case "precio-asc":
      return arr.sort((a, b) => a.priceRetail - b.priceRetail);
    case "precio-desc":
      return arr.sort((a, b) => b.priceRetail - a.priceRetail);
    case "recientes":
      return arr.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    case "relevancia":
    default:
      return arr.sort(
        (a, b) =>
          Number(b.featured) - Number(a.featured) || b.createdAt.getTime() - a.createdAt.getTime(),
      );
  }
}

export async function getCatalog(
  types: ProductType[],
  f: CatalogFilters,
): Promise<{ items: Product[]; total: number; pages: number; page: number }> {
  const q = f.q?.trim() || undefined;
  const all = await prisma.product.findMany({
    where: {
      active: true,
      type: { in: types },
      ...(f.brand ? { brand: f.brand } : {}),
      ...(f.minPrice != null || f.maxPrice != null
        ? {
            priceRetail: {
              ...(f.minPrice != null ? { gte: f.minPrice } : {}),
              ...(f.maxPrice != null ? { lte: f.maxPrice } : {}),
            },
          }
        : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { brand: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
  });

  // Filtros sobre specs (catálogo pequeño: en memoria)
  const filtered = all.filter((p) => {
    const s = getSpecs(p);
    if (f.year != null && Number(s.anio) !== f.year) return false;
    if (f.maxKm != null && Number(s.kilometraje_km) > f.maxKm) return false;
    return true;
  });

  const sorted = sortItems(filtered, f.order ?? "relevancia");
  const page = Math.max(1, f.page ?? 1);
  const pages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, pages);
  const items = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  return { items, total: sorted.length, pages, page: safePage };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return prisma.product.findFirst({ where: { slug, active: true } });
}

export async function getRelatedProducts(
  type: ProductType,
  excludeId: string,
  take = 4,
): Promise<Product[]> {
  return prisma.product.findMany({
    where: { active: true, type, id: { not: excludeId } },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take,
  });
}
