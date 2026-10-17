import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createDraft } from "@/lib/listings";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Entra a tu cuenta" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const res = await createDraft(session.user.id, body);
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