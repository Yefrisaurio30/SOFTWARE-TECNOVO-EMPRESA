"use client";

import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { cartSubtotal, useCartStore } from "@/store/cart-store";
import { formatCOP } from "@/lib/money";
import { Container, SectionHeading } from "@/components/ui/section";

export default function CarritoPage() {
  const lines = useCartStore((s) => s.lines);
  const setQty = useCartStore((s) => s.setQty);
  const remove = useCartStore((s) => s.remove);

  return (
    <main className="bg-black py-10 text-text md:py-14">
      <Container>
        <SectionHeading
          eyebrow="Compra"
          title="Tu carrito."
          description="Revisa cantidades antes de finalizar."
        />
        {lines.length === 0 ? (
          <div className="mt-8 flex flex-col items-center rounded-[28px] border border-white/10 bg-surface px-6 py-20 text-center">
            <p className="text-xl font-semibold">Vacío por ahora</p>
            <p className="mt-1 text-[15px] text-text-muted">Agrega motos, repuestos o accesorios.</p>
            <Link
              href="/motos-electricas"
              className="mt-6 rounded-full bg-white px-6 py-2.5 text-sm font-medium text-black"
            >
              Explorar catálogo
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
            <ul className="flex flex-col gap-4">
              {lines.map((l) => (
                <li
                  key={l.productId}
                  className="flex items-center gap-4 rounded-[24px] border border-white/10 bg-surface p-5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs tracking-wide text-text-faint uppercase">{l.brand}</p>
                    <p className="truncate text-lg font-semibold">{l.name}</p>
                    <p className="mt-1 text-sm text-text-muted tabular-nums">
                      {formatCOP(l.price)} c/u
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        onClick={() => setQty(l.productId, l.qty - 1)}
                        aria-label={`Quitar uno de ${l.name}`}
                        className="grid size-8 place-items-center rounded-full border border-white/10 text-text-muted hover:text-text"
                      >
                        <Minus size={15} />
                      </button>
                      <span className="w-8 text-center tabular-nums" aria-live="polite">
                        {l.qty}
                      </span>
                      <button
                        onClick={() => setQty(l.productId, l.qty + 1)}
                        aria-label={`Agregar uno de ${l.name}`}
                        className="grid size-8 place-items-center rounded-full border border-white/10 text-text-muted hover:text-text"
                      >
                        <Plus size={15} />
                      </button>
                      <button
                        onClick={() => remove(l.productId)}
                        aria-label={`Quitar ${l.name}`}
                        className="ml-2 inline-flex items-center gap-1 text-sm text-text-faint hover:text-danger"
                      >
                        <Trash2 size={15} /> Quitar
                      </button>
                    </div>
                  </div>
                  <p className="text-lg font-semibold tabular-nums">{formatCOP(l.price * l.qty)}</p>
                </li>
              ))}
            </ul>
            <aside className="h-fit rounded-[24px] border border-white/10 bg-surface p-6 lg:sticky lg:top-24">
              <h2 className="text-lg font-semibold">Resumen</h2>
              <div className="mt-3 flex justify-between text-[15px]">
                <span className="text-text-muted">Subtotal</span>
                <span className="font-semibold tabular-nums">{formatCOP(cartSubtotal(lines))}</span>
              </div>
              <p className="mt-1 text-xs text-text-faint">
                Informativo. El total final lo calcula el servidor con precios y stock vigentes.
              </p>
              <Link
                href="/checkout"
                className="mt-5 block rounded-full bg-white py-3 text-center text-[15px] font-medium text-black transition hover:scale-[1.01]"
              >
                Finalizar compra
              </Link>
              <Link
                href="/motos-electricas"
                className="mt-3 block text-center text-sm text-text-muted hover:text-text"
              >
                Seguir explorando
              </Link>
            </aside>
          </div>
        )}
      </Container>
    </main>
  );
}
