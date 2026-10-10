import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ProductType } from "@prisma/client";

export interface CartSnapshot {
  productId: string;
  slug: string;
  name: string;
  brand: string;
  /** Precio informativo al agregar. El servidor SIEMPRE recalcula. */
  price: number;
  image: string | null;
  type: ProductType;
}

export interface CartLine extends CartSnapshot {
  qty: number;
}

interface CartState {
  lines: CartLine[];
  add: (item: CartSnapshot, qty?: number) => void;
  remove: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      add: (item, qty = 1) =>
        set((s) => {
          const found = s.lines.find((l) => l.productId === item.productId);
          if (found) {
            return {
              lines: s.lines.map((l) =>
                l.productId === item.productId ? { ...l, ...item, qty: l.qty + qty } : l,
              ),
            };
          }
          return { lines: [...s.lines, { ...item, qty }] };
        }),
      remove: (productId) => set((s) => ({ lines: s.lines.filter((l) => l.productId !== productId) })),
      setQty: (productId, qty) =>
        set((s) =>
          qty <= 0
            ? { lines: s.lines.filter((l) => l.productId !== productId) }
            : { lines: s.lines.map((l) => (l.productId === productId ? { ...l, qty } : l)) },
        ),
      clear: () => set({ lines: [] }),
    }),
    { name: "cart-v1" },
  ),
);

export function cartCount(lines: CartLine[]): number {
  return lines.reduce((n, l) => n + l.qty, 0);
}

/** Subtotal informativo (solo display). El total real lo calcula el servidor. */
export function cartSubtotal(lines: CartLine[]): number {
  return lines.reduce((n, l) => n + l.qty * l.price, 0);
}
