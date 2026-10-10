import Link from "next/link";
import type { Product } from "@prisma/client";
import { getSpecs } from "@/lib/products";
import { topSpecs } from "@/lib/specs";
import { formatCOP } from "@/lib/money";
import { ProductImage } from "@/components/product/product-image";
import { AddWholesaleButton } from "./wholesale-button";

export function WholesaleCard({ product }: { product: Product }) {
  const specs = topSpecs(getSpecs(product));

  return (
    <article className="flex flex-col overflow-hidden rounded-[28px] border border-white/10 bg-surface">
      <ProductImage
        images={product.images}
        name={product.name}
        type={product.type}
        className="aspect-[4/3] w-full"
      />
      <div className="flex flex-1 flex-col gap-2 p-5">
        <p className="text-xs font-medium tracking-wide text-steel uppercase">
          Mayorista · {product.brand}
        </p>
        <h3 className="text-lg font-semibold text-text">{product.name}</h3>
        <dl className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-text-muted">
          {specs.map(([k, v]) => (
            <div key={k} className="flex gap-1">
              <dt className="text-text-faint">{k}:</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <div>
            <p className="text-xl font-semibold tabular-nums">
              {product.priceWholesale != null ? formatCOP(product.priceWholesale) : "—"}
            </p>
            <p className="text-xs text-text-faint tabular-nums">Retail: {formatCOP(product.priceRetail)}</p>
          </div>
          <div className="flex items-center gap-2">
            <AddWholesaleButton product={product} />
            <Link
              href={`/motos-electricas/${product.slug}`}
              className="rounded-full border border-white/10 px-4 py-2 text-sm text-text-muted hover:text-text"
            >
              Ver
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
