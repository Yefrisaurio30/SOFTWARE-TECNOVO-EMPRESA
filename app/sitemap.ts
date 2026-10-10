import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { detailHref } from "@/components/product/product-card";

const STATIC = [
  "",
  "/motos-electricas",
  "/motos-usadas",
  "/repuestos-accesorios",
  "/distribuidores",
  "/comparar",
  "/calculadora",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const now = new Date();
  const products = await prisma.product.findMany({
    where: { active: true },
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
