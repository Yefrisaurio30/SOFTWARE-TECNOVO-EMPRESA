const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP?.replace(/\D/g, "") || "573001112233";

export function waLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function waProductLink(productName: string, productUrl: string): string {
  return waLink(`Hola TECNOVO, me interesa ${productName} (${productUrl}). ¿Me cotizan?`);
}

export function waTestRideLink(): string {
  return waLink("Hola TECNOVO, quiero agendar una prueba de manejo. ¿Me confirman disponibilidad?");
}

export function getWhatsAppNumber(): string {
  return WHATSAPP_NUMBER;
}
