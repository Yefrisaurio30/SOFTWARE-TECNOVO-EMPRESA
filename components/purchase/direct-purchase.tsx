"use client";

import type { ReactNode } from "react";
import { waDirectPurchaseLink, type DirectPurchaseProduct } from "@/lib/whatsapp";

/**
 * Flujo de compra directa por WhatsApp (pasarela Wompi desactivada).
 * La lógica de pago queda modularizada en components/payment/pay-button.tsx
 * para su reactivación futura.
 */
export function handleDirectPurchase(product: DirectPurchaseProduct, number?: string): void {
  const url = waDirectPurchaseLink(product, number);
  window.open(url, "_blank", "noopener,noreferrer");
}

interface DirectPurchaseButtonProps {
  product: DirectPurchaseProduct;
  /** Número configurado en el admin (site-settings). Opcional: cae al entorno. */
  number?: string;
  className?: string;
  children?: ReactNode;
}

export function DirectPurchaseButton({ product, number, className, children }: DirectPurchaseButtonProps) {
  return (
    <button
      type="button"
      onClick={() => handleDirectPurchase(product, number)}
      className={className}
    >
      {children ?? "COTIZAR"}
    </button>
  );
}
