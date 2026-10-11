import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { canAccessOrder } from "@/lib/orders";
import { buildCheckoutUrl, buildIntegritySignature } from "@/lib/wompi";

const Body = z.object({ orderId: z.string().cuid() });

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  const parsed = Body.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "orderId inválido" }, { status: 400 });

  const publicKey = process.env.WOMPI_PUBLIC_KEY;
  const integritySecret = process.env.WOMPI_INTEGRITY_SECRET;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!publicKey || !integritySecret || !siteUrl) {
    return NextResponse.json({ error: "Pasarela sin configurar" }, { status: 503 });
  }

  const order = await prisma.order.findUnique({ where: { id: parsed.data.orderId } });
  if (!order) return NextResponse.json({ error: "Pedido no existe" }, { status: 404 });
  const session = await auth();
  if (!canAccessOrder(order.userId, session)) {
    return NextResponse.json({ error: "Inicia sesión para pagar este pedido" }, { status: 401 });
  }
  if (order.status !== "PENDIENTE") {
    return NextResponse.json({ error: "Pedido no pagable" }, { status: 409 });
  }

  // Total recalculado en servidor. Nunca monto del cliente.
  const amountInCents = Math.round(order.total * 100);
  const reference = `TNV-${order.id}-${Date.now()}`;
  await prisma.order.update({ where: { id: order.id }, data: { paymentRef: reference } });

  const signature = buildIntegritySignature({
    reference,
    amountInCents,
    currency: "COP",
    integritySecret,
  });
  const url = buildCheckoutUrl({
    publicKey,
    reference,
    amountInCents,
    signature,
    redirectUrl: `${siteUrl}/pedido/${order.id}`,
  });
  return NextResponse.json({ url });
}
