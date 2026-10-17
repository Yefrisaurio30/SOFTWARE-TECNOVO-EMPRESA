import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  areConsentsGiven,
  buildConsentData,
  getClientIp,
  normalizeConsentInput,
} from "@/lib/consent";

const Body = z.object({
  name: z.string().trim().min(3).max(120),
  email: z.string().trim().toLowerCase().email().max(160),
  password: z.string().min(8).max(100),
  terms: z.boolean().optional(),
  privacy: z.boolean().optional(),
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

  // Validación REAL del consentimiento en el servidor. El `required` del HTML
  // no protege nada: cualquiera puede llamar la API sin marcar las casillas.
  const flags = normalizeConsentInput({ terms: parsed.data.terms, privacy: parsed.data.privacy });
  if (!areConsentsGiven(flags)) {
    return NextResponse.json(
      { error: "Debes aceptar los Términos y Condiciones y la Política de Privacidad." },
      { status: 400 },
    );
  }

  const exists = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (exists) return NextResponse.json({ error: "Ese correo ya está registrado" }, { status: 409 });

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const consent = buildConsentData({
    email: parsed.data.email,
    source: "REGISTRO",
    terms: true,
    privacy: true,
    ipAddress: getClientIp(req.headers),
    userAgent: req.headers.get("user-agent"),
  });

  // Usuario y evidencia de consentimiento en la misma transacción: o queda
  // la cuenta con su prueba, o no queda nada.
  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: { name: parsed.data.name, email: parsed.data.email, passwordHash, role: "CLIENTE" },
    });
    await tx.consent.create({ data: { ...consent, userId: created.id } });
    return created;
  });

  return NextResponse.json({ id: user.id }, { status: 201 });
}