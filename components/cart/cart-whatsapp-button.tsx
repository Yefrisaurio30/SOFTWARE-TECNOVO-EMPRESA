"use client";

import { MessageCircle } from "lucide-react";
import { cartSubtotal, useCartStore, type CartLine } from "@/store/cart-store";
import { waCartPurchaseLink } from "@/lib/whatsapp";

/**
 * Compra directa por WhatsApp con el contenido del carrito.
 * Sustituye al botón "Finalizar compra" que iba al checkout de Wompi.
 */
export function purchaseCart(lines: CartLine[]): void {
  const subtotal = cartSubtotal(lines);
  const url = waCartPurchaseLink(
    lines.map((l) => ({ name: l.name, qty: l.qty, price: l.price })),
    subtotal,
  );
  window.open(url, "_blank", "noopener,noreferrer");
}

export function CartPurchaseButton({ className }: { className?: string }) {
  const lines = useCartStore((s) => s.lines);
  const disabled = lines.length === 0;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => purchaseCart(lines)}
      className={className}
    >
      <MessageCircle size={16} aria-hidden className="mr-2 inline" />
      COTIZAR
    </button>
  );
}
