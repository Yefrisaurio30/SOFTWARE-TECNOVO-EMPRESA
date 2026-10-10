# Código de referencia (Next.js 15, TypeScript). Adáptalo al proyecto.

## src/lib/wompi.ts
```ts
import { createHash, timingSafeEqual } from "node:crypto";

const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

export function buildIntegritySignature(p: {
  reference: string; amountInCents: number; currency: "COP"; integritySecret: string;
}) {
  // Orden obligatorio: reference + amountInCents + currency + secret
  return sha256(`${p.reference}${p.amountInCents}${p.currency}${p.integritySecret}`);
}

export function buildCheckoutUrl(p: {
  publicKey: string; reference: string; amountInCents: number; signature: string; redirectUrl: string;
}) {
  const q = new URLSearchParams({
    "public-key": p.publicKey,
    currency: "COP",
    "amount-in-cents": String(p.amountInCents),
    reference: p.reference,
    "signature:integrity": p.signature,
    "redirect-url": p.redirectUrl,
  });
  return `https://checkout.wompi.co/p/?${q.toString()}`;
}

const getPath = (obj: any, path: string) =>
  path.split(".").reduce((acc, k) => (acc == null ? undefined : acc[k]), obj);

export function verifyEventChecksum(event: any, eventsSecret: string, headerChecksum?: string | null) {
  const sig = event?.signature;
  if (!sig?.properties || sig.timestamp == null || !sig.checksum) return false;
  const concatenated =
    sig.properties.map((path: string) => String(getPath(event.data, path) ?? "")).join("") +
    String(sig.timestamp) +
    eventsSecret;
  const expected = sha256(concatenated);
  const received = String(headerChecksum ?? sig.checksum).toLowerCase();
  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(received, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}
```

## src/app/api/checkout/wompi/route.ts
```ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { buildIntegritySignature, buildCheckoutUrl } from "@/lib/wompi";

const Body = z.object({ orderId: z.string().cuid() });

export async function POST(req: Request) {
  const { orderId } = Body.parse(await req.json());
  const order = await prisma.order.findUniqueOrThrow({ where: { id: orderId } });
  if (order.status !== "PENDIENTE") return NextResponse.json({ error: "Pedido no pagable" }, { status: 409 });

  const amountInCents = Math.round(order.total * 100); // total en COP, recalculado en servidor
  const reference = `TNV-${order.id}-${Date.now()}`;
  await prisma.order.update({ where: { id: order.id }, data: { paymentRef: reference } });

  const signature = buildIntegritySignature({
    reference, amountInCents, currency: "COP", integritySecret: process.env.WOMPI_INTEGRITY_SECRET!,
  });
  const url = buildCheckoutUrl({
    publicKey: process.env.WOMPI_PUBLIC_KEY!, reference, amountInCents, signature,
    redirectUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/pedido/${order.id}`,
  });
  return NextResponse.json({ url });
}
```

## src/app/api/wompi/events/route.ts
```ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyEventChecksum } from "@/lib/wompi";

export async function POST(req: Request) {
  const event = await req.json();
  const ok = verifyEventChecksum(event, process.env.WOMPI_EVENTS_SECRET!, req.headers.get("x-event-checksum"));
  if (!ok) return NextResponse.json({ error: "checksum" }, { status: 400 });

  if (event.event === "transaction.updated") {
    const tx = event.data.transaction;
    const order = await prisma.order.findFirst({ where: { paymentRef: tx.reference } });
    if (order && order.status === "PENDIENTE") {
      if (tx.amount_in_cents !== Math.round(order.total * 100)) {
        console.error("Monto no coincide", tx.reference); // no aprobar
      } else if (tx.status === "APPROVED") {
        await prisma.$transaction([
          prisma.order.update({ where: { id: order.id }, data: { status: "PAGADO" } }),
          // descontar stock aquí
        ]);
      } else if (["DECLINED", "ERROR", "VOIDED"].includes(tx.status)) {
        await prisma.order.update({ where: { id: order.id }, data: { status: "RECHAZADO" } });
      }
    }
  }
  return NextResponse.json({ received: true });
}
```

## Test con el ejemplo oficial de la doc (Vitest)
Referencia sk8-438k4-xmxm392-sn2m, monto 2490000, COP y secreto prod_integrity_Z5mMke9x0k8gpErbDqwrJXMqsI6SFli6 deben producir 37c8407747e595535433ef8f6a811d853cd943046624a0ec04662b17bbf33bf5.
