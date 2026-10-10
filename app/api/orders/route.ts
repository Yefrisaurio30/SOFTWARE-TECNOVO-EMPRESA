import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { CreateOrderInput } from "@/lib/order-validation";
import { createOrder } from "@/lib/orders";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  const parsed = CreateOrderInput.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }
  try {
    const session = await auth();
    const order = await createOrder(parsed.data, session?.user?.id);
    // TODO(F10): correo de confirmación (falta proveedor de email).
    console.info(`Pedido creado: ${order.id} total=${order.total}`);
    return NextResponse.json({ orderId: order.id }, { status: 201 });
  } catch (e) {
    const code = (e as Error & { code?: number }).code;
    if (code === 409 || code === 410 || code === 422) {
      return NextResponse.json({ error: (e as Error).message }, { status: code });
    }
    console.error("Error creando pedido", e);
    return NextResponse.json({ error: "No se pudo crear el pedido" }, { status: 500 });
  }
}
