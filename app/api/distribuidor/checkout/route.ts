import { NextResponse } from "next/server";
import { CreateOrderInput } from "@/lib/order-validation";
import { createWholesaleOrder } from "@/lib/distributor-orders";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  const parsed = CreateOrderInput.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }
  try {
    const order = await createWholesaleOrder(parsed.data);
    console.info(`Pedido mayorista: ${order.id} total=${order.total}`);
    return NextResponse.json({ orderId: order.id }, { status: 201 });
  } catch (e) {
    const code = (e as Error & { code?: number }).code;
    if (code === 403 || code === 409 || code === 422) {
      return NextResponse.json({ error: (e as Error).message }, { status: code });
    }
    console.error("Error en pedido mayorista", e);
    return NextResponse.json({ error: "No se pudo crear el pedido" }, { status: 500 });
  }
}
