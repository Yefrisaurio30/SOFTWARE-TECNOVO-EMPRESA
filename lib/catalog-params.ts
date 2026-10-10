import type { CatalogFilters, CatalogOrder } from "@/lib/products";
import { emptyFilterValues, type FilterValues } from "@/components/catalog/filters";

type Raw = Record<string, string | string[] | undefined>;

function first(v: string | string[] | undefined): string {
  return Array.isArray(v) ? (v[0] ?? "") : (v ?? "");
}

function toNumber(v: string): number | undefined {
  if (v.trim() === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

const ORDERS: CatalogOrder[] = ["relevancia", "precio-asc", "precio-desc", "recientes"];

export function parseFilters(raw: Raw): { filters: CatalogFilters; values: FilterValues } {
  const q = first(raw.q).slice(0, 60);
  const brand = first(raw.brand).slice(0, 40);
  const minPrice = toNumber(first(raw.minPrice));
  const maxPrice = toNumber(first(raw.maxPrice));
  const yearRaw = toNumber(first(raw.year));
  const year = yearRaw != null && yearRaw >= 1990 && yearRaw <= 2100 ? Math.trunc(yearRaw) : undefined;
  const maxKm = toNumber(first(raw.maxKm));
  const orderRaw = first(raw.order);
  const order: CatalogOrder = (ORDERS as string[]).includes(orderRaw)
    ? (orderRaw as CatalogOrder)
    : "relevancia";
  const pageRaw = toNumber(first(raw.page));
  const page = pageRaw != null ? Math.trunc(pageRaw) : 1;

  return {
    filters: { q: q || undefined, brand: brand || undefined, minPrice, maxPrice, year, maxKm, order, page },
    values: {
      ...emptyFilterValues(),
      q,
      brand,
      minPrice: first(raw.minPrice),
      maxPrice: first(raw.maxPrice),
      order: orderRaw || "",
      year: first(raw.year),
      maxKm: first(raw.maxKm),
    },
  };
}

/** Reconstruye la query preservando filtros y cambiando la página. */
export function pageHref(raw: Raw, page: number): string {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(raw)) {
    if (k === "page") continue;
    const s = first(v);
    if (s !== "") params.set(k, s);
  }
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `?${qs}` : "?";
}
