"use client";

import type { ReactNode } from "react";
import { waDirectPurchaseLink, type DirectPurchaseProduct } from "@/lib/whatsapp";

/**
 * Flujo de compra directa por WhatsApp (pasarela Wompi desactivada).
 * La lógica de pago queda modularizada en components/payment/pay-button.tsx
 * para su reactivación futura.
 */
export function handleDirectPurchase(product: DirectPurchaseProduct): void {
  const url = waDirectPurchaseLink(product);
  window.open(url, "_blank", "noopener,noreferrer");
}

interface DirectPurchaseButtonProps {
  product: DirectPurchaseProduct;
  className?: string;
  children?: ReactNode;
}

export function DirectPurchaseButton({ product, className, children }: DirectPurchaseButtonProps) {
  return (
    <button
      type="button"
      onClick={() => handleDirectPurchase(product)}
      className={className}
    >
      {children ?? "Comprar por WhatsApp"}
    </button>
  );
}
