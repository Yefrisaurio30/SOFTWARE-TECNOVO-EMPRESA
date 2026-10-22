import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { detailHref } from "@/components/product/product-card";

/**
 * Sin esto Next prerenderiza el sitemap en el build y lo deja congelado: los
 * productos que el admin cree despues no aparecen hasta el siguiente
 * despliegue. Una hora de margen alcanza para que los buscadores lo repassen.
 */
export const revalidate = 3600;

const STATIC = [
  "",
  "/motos-electricas",
  "/motos-usadas",
  "/repuestos-accesorios",
  "/distribuidores",
  "/taller",
  "/capacitacion",
  "/calculadora",
  "/comparar",
  "/buscar",
  "/legales/terminos-y-condiciones",
  "/legales/politica-de-privacidad",
  "/legales/politica-de-cookies",
  "/legales/derecho-de-retracto-y-reembolsos",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const now = new Date();
  const products = await prisma.product.findMany({
    where: { active: true, status: "APPROVED" },
    select: { slug: true, type: true, updatedAt: true },
  });
  return [
    ...STATIC.map((p) => ({ url: `${siteUrl}${p || "/"}`, lastModified: now, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.7 })),
    ...products.map((p) => ({
      url: `${siteUrl}${detailHref({ slug: p.slug, type: p.type })}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
