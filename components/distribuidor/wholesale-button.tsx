"use client";

import { useState } from "react";
import { Check, Plus } from "lucide-react";
import type { Product } from "@prisma/client";
import { useCartStore } from "@/store/cart-store";

export function AddWholesaleButton({ product }: { product: Product }) {
  const add = useCartStore((s) => s.add);
  const [added, setAdded] = useState(false);

  if (product.priceWholesale == null) return null;

  const onAdd = () => {
    add(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        brand: product.brand,
        price: product.priceWholesale as number,
        image: product.images[0] ?? null,
        type: product.type,
        wholesale: true,
      },
      1,
    );
    window.dispatchEvent(new CustomEvent("app:cart-open"));
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <button
      onClick={onAdd}
      aria-label={`Agregar ${product.name} al pedido mayorista`}
      className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition hover:scale-[1.02]"
    >
      {added ? <Check size={15} aria-hidden /> : <Plus size={15} aria-hidden />}
      {added ? "Listo" : "Agregar"}
    </button>
  );
}
