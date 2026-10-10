import { prisma } from "@/lib/prisma";
import type { CreateOrderData } from "@/lib/order-validation";

export interface PricedItem {
  productId: string;
  qty: number;
  unitPrice: number;
  name: string;
}

/**
 * Recalcula totales desde la BD. Nunca usa precios del cliente.
 * Lanza Error con `code` 409 si hay problema de stock o reserva.
 */
export async function priceOrderItems(
  items: CreateOrderData["items"],
): Promise<{ lines: PricedItem[]; total: number }> {
  const ids = [...new Set(items.map((i) => i.productId))];
  const products = await prisma.product.findMany({ where: { id: { in: ids }, active: true } });
  const byId = new Map(products.map((p) => [p.id, p]));

  const lines: PricedItem[] = [];
  for (const item of items) {
    const p = byId.get(item.productId);
    if (!p) {
      const err = new Error(`Producto no disponible: ${item.productId}`);
      (err as Error & { code?: number }).code = 410;
      throw err;
    }
    if (p.stock < item.qty) {
      const err = new Error(`Sin stock suficiente: ${p.name}`);
      (err as Error & { code?: number }).code = 409;
      throw err;
    }
    // Unidad única (segunda mano): se bloquea al reservarse.
    if (p.type === "MOTO_USADA") {
      const held = await prisma.orderItem.findFirst({
        where: {
          productId: p.id,
          order: { status: { in: ["PENDIENTE", "PAGADO", "ENVIADO"] } },
        },
        select: { id: true },
      });
      if (held) {
        const err = new Error(`Esta unidad ya fue reservada: ${p.name}`);
        (err as Error & { code?: number }).code = 409;
        throw err;
      }
    }
    lines.push({ productId: p.id, qty: item.qty, unitPrice: p.priceRetail, name: p.name });
  }

  const total = lines.reduce((n, l) => n + l.qty * l.unitPrice, 0);
  if (total <= 0) {
    const err = new Error("El pedido no tiene total válido");
    (err as Error & { code?: number }).code = 422;
    throw err;
  }
  return { lines, total };
}

export async function createOrder(data: CreateOrderData) {
  const { lines, total } = await priceOrderItems(data.items);

  return prisma.$transaction(async (tx) => {
    // Revalidar stock dentro de la transacción.
    for (const l of lines) {
      const p = await tx.product.findUniqueOrThrow({ where: { id: l.productId } });
      if (!p.active || p.stock < l.qty) {
        const err = new Error(`Sin stock suficiente: ${p.name}`);
        (err as Error & { code?: number }).code = 409;
        throw err;
      }
    }
    return tx.order.create({
      data: {
        status: "PENDIENTE",
        total,
        contactName: data.contactName,
        contactPhone: data.contactPhone,
        contactEmail: data.contactEmail || null,
        city: data.city,
        address: data.address,
        delivery: data.delivery,
        items: {
          create: lines.map((l) => ({ productId: l.productId, qty: l.qty, unitPrice: l.unitPrice })),
        },
      },
      include: { items: true },
    });
  });
}
