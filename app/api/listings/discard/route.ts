import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Descarta un borrador. Lo usa el sendBeacon al salir de la página de fotos.
 * Solo borra borradores del propio usuario.
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return new NextResponse(null, { status: 204 });

  let id = "";
  try {
    const text = await req.text();
    id = (JSON.parse(text) as { id?: string }).id ?? "";
  } catch {
    id = new URL(req.url).searchParams.get("id") ?? "";
  }
  if (!id) return new NextResponse(null, { status: 204 });

  await prisma.product
    .deleteMany({ where: { id, ownerId: session.user.id, status: "DRAFT" } })
    .catch(() => undefined);

  return new NextResponse(null, { status: 204 });
}