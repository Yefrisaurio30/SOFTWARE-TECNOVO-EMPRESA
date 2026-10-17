"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { audit, requireAdmin } from "@/lib/admin";
import { parseYoutubeId } from "@/lib/youtube";

const CourseSchema = z.object({
  title: z.string().trim().min(3).max(160),
  summary: z.string().trim().max(1000).default(""),
  youtubeUrl: z.string().trim().max(300).optional().or(z.literal("")),
  startsAt: z.string().trim().optional().or(z.literal("")),
  modality: z.string().trim().max(60).optional().or(z.literal("")),
  city: z.string().trim().max(80).optional().or(z.literal("")),
  price: z.coerce.number().int().min(0).optional(),
  active: z.coerce.boolean().default(true),
});

export async function saveCourse(input: unknown, id?: string) {
  const session = await requireAdmin();
  const parsed = CourseSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Datos inválidos" };
  const d = parsed.data;

  if (d.youtubeUrl && !parseYoutubeId(d.youtubeUrl)) {
    return { ok: false as const, error: "La URL de YouTube no es válida" };
  }
  if (d.price != null && Number.isNaN(d.price)) {
    return { ok: false as const, error: "Precio inválido" };
  }

  let startsAt: Date | null = null;
  if (d.startsAt) {
    const parsedDate = new Date(d.startsAt);
    if (Number.isNaN(parsedDate.getTime())) {
      return { ok: false as const, error: "Fecha inválida" };
    }
    startsAt = parsedDate;
  }

  const data = {
    title: d.title,
    summary: d.summary,
    youtubeUrl: d.youtubeUrl || null,
    startsAt,
    modality: d.modality || null,
    city: d.city || null,
    price: d.price ?? null,
    active: d.active,
  };

  if (id) {
    await prisma.course.update({ where: { id }, data });
    await audit("course.update", "Course", id, session.user.id);
  } else {
    const created = await prisma.course.create({ data });
    await audit("course.create", "Course", created.id, session.user.id);
  }
  revalidatePath("/admin/capacitacion");
  revalidatePath("/capacitacion");
  return { ok: true as const };
}

export async function deleteCourse(id: string) {
  const session = await requireAdmin();
  await prisma.course.delete({ where: { id } });
  await audit("course.delete", "Course", id, session.user.id);
  revalidatePath("/admin/capacitacion");
  revalidatePath("/capacitacion");
  return { ok: true as const };
}