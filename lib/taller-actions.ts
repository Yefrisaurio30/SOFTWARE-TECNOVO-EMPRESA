"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { audit, requireAdmin } from "@/lib/admin";

const ServiceSchema = z.object({
  name: z.string().trim().min(2).max(120),
  city: z.string().trim().min(2).max(80),
  address: z.string().trim().max(200).default(""),
  phone: z.string().trim().max(30).default(""),
  mapsUrl: z
    .string()
    .trim()
    .max(500)
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || /^https?:\/\//.test(v), "La URL debe empezar con http"),
  servicesRaw: z.string().default(""),
  warranty: z.coerce.boolean().default(true),
  isHeadquarter: z.coerce.boolean().default(false),
  active: z.coerce.boolean().default(true),
});

function parseList(raw: string): string[] {
  return raw
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 12);
}

export async function saveService(input: unknown, id?: string) {
  const session = await requireAdmin();
  const parsed = ServiceSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Datos inválidos" };
  const d = parsed.data;
  const data = {
    name: d.name,
    city: d.city,
    address: d.address,
    phone: d.phone,
    mapsUrl: d.mapsUrl || null,
    services: parseList(d.servicesRaw),
    warranty: d.warranty,
    isHeadquarter: d.isHeadquarter,
    active: d.active,
  };
  if (id) {
    await prisma.service.update({ where: { id }, data });
    await audit("service.update", "Service", id, session.user.id);
  } else {
    await prisma.service.create({ data });
    await audit("service.create", "Service", undefined, session.user.id);
  }
  revalidatePath("/admin/taller");
  revalidatePath("/taller");
  return { ok: true as const };
}

export async function deleteService(id: string) {
  const session = await requireAdmin();
  await prisma.service.delete({ where: { id } });
  await audit("service.delete", "Service", id, session.user.id);
  revalidatePath("/admin/taller");
  revalidatePath("/taller");
  return { ok: true as const };
}