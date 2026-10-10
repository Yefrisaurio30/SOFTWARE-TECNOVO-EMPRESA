import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import type { CreateOrderData } from "@/lib/order-validation";

/**
 * Totales mayoristas: solo MOTO_NUEVA con priceWholesale, solo distribuidor
 * APROBADO, mínimo de unidades del perfil. Nunca expone mayorista sin sesión.
 */
export async function createWholesaleOrder(data: CreateOrderData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "DISTRIBUIDOR") {
    const err = new Error("Solo distribuidores aprobados");
    (err as Error & { code?: number }).code = 403;
    throw err;
  }
  const profile = await prisma.distributorProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!profile || profile.status !== "APROBADO") {
    const err = new Error("Distribuidor no aprobado");
    (err as Error & { code?: number }).code = 403;
    throw err;
  }

  const ids = [...new Set(data.items.map((i) => i.productId))];
  const products = await prisma.product.findMany({ where: { id: { in: ids }, active: true } });
  const byId = new Map(products.map((p) => [p.id, p]));

  const lines: Array<{ productId: string; qty: number; unitPrice: number }> = [];
  for (const item of data.items) {
    const p = byId.get(item.productId);
    if (!p || p.type !== "MOTO_NUEVA" || p.priceWholesale == null) {
      const err = new Error(`No disponible al por mayor: ${item.productId}`);
      (err as Error & { code?: number }).code = 422;
      throw err;
    }
    if (p.stock < item.qty) {
      const err = new Error(`Sin stock suficiente: ${p.name}`);
      (err as Error & { code?: number }).code = 409;
      throw err;
    }
    lines.push({ productId: p.id, qty: item.qty, unitPrice: p.priceWholesale });
  }

  const totalUnits = lines.reduce((n, l) => n + l.qty, 0);
  if (totalUnits < profile.minUnits) {
    const err = new Error(`Pedido mínimo: ${profile.minUnits} unidades`);
    (err as Error & { code?: number }).code = 422;
    throw err;
  }
  const total = lines.reduce((n, l) => n + l.qty * l.unitPrice, 0);

  return prisma.$transaction(async (tx) => {
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
        isWholesale: true,
        userId: session.user.id,
        contactName: data.contactName,
        contactPhone: data.contactPhone,
        contactEmail: data.contactEmail || null,
        city: data.city,
        address: data.address,
        delivery: data.delivery,
        items: { create: lines },
      },
      include: { items: true },
    });
  });
}
