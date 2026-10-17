import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createDraft } from "@/lib/listings";
import {
  areConsentsGiven,
  getClientIp,
  normalizeConsentInput,
} from "@/lib/consent";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Entra a tu cuenta" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  // Consentimiento obligatorio, validado en el servidor.
  const flags = normalizeConsentInput({ terms: body.terms, privacy: body.privacy });
  if (!areConsentsGiven(flags)) {
    return NextResponse.json(
      { error: "Debes aceptar los Términos y Condiciones y la Política de Privacidad." },
      { status: 400 },
    );
  }

  const email = session.user.email ?? "";
  if (!email) {
    return NextResponse.json({ error: "Tu cuenta no tiene correo" }, { status: 400 });
  }

  const res = await createDraft(session.user.id, email, body, {
    ipAddress: getClientIp(req.headers),
    userAgent: req.headers.get("user-agent"),
  });
  if (!res.ok) {
    return NextResponse.json({ error: res.error }, { status: res.code === "quota" ? 429 : 400 });
  }
  return NextResponse.json({ id: res.id }, { status: 201 });
}

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Entra a tu cuenta" }, { status: 401 });
  const drafts = await prisma.product.findMany({
    where: { ownerId: session.user.id, status: "DRAFT" },
    select: { id: true },
  });
  return NextResponse.json({ drafts: drafts.map((d) => d.id) });
}