import { createHash } from "node:crypto";
import { describe, expect, it, afterAll } from "vitest";
import { buildIntegritySignature, verifyEventChecksum, type WompiEvent } from "@/lib/wompi";
import { processWompiEvent } from "@/lib/wompi-events";
import { prisma } from "@/lib/prisma";

const sha256 = (s: string) => createHash("sha256").update(s, "utf8").digest("hex");
const TEST_SECRET = "test_events_secret_abc123";

function signEvent(tx: Record<string, unknown>, timestamp: number): WompiEvent {
  const properties = ["transaction.id", "transaction.status", "transaction.amount_in_cents"];
  const getPath = (obj: unknown, path: string): unknown =>
    path
      .split(".")
      .reduce<unknown>(
        (acc, k) => (acc == null ? undefined : (acc as Record<string, unknown>)[k]),
        obj,
      );
  const data = { transaction: tx };
  const concatenated =
    properties.map((p) => String(getPath(data, p) ?? "")).join("") +
    String(timestamp) +
    TEST_SECRET;
  return {
    event: "transaction.updated",
    data,
    signature: { properties, timestamp, checksum: sha256(concatenated) },
  };
}

describe("wompi firma de integridad (ejemplo oficial)", () => {
  it("produce el hash documentado", () => {
    expect(
      buildIntegritySignature({
        reference: "sk8-438k4-xmxm392-sn2m",
        amountInCents: 2490000,
        currency: "COP",
        integritySecret: "prod_integrity_Z5mMke9x0k8gpErbDqwrJXMqsI6SFli6",
      }),
    ).toBe("37c8407747e595535433ef8f6a811d853cd943046624a0ec04662b17bbf33bf5");
  });
});

describe("wompi checksum de eventos", () => {
  it("acepta evento válido (body y header)", () => {
    const event = signEvent({ id: "tx-1", status: "APPROVED", amount_in_cents: 100000 }, 123456);
    expect(verifyEventChecksum(event, TEST_SECRET)).toBe(true);
    expect(verifyEventChecksum(event, TEST_SECRET, event.signature?.checksum)).toBe(true);
  });

  it("rechaza evento manipulado", () => {
    const event = signEvent({ id: "tx-1", status: "APPROVED", amount_in_cents: 100000 }, 123456);
    const tampered: WompiEvent = {
      ...event,
      data: { transaction: { id: "tx-1", status: "APPROVED", amount_in_cents: 999999 } },
    };
    expect(verifyEventChecksum(tampered, TEST_SECRET)).toBe(false);
  });

  it("rechaza secreto distinto y firma ausente", () => {
    const event = signEvent({ id: "tx-1", status: "APPROVED", amount_in_cents: 100000 }, 123456);
    expect(verifyEventChecksum(event, "otro-secreto")).toBe(false);
    expect(verifyEventChecksum({ event: "transaction.updated", data: {} }, TEST_SECRET)).toBe(false);
  });
});

describe("wompi webhook idempotente y montos", () => {
  const phone = "3000000001";

  afterAll(async () => {
    await prisma.order.deleteMany({ where: { contactPhone: phone } });
    await prisma.$disconnect();
  });

  async function makeOrder(): Promise<{ orderId: string; productId: string; stockBefore: number }> {
    const p = await prisma.product.findUniqueOrThrow({ where: { slug: "rep-guaya-acelerador" } });
    await prisma.order.deleteMany({ where: { contactPhone: phone } });
    const order = await prisma.order.create({
      data: {
        status: "PENDIENTE",
        total: p.priceRetail,
        paymentRef: `TNV-wompi-test-${Date.now()}`,
        contactName: "Prueba Wompi",
        contactPhone: phone,
        city: "Bogotá",
        address: "Calle de prueba 123",
        delivery: "RECOGER",
        items: { create: [{ productId: p.id, qty: 1, unitPrice: p.priceRetail }] },
      },
    });
    return { orderId: order.id, productId: p.id, stockBefore: p.stock };
  }

  it("aprueba una vez y la repetición no duplica efectos", async () => {
    const { orderId, productId, stockBefore } = await makeOrder();
    const order = await prisma.order.findUniqueOrThrow({ where: { id: orderId } });
    const tx = {
      id: "tx-idem-1",
      status: "APPROVED",
      reference: order.paymentRef,
      amount_in_cents: Math.round(order.total * 100),
    };
    const first = await processWompiEvent(signEvent(tx, 999001), TEST_SECRET);
    expect(first).toEqual({ ok: true, applied: "pagado" });

    const second = await processWompiEvent(signEvent(tx, 999001), TEST_SECRET);
    expect(second).toEqual({ ok: true, applied: "ignorado" });

    const after = await prisma.order.findUniqueOrThrow({ where: { id: orderId } });
    const prod = await prisma.product.findUniqueOrThrow({ where: { id: productId } });
    expect(after.status).toBe("PAGADO");
    expect(prod.stock).toBe(stockBefore - 1);
  });

  it("no aprueba si el monto no coincide", async () => {
    const { orderId } = await makeOrder();
    const order = await prisma.order.findUniqueOrThrow({ where: { id: orderId } });
    const tx = {
      id: "tx-monto-1",
      status: "APPROVED",
      reference: order.paymentRef,
      amount_in_cents: Math.round(order.total * 100) + 100,
    };
    const res = await processWompiEvent(signEvent(tx, 999002), TEST_SECRET);
    expect(res).toEqual({ ok: true, applied: "ignorado" });
    const after = await prisma.order.findUniqueOrThrow({ where: { id: orderId } });
    expect(after.status).toBe("PENDIENTE");
  });
});
