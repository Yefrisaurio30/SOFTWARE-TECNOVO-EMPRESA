import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const Body = z.object({
  company: z.string().trim().min(2).max(160),
  nit: z.string().trim().min(5).max(30),
  city: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(7).max(20),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Entra a tu cuenta primero" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  const parsed = Body.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

  const existing = await prisma.distributorProfile.findUnique({ where: { userId: session.user.id } });
  if (existing?.status === "APROBADO") {
    return NextResponse.json({ error: "Ya eres distribuidor aprobado" }, { status: 409 });
  }
  const nitTaken = await prisma.distributorProfile.findFirst({
    where: { nit: parsed.data.nit, userId: { not: session.user.id } },
  });
  if (nitTaken) return NextResponse.json({ error: "Ese NIT ya está registrado" }, { status: 409 });

  const profile = existing
    ? await prisma.distributorProfile.update({
        where: { userId: session.user.id },
        data: { ...parsed.data, status: "PENDIENTE" },
      })
    : await prisma.distributorProfile.create({
        data: { userId: session.user.id, ...parsed.data, status: "PENDIENTE" },
      });
  return NextResponse.json({ status: profile.status }, { status: 201 });
}
