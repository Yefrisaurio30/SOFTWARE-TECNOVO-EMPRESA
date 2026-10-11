import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { isWholesaleRole, minUnitsFor } from "@/lib/distributor";
import type { CreateOrderData } from "@/lib/order-validation";

/**
 * Totales mayoristas: solo MOTO_NUEVA con priceWholesale, solo rol MAYORISTA
 * (directo) o DISTRIBUIDOR con perfil APROBADO. Nunca expone mayorista sin sesión.
 */
export async function createWholesaleOrder(data: CreateOrderData) {
  const session = await auth();
  if (!session?.user || !isWholesaleRole(session.user.role)) {
    const err = new Error("Solo mayoristas aprobados");
    (err as Error & { code?: number }).code = 403;
    throw err;
  }
  const profile = await prisma.distributorProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (session.user.role !== "MAYORISTA" && (!profile || profile.status !== "APROBADO")) {
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
  const minUnits = minUnitsFor(profile);
  if (totalUnits < minUnits) {
    const err = new Error(`Pedido mínimo: ${minUnits} unidades`);
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
