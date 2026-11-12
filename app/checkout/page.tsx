"use client";

import Link from "next/link";
import { cartSubtotal, useCartStore } from "@/store/cart-store";
import { formatCOP } from "@/lib/money";
import { Container, SectionHeading } from "@/components/ui/section";
import { CartPurchaseButton } from "@/components/cart/cart-whatsapp-button";

/**
 * Checkout — flujo directo por WhatsApp.
 * La pasarela Wompi está desactivada; la lógica anterior queda
 * modularizada en components/checkout/legacy-checkout.tsx para su
 * reactivación futura.
 */
export default function CheckoutPage() {
  const lines = useCartStore((s) => s.lines);

  if (lines.length === 0) {
    return (
      <main className="bg-white py-10 text-text md:py-14">
        <Container>
          <SectionHeading eyebrow="Compra" title="Checkout." />
          <div className="mt-8 rounded-[28px] border border-white/10 bg-surface p-10 text-center">
            <p className="text-lg font-semibold">No hay nada para comprar</p>
            <Link
              href="/motos-electricas"
              className="mt-5 inline-block rounded-full bg-white px-6 py-2.5 text-sm font-medium text-[#000]"
            >
              Volver al catálogo
            </Link>
          </div>
        </Container>
      </main>
    );
  }

  return (
    <main className="bg-white py-10 text-text md:py-14">
      <Container>
        <SectionHeading
          eyebrow="Compra"
          title="Checkout."
          description="Revisa tu resumen y coordinamos la compra directa por WhatsApp. El valor definitivo lo confirma el asesor."
        />
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="flex flex-col gap-4 rounded-[28px] border border-white/10 bg-surface p-6 md:p-8">
            <ul className="flex flex-col gap-3 text-[15px]">
              {lines.map((l) => (
                <li key={l.productId} className="flex justify-between gap-3">
                  <span className="truncate text-text-muted">
                    {l.qty} × {l.name}
                  </span>
                  <span className="shrink-0 tabular-nums">{formatCOP(l.price * l.qty)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-2 flex justify-between border-t border-white/10 pt-4">
              <span className="text-text-muted">Subtotal (informativo)</span>
              <span className="text-xl font-semibold tabular-nums">{formatCOP(cartSubtotal(lines))}</span>
            </div>
            <p className="text-xs text-text-faint">
              El total final lo confirma el asesor con precios y stock vigentes.
            </p>
          </div>
          <aside className="h-fit rounded-[24px] border border-white/10 bg-surface p-6 lg:sticky lg:top-24">
            <h2 className="text-lg font-semibold">Compra directa</h2>
            <p className="mt-1 text-sm text-text-muted">
              Te llevamos a WhatsApp con tu resumen prellenado para coordinar pago y entrega.
            </p>
            <CartPurchaseButton className="mt-5 w-full rounded-full bg-steel py-3 text-[15px] font-medium text-[#000] transition hover:scale-[1.01] disabled:opacity-60" />
            <Link
              href="/carrito"
              className="mt-3 block rounded-full border border-white/15 py-2.5 text-center text-sm"
            >
              Volver al carrito
            </Link>
            <p className="mt-4 text-center text-xs text-text-faint">
              Pago en línea (Wompi) temporalmente deshabilitado.
            </p>
          </aside>
        </div>
      </Container>
    </main>
  );
}
