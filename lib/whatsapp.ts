import { formatCOP } from "@/lib/money";

export function defaultNumber(): string {
  const fromEnv =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ??
    process.env.NEXT_PUBLIC_WHATSAPP ??
    "";
  return fromEnv.replace(/\D/g, "") || "573122779324";
}

export function waLink(message: string, number?: string): string {
  const to = (number ?? defaultNumber()).replace(/\D/g, "");
  return `https://wa.me/${to}?text=${encodeURIComponent(message)}`;
}

export function waProductLink(productName: string, number?: string): string {
  return waLink(`Hola TECNOVO, me interesa la ${productName}. ¿Me cotizan?`, number);
}

export function waTestRideLink(number?: string): string {
  return waLink("Hola TECNOVO, quiero agendar una prueba de manejo. ¿Me confirman disponibilidad?", number);
}

export function getWhatsAppNumber(): string {
  return defaultNumber();
}

/** Producto mínimo para el mensaje de compra directa. */
export interface DirectPurchaseProduct {
  name?: string;
  title?: string;
  price?: number | null;
}

/**
 * Mensaje de compra directa (flujo WhatsApp, sin pasarela).
 * El precio es informativo: el valor definitivo lo confirma el asesor.
 */
export function directPurchaseMessage(product: DirectPurchaseProduct | null | undefined): string {
  const name = product?.name || product?.title || "Producto Tecnovo";
  const price = typeof product?.price === "number" ? formatCOP(product.price) : "";
  return (
    `¡Hola! Estoy interesado en adquirir el siguiente vehículo/producto:\n\n` +
    `*Producto:* ${name}\n` +
    `*Precio:* ${price}\n\n` +
    `Quedo atento para coordinar la compra directa.`
  );
}

export function waDirectPurchaseLink(
  product: DirectPurchaseProduct | null | undefined,
  number?: string,
): string {
  return waLink(directPurchaseMessage(product), number);
}

/** Línea de carrito para el mensaje de compra directa. */
export interface CartPurchaseItem {
  name: string;
  qty: number;
  price: number;
}

export function cartPurchaseMessage(items: CartPurchaseItem[], subtotal?: number): string {
  const lines = items
    .map((it) => `- ${it.qty} × ${it.name} — ${formatCOP(it.price * it.qty)}`)
    .join("\n");
  const total = typeof subtotal === "number" ? `\n*Total (informativo):* ${formatCOP(subtotal)}` : "";
  return (
    `¡Hola! Quiero comprar estos productos:\n\n` +
    `${lines}${total}\n\n` +
    `Quedo atento para coordinar la compra directa.`
  );
}

export function waCartPurchaseLink(
  items: CartPurchaseItem[],
  subtotal?: number,
  number?: string,
): string {
  return waLink(cartPurchaseMessage(items, subtotal), number);
}
