"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { cartCount, useCartStore } from "@/store/cart-store";

export function CartButton() {
  const count = useCartStore((s) => cartCount(s.lines));

  return (
    <Link
      href="/carrito"
      aria-label={count > 0 ? `Ver carrito, ${count} artículos` : "Ver carrito"}
      className="relative grid size-9 shrink-0 place-items-center rounded-full border border-white/10 bg-white/5 text-text transition hover:border-white/20"
    >
      <ShoppingCart size={17} aria-hidden />
      {count > 0 ? (
        <span className="absolute -top-1 -right-1 grid min-size-5 place-items-center rounded-full bg-white px-1 text-[11px] font-semibold text-black tabular-nums" style={{ minWidth: 20, minHeight: 20 }}>
          {count}
        </span>
      ) : null}
    </Link>
  );
}
