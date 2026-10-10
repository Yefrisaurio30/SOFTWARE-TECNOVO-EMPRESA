import { describe, expect, it, afterAll } from "vitest";
import { prisma } from "@/lib/prisma";
import { priceOrderItems } from "@/lib/orders";

/**
 * El servidor recalcula totales desde la BD y valida stock.
 * Usa datos reales del seed en la BD de desarrollo.
 */
describe("priceOrderItems", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("recalcula el total desde la BD (2 x pastillas delanteras)", async () => {
    const p = await prisma.product.findUniqueOrThrow({ where: { slug: "rep-pastillas-del" } });
    const { lines, total } = await priceOrderItems([{ productId: p.id, qty: 2 }]);
    expect(lines).toHaveLength(1);
    expect(lines[0].unitPrice).toBe(p.priceRetail);
    expect(total).toBe(p.priceRetail * 2);
  });

  it("suma varias líneas con precio vigente", async () => {
    const a = await prisma.product.findUniqueOrThrow({ where: { slug: "rep-espejo-izq" } });
    const b = await prisma.product.findUniqueOrThrow({ where: { slug: "acc-chaleco-reflectivo" } });
    const { total } = await priceOrderItems([
      { productId: a.id, qty: 1 },
      { productId: b.id, qty: 3 },
    ]);
    expect(total).toBe(a.priceRetail + b.priceRetail * 3);
  });

  it("rechaza cantidad mayor al stock (409)", async () => {
    const p = await prisma.product.findUniqueOrThrow({ where: { slug: "usada-city-s1-2023" } });
    await expect(priceOrderItems([{ productId: p.id, qty: 2 }])).rejects.toMatchObject({
      code: 409,
    });
  });

  it("rechaza producto inexistente o inactivo (410)", async () => {
    await expect(
      priceOrderItems([{ productId: "ck000000000000000000000000", qty: 1 }]),
    ).rejects.toMatchObject({ code: 410 });
  });

  it("bloquea la segunda reserva de una usada (409)", async () => {
    const p = await prisma.product.findUniqueOrThrow({ where: { slug: "usada-mini-p1-2023" } });
    // Limpia reservas de prueba previas sobre este producto.
    await prisma.order.deleteMany({
      where: { items: { some: { productId: p.id } }, contactPhone: "3000000000" },
    });
    const first = await priceOrderItems([{ productId: p.id, qty: 1 }]);
    expect(first.total).toBe(p.priceRetail);
    await prisma.order.create({
      data: {
        status: "PENDIENTE",
        total: first.total,
        contactName: "Prueba",
        contactPhone: "3000000000",
        city: "Bogotá",
        address: "Calle de prueba 123",
        delivery: "RECOGER",
        items: { create: [{ productId: p.id, qty: 1, unitPrice: p.priceRetail }] },
      },
    });
    await expect(priceOrderItems([{ productId: p.id, qty: 1 }])).rejects.toMatchObject({
      code: 409,
    });
    await prisma.order.deleteMany({
      where: { items: { some: { productId: p.id } }, contactPhone: "3000000000" },
    });
  });
});
