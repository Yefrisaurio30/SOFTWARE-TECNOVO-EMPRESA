"use client";

import { useState } from "react";
import type { ProductType } from "@prisma/client";
import { ProductImage } from "@/components/product/product-image";
import { cn } from "@/lib/utils";

export function Gallery({
  images,
  name,
  type,
}: {
  images: string[];
  name: string;
  type: ProductType;
}) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <ProductImage
        images={[]}
        name={name}
        type={type}
        className="aspect-[4/3] w-full rounded-[24px] border border-white/10"
        sizes="(max-width: 768px) 100vw, 50vw"
      />
    );
  }

  return (
    <div>
      <div className="overflow-hidden rounded-[24px] border border-white/10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[active]}
          alt={`${name} — foto ${active + 1}`}
          className="aspect-[4/3] w-full object-cover"
        />
      </div>
      {images.length > 1 ? (
        <div className="mt-3 grid grid-cols-4 gap-3" role="tablist" aria-label="Fotos del producto">
          {images.map((src, i) => (
            <button
              key={src}
              role="tab"
              aria-selected={i === active}
              aria-label={`Ver foto ${i + 1}`}
              onClick={() => setActive(i)}
              className={cn(
                "overflow-hidden rounded-2xl border transition",
                i === active ? "border-steel" : "border-white/10 opacity-70 hover:opacity-100",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="aspect-square w-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
