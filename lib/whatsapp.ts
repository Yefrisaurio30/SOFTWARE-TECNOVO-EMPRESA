export function defaultNumber(): string {
  return (
    process.env.NEXT_PUBLIC_WHATSAPP?.replace(/\D/g, "") || "573122779324"
  );
}

export function waLink(message: string, number?: string): string {
  const to = (number ?? defaultNumber()).replace(/\D/g, "");
  return `https://wa.me/${to}?text=${encodeURIComponent(message)}`;
}

export function waProductLink(productName: string, productUrl: string, number?: string): string {
  return waLink(`Hola TECNOVO, me interesa ${productName} (${productUrl}). ¿Me cotizan?`, number);
}

export function waTestRideLink(number?: string): string {
  return waLink("Hola TECNOVO, quiero agendar una prueba de manejo. ¿Me confirman disponibilidad?", number);
}

export function getWhatsAppNumber(): string {
  return defaultNumber();
}
