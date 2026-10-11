import { describe, expect, it, afterAll, vi } from "vitest";
import { prisma } from "@/lib/prisma";
import { canAccessOrder } from "@/lib/orders";

let mockSession: { user: { id: string; role: string } } | null = null;

vi.mock("@/lib/auth", () => ({
  auth: async () => mockSession,
}));

import { createWholesaleOrder } from "@/lib/distributor-orders";
import { isWholesaleRole } from "@/lib/distributor";

/**
 * Acceso a pedidos y al canal mayorista.
 * Usa la BD de desarrollo; limpia todo lo que crea.
 */
describe("canAccessOrder", () => {
  it("permite pedidos legacy sin userId aunque no haya sesión", () => {
    expect(canAccessOrder(null, null)).toBe(true);
  });

  it("niega pedido con dueño si no hay sesión", () => {
    expect(canAccessOrder("ck000000000000000000000001", null)).toBe(false);
  });

  it("permite al dueño y niega a otro usuario", () => {
    const owner = { user: { id: "ck000000000000000000000001", role: "CLIENTE" } };
    const other = { user: { id: "ck000000000000000000000002", role: "CLIENTE" } };
    expect(canAccessOrder("ck000000000000000000000001", owner)).toBe(true);
    expect(canAccessOrder("ck000000000000000000000001", other)).toBe(false);
  });

  it("permite al SUPERADMIN ver pedidos ajenos", () => {
    const admin = { user: { id: "ck000000000000000000000099", role: "SUPERADMIN" } };
    expect(canAccessOrder("ck000000000000000000000001", admin)).toBe(true);
  });
});

describe("isWholesaleRole", () => {
  it("acepta MAYORISTA y DISTRIBUIDOR, niega el resto", () => {
    expect(isWholesaleRole("MAYORISTA")).toBe(true);
    expect(isWholesaleRole("DISTRIBUIDOR")).toBe(true);
    expect(isWholesaleRole("CLIENTE")).toBe(false);
    expect(isWholesaleRole("SUPERADMIN")).toBe(false);
    expect(isWholesaleRole(null)).toBe(false);
    expect(isWholesaleRole(undefined)).toBe(false);
  });
});

describe("createWholesaleOrder", () => {
  const createdUserIds: string[] = [];
  const createdOrderIds: string[] = [];

  afterAll(async () => {
    if (createdOrderIds.length > 0) {
      await prisma.order.deleteMany({ where: { id: { in: createdOrderIds } } });
    }
    await prisma.distributorProfile.deleteMany({ where: { userId: { in: createdUserIds } } });
    if (createdUserIds.length > 0) {
      await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    }
    await prisma.$disconnect();
  });

  async function makeUser(role: "MAYORISTA" | "DISTRIBUIDOR" | "CLIENTE") {
    const u = await prisma.user.create({
      data: {
        name: `Prueba ${role}`,
        email: `prueba-${role.toLowerCase()}-${Date.now()}@tecnovo.test`,
        role,
      },
    });
    createdUserIds.push(u.id);
    return u;
  }

  function orderData(productId: string, qty: number) {
    return {
      items: [{ productId, qty }],
      contactName: "Prueba Mayorista",
      contactPhone: "3000000000",
      contactEmail: "",
      city: "Villavicencio",
      address: "Calle de prueba 123",
      delivery: "ENVIO" as const,
    };
  }

  it("niega sin sesión (403)", async () => {
    mockSession = null;
    const p = await prisma.product.findUniqueOrThrow({ where: { slug: "tec-one" } });
    await expect(createWholesaleOrder(orderData(p.id, 1))).rejects.toMatchObject({ code: 403 });
  });

  it("niega a CLIENTE (403)", async () => {
    const u = await makeUser("CLIENTE");
    mockSession = { user: { id: u.id, role: "CLIENTE" } };
    const p = await prisma.product.findUniqueOrThrow({ where: { slug: "tec-one" } });
    await expect(createWholesaleOrder(orderData(p.id, 1))).rejects.toMatchObject({ code: 403 });
  });

  it("permite a MAYORISTA directo sin perfil (mínimo 1 ud.)", async () => {
    const u = await makeUser("MAYORISTA");
    mockSession = { user: { id: u.id, role: "MAYORISTA" } };
    const p = await prisma.product.findUniqueOrThrow({ where: { slug: "tec-one" } });
    const order = await createWholesaleOrder(orderData(p.id, 1));
    createdOrderIds.push(order.id);
    expect(order.isWholesale).toBe(true);
    expect(order.userId).toBe(u.id);
    expect(order.total).toBe((p.priceWholesale ?? 0) * 1);
  });

  it("respeta el mínimo del perfil para DISTRIBUIDOR aprobado", async () => {
    const u = await makeUser("DISTRIBUIDOR");
    await prisma.distributorProfile.create({
      data: {
        userId: u.id,
        company: "Pruebas SAS",
        nit: `900${Date.now()}`,
        city: "Villavicencio",
        phone: "3000000000",
        status: "APROBADO",
        minUnits: 2,
      },
    });
    mockSession = { user: { id: u.id, role: "DISTRIBUIDOR" } };
    const p = await prisma.product.findUniqueOrThrow({ where: { slug: "tec-one" } });
    await expect(createWholesaleOrder(orderData(p.id, 1))).rejects.toMatchObject({ code: 422 });
    const order = await createWholesaleOrder(orderData(p.id, 2));
    createdOrderIds.push(order.id);
    expect(order.total).toBe((p.priceWholesale ?? 0) * 2);
  });

  it("niega a DISTRIBUIDOR pendiente (403)", async () => {
    const u = await makeUser("DISTRIBUIDOR");
    await prisma.distributorProfile.create({
      data: {
        userId: u.id,
        company: "Pendiente SAS",
        nit: `901${Date.now()}`,
        city: "Villavicencio",
        phone: "3000000000",
        status: "PENDIENTE",
        minUnits: 1,
      },
    });
    mockSession = { user: { id: u.id, role: "DISTRIBUIDOR" } };
    const p = await prisma.product.findUniqueOrThrow({ where: { slug: "tec-one" } });
    await expect(createWholesaleOrder(orderData(p.id, 1))).rejects.toMatchObject({ code: 403 });
  });
});
