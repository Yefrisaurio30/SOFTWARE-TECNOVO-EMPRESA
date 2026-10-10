"use client";

import { useState } from "react";
import { Check, Plus } from "lucide-react";
import type { Product } from "@prisma/client";
import { useCartStore } from "@/store/cart-store";
import { detailHref } from "@/components/product/product-card";

export function AddToCartButton({ product }: { product: Product }) {
  const add = useCartStore((s) => s.add);
  const [added, setAdded] = useState(false);

  const onAdd = () => {
    add(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        brand: product.brand,
        price: product.priceRetail,
        image: product.images[0] ?? null,
        type: product.type,
      },
      1,
    );
    window.dispatchEvent(new CustomEvent("app:cart-open"));
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onAdd}
        aria-label={`Agregar ${product.name} al carrito`}
        className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition hover:scale-[1.02]"
      >
        {added ? <Check size={15} aria-hidden /> : <Plus size={15} aria-hidden />}
        {added ? "Listo" : "Agregar"}
      </button>
      <a
        href={detailHref(product)}
        className="rounded-full border border-white/10 px-4 py-2 text-sm text-text-muted transition hover:border-white/25 hover:text-text"
      >
        Ver
      </a>
    </div>
  );
}
