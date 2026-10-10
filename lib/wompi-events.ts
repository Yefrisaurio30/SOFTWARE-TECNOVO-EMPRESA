import { prisma } from "@/lib/prisma";
import { verifyEventChecksum, type WompiEvent } from "@/lib/wompi";

export type EventResult =
  | { ok: true; applied: "pagado" | "rechazado" | "ignorado" }
  | { ok: false; reason: "checksum" | "config" };

interface TxData {
  id?: unknown;
  reference?: unknown;
  status?: unknown;
  amount_in_cents?: unknown;
}

/**
 * Procesa transaction.updated de forma idempotente.
 * - checksum inválido → ok:false (la ruta responde 400)
 * - pedido ya en estado final → ignorado (responde 200 sin efectos)
 * - monto distinto al del pedido → no aprueba, deja PENDIENTE y registra
 */
export async function processWompiEvent(
  event: WompiEvent,
  eventsSecret: string | undefined,
  headerChecksum?: string | null,
): Promise<EventResult> {
  if (!eventsSecret) {
    console.error("Wompi: falta WOMPI_EVENTS_SECRET");
    return { ok: false, reason: "config" };
  }
  const valid = verifyEventChecksum(event, eventsSecret, headerChecksum);
  if (!valid) {
    console.warn("Wompi: checksum inválido, evento descartado");
    return { ok: false, reason: "checksum" };
  }

  if (event.event !== "transaction.updated") return { ok: true, applied: "ignorado" };
  const tx = (event.data as { transaction?: TxData } | null)?.transaction;
  if (!tx || typeof tx.reference !== "string") return { ok: true, applied: "ignorado" };

  const order = await prisma.order.findFirst({
    where: { paymentRef: tx.reference },
    include: { items: true },
  });
  if (!order) {
    console.warn(`Wompi: sin pedido para reference ${tx.reference}`);
    return { ok: true, applied: "ignorado" };
  }
  if (order.status !== "PENDIENTE") return { ok: true, applied: "ignorado" };

  const expectedCents = Math.round(order.total * 100);
  if (tx.amount_in_cents !== expectedCents) {
    console.error(
      `Wompi: monto no coincide ref=${tx.reference} evento=${String(tx.amount_in_cents)} pedido=${expectedCents}`,
    );
    return { ok: true, applied: "ignorado" };
  }

  if (tx.status === "APPROVED") {
    await prisma.$transaction(async (db) => {
      await db.order.update({ where: { id: order.id }, data: { status: "PAGADO" } });
      for (const item of order.items) {
        await db.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.qty } },
        });
      }
    });
    // Piso de seguridad: el stock nunca queda negativo.
    await prisma.$executeRaw`UPDATE "Product" SET stock = 0 WHERE stock < 0`;
    return { ok: true, applied: "pagado" };
  }

  if (tx.status === "DECLINED" || tx.status === "ERROR" || tx.status === "VOIDED") {
    await prisma.order.update({ where: { id: order.id }, data: { status: "RECHAZADO" } });
    return { ok: true, applied: "rechazado" };
  }

  return { ok: true, applied: "ignorado" };
}
