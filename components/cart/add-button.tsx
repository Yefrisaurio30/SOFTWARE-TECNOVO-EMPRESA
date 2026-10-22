"use client";

import { useState } from "react";
import { Check, Plus } from "lucide-react";
import type { Product } from "@prisma/client";
import { useCartStore } from "@/store/cart-store";


export function AddToCartButton({ product }: { product: Product }) {
  const add = useCartStore((s) => s.add);
  const [added, setAdded] = useState(false);

  const atLimit = product.stock <= 0;

  const onAdd = () => {
    if (atLimit) return;
    add(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        brand: product.brand,
        price: product.priceRetail,
        image: product.images[0] ?? null,
        type: product.type,
        stock: product.stock,
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
        disabled={atLimit}
        aria-label={`Agregar ${product.name} al carrito`}
        className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40"
      >
        {added ? <Check size={15} aria-hidden /> : <Plus size={15} aria-hidden />}
        {added ? "Listo" : atLimit ? "Agotado" : "Agregar"}
      </button>
    </div>
  );
}