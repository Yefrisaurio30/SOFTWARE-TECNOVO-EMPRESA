import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const Body = z.object({
  name: z.string().trim().min(3).max(120),
  email: z.string().trim().toLowerCase().email().max(160),
  password: z.string().min(8).max(100),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  const parsed = Body.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }
  const exists = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (exists) return NextResponse.json({ error: "Ese correo ya está registrado" }, { status: 409 });

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const user = await prisma.user.create({
    data: { name: parsed.data.name, email: parsed.data.email, passwordHash, role: "CLIENTE" },
  });
  return NextResponse.json({ id: user.id }, { status: 201 });
}
