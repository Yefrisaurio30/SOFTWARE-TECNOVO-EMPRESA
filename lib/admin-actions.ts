"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { audit, requireAdmin } from "@/lib/admin";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

const ProductSchema = z.object({
  name: z.string().trim().min(3).max(160),
  slug: z.string().trim().max(120).optional().or(z.literal("")),
  type: z.enum(["MOTO_NUEVA", "MOTO_USADA", "REPUESTO", "ACCESORIO"]),
  brand: z.string().trim().min(1).max(60),
  priceRetail: z.coerce.number().int().min(0),
  priceWholesale: z.coerce.number().int().min(0).optional(),
  stock: z.coerce.number().int().min(0),
  description: z.string().trim().max(2000).default(""),
  imagesRaw: z.string().default(""),
  specsRaw: z.string().default("{}"),
  featured: z.coerce.boolean().default(false),
  active: z.coerce.boolean().default(true),
});

export async function saveProduct(input: unknown, id?: string) {
  const session = await requireAdmin();
  const parsed = ProductSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Datos inválidos" };
  const d = parsed.data;

  let specs: Record<string, string | number> = {};
  try {
    const v = JSON.parse(d.specsRaw || "{}") as unknown;
    if (v && typeof v === "object" && !Array.isArray(v)) specs = v as typeof specs;
  } catch {
    return { ok: false as const, error: "Specs no es JSON válido" };
  }
  const images = d.imagesRaw.split("\n").map((s) => s.trim()).filter(Boolean).slice(0, 8);

  let slug = d.slug?.trim() || slugify(d.name);
  if (!slug) slug = `producto-${Date.now()}`;
  const clash = await prisma.product.findFirst({ where: { slug, ...(id ? { id: { not: id } } : {}) } });
  if (clash) slug = `${slug}-${Date.now().toString(36)}`;

  const data = {
    name: d.name, slug, type: d.type, brand: d.brand, priceRetail: d.priceRetail,
    priceWholesale: d.priceWholesale ?? null, stock: d.stock, description: d.description,
    images, specs, featured: d.featured, active: d.active,
  };
  if (id) {
    await prisma.product.update({ where: { id }, data });
    await audit("product.update", "Product", id, session.user.id);
  } else {
    const created = await prisma.product.create({ data });
    await audit("product.create", "Product", created.id, session.user.id);
  }
  revalidatePath("/admin/productos");
  revalidatePath("/");
  return { ok: true as const };
}

export async function deleteProduct(id: string) {
  const session = await requireAdmin();
  const used = await prisma.orderItem.findFirst({ where: { productId: id }, select: { id: true } });
  if (used) return { ok: false as const, error: "Tiene pedidos asociados: mejor desactívalo" };
  await prisma.product.delete({ where: { id } });
  await audit("product.delete", "Product", id, session.user.id);
  revalidatePath("/admin/productos");
  return { ok: true as const };
}

const StatusSchema = z.enum(["PENDIENTE", "PAGADO", "RECHAZADO", "ENVIADO", "ENTREGADO", "CANCELADO"]);

export async function setOrderStatus(orderId: string, status: string) {
  const session = await requireAdmin();
  const parsed = StatusSchema.safeParse(status);
  if (!parsed.success) return { ok: false as const, error: "Estado inválido" };
  await prisma.order.update({ where: { id: orderId }, data: { status: parsed.data } });
  await audit("order.status", "Order", orderId, session.user.id);
  revalidatePath("/admin/pedidos");
  return { ok: true as const };
}

const RoleSchema = z.enum(["SUPERADMIN", "MAYORISTA", "DISTRIBUIDOR", "CLIENTE"]);

export async function setUserRole(userId: string, role: string) {
  const session = await requireAdmin();
  const parsed = RoleSchema.safeParse(role);
  if (!parsed.success) return { ok: false as const, error: "Rol inválido" };
  if (userId === session.user.id) return { ok: false as const, error: "No cambies tu propio rol" };
  await prisma.user.update({ where: { id: userId }, data: { role: parsed.data } });
  await audit("user.role", "User", userId, session.user.id);
  revalidatePath("/admin/usuarios");
  return { ok: true as const };
}

export async function reviewDistributor(profileId: string, decision: "APROBADO" | "RECHAZADO") {
  const session = await requireAdmin();
  const profile = await prisma.distributorProfile.findUniqueOrThrow({ where: { id: profileId } });
  await prisma.$transaction([
    prisma.distributorProfile.update({ where: { id: profileId }, data: { status: decision } }),
    ...(decision === "APROBADO"
      ? [prisma.user.update({ where: { id: profile.userId }, data: { role: "MAYORISTA" } })]
      : []),
  ]);
  await audit("distributor.review", "DistributorProfile", profileId, session.user.id);
  revalidatePath("/admin/usuarios");
  return { ok: true as const };
}

export async function saveWhatsAppNumber(input: unknown) {
  const session = await requireAdmin();
  const parsed = z.object({ number: z.string().trim().min(7).max(20) }).safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Número inválido" };
  const number = parsed.data.number.replace(/\D/g, "");
  await prisma.siteSetting.upsert({
    where: { key: "WHATSAPP_NUMBER" },
    update: { value: number },
    create: { key: "WHATSAPP_NUMBER", value: number },
  });
  await audit("settings.whatsapp", "SiteSetting", "WHATSAPP_NUMBER", session.user.id);
  revalidatePath("/");
  return { ok: true as const };
}
