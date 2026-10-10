"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, Trash2, X } from "lucide-react";
import { cartSubtotal, useCartStore } from "@/store/cart-store";
import { formatCOP } from "@/lib/money";

export function CartDrawer() {
  const [open, setOpen] = useState(false);
  const lines = useCartStore((s) => s.lines);
  const setQty = useCartStore((s) => s.setQty);
  const remove = useCartStore((s) => s.remove);

  const openDrawer = useCallback(() => setOpen(true), []);

  useEffect(() => {
    window.addEventListener("app:cart-open", openDrawer);
    return () => window.removeEventListener("app:cart-open", openDrawer);
  }, [openDrawer]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open ]);

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[60] bg-black/60"
            aria-hidden
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-0 right-0 z-[61] flex h-full w-full max-w-md flex-col bg-ink text-text"
            role="dialog"
            aria-modal="true"
            aria-label="Carrito de compras"
          >
            <div className="flex items-center justify-between border-b border-white/10 p-5">
              <h2 className="text-lg font-semibold">Carrito ({lines.length})</h2>
              <button
                onClick={() => setOpen(false)}
                aria-label="Cerrar carrito"
                className="grid size-9 place-items-center rounded-full border border-white/10 text-text-muted hover:text-text"
              >
                <X size={17} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              {lines.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <p className="text-lg font-medium">Tu carrito está vacío</p>
                  <p className="mt-1 text-sm text-text-muted">Explora el catálogo y agrega algo.</p>
                  <Link
                    href="/motos-electricas"
                    onClick={() => setOpen(false)}
                    className="mt-5 rounded-full bg-white px-6 py-2.5 text-sm font-medium text-black"
                  >
                    Ver catálogo
                  </Link>
                </div>
              ) : (
                <ul className="flex flex-col gap-4">
                  {lines.map((l) => (
                    <li
                      key={l.productId}
                      className="flex gap-3 rounded-3xl border border-white/10 bg-surface p-4"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[15px] font-medium">{l.name}</p>
                        <p className="text-xs text-text-faint">{l.brand}</p>
                        <p className="mt-1 text-sm font-semibold tabular-nums">
                          {formatCOP(l.price)}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            onClick={() => setQty(l.productId, l.qty - 1)}
                            aria-label={`Quitar uno de ${l.name}`}
                            className="grid size-7 place-items-center rounded-full border border-white/10 text-text-muted hover:text-text"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-6 text-center text-sm tabular-nums" aria-live="polite">
                            {l.qty}
                          </span>
                          <button
                            onClick={() => setQty(l.productId, l.qty + 1)}
                            aria-label={`Agregar uno de ${l.name}`}
                            className="grid size-7 place-items-center rounded-full border border-white/10 text-text-muted hover:text-text"
                          >
                            <Plus size={14} />
                          </button>
                          <button
                            onClick={() => remove(l.productId)}
                            aria-label={`Quitar ${l.name} del carrito`}
                            className="ml-auto grid size-7 place-items-center rounded-full text-text-faint hover:text-danger"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {lines.length > 0 ? (
              <div className="border-t border-white/10 p-5">
                <div className="flex justify-between text-[15px]">
                  <span className="text-text-muted">Subtotal (informativo)</span>
                  <span className="font-semibold tabular-nums">{formatCOP(cartSubtotal(lines))}</span>
                </div>
                <p className="mt-1 text-xs text-text-faint">El total final se calcula en el checkout.</p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <Link
                    href="/carrito"
                    onClick={() => setOpen(false)}
                    className="rounded-full border border-white/15 py-3 text-center text-sm font-medium"
                  >
                    Ver carrito
                  </Link>
                  <Link
                    href="/checkout"
                    onClick={() => setOpen(false)}
                    className="rounded-full bg-white py-3 text-center text-sm font-medium text-black"
                  >
                    Finalizar compra
                  </Link>
                </div>
              </div>
            ) : null}
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
