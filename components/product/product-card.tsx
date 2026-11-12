import Link from "next/link";
import { MessageCircle } from "lucide-react";
import type { Product } from "@prisma/client";
import { getSpecs } from "@/lib/products";
import { topSpecs } from "@/lib/specs";
import { waDirectPurchaseLink } from "@/lib/whatsapp";
import { getWhatsAppNumber } from "@/lib/site-settings";
import { AddToCartButton } from "@/components/cart/add-button";
import { ProductImage } from "./product-image";
import { Price } from "./price";

const TYPE_LABEL: Record<Product["type"], string> = {
  MOTO_NUEVA: "Nueva",
  MOTO_USADA: "Segunda mano",
  REPUESTO: "Repuesto",
  ACCESORIO: "Accesorio",
};

export function detailHref(p: Pick<Product, "slug" | "type">): string {
  const cat =
    p.type === "MOTO_NUEVA"
      ? "motos-electricas"
      : p.type === "MOTO_USADA"
        ? "motos-usadas"
        : "repuestos-accesorios";
  return `/${cat}/${p.slug}`;
}

export async function ProductCard({ product }: { product: Product }) {
  const specs = topSpecs(getSpecs(product));
  const wa = waDirectPurchaseLink({ name: product.name, price: product.priceRetail }, await getWhatsAppNumber());

  return (
    <article
      className="group lift flex flex-col overflow-hidden rounded-[28px] border border-white/10 bg-surface transition duration-200 hover:border-white/20"
      style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,.06)" }}
    >
      <Link href={detailHref(product)} aria-label={`Ver ${product.name}`}>
        <ProductImage
          images={product.images}
          name={product.name}
          type={product.type}
          className="shine aspect-[4/3] w-full rounded-t-[28px]"
        />
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <p className="text-base font-semibold tracking-wide text-steel-deep uppercase">
          {TYPE_LABEL[product.type]} · {product.brand}
        </p>
        <h3 className="text-2xl font-semibold text-text">
          <Link href={detailHref(product)} className="hover:underline">
            {product.name}
          </Link>
        </h3>
        <dl className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-text-muted">
          {specs.map(([k, v]) => (
            <div key={k} className="flex gap-1">
              <dt className="text-text-faint">{k}:</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-auto pt-3">
          <Price
            value={product.priceRetail}
            before={product.priceBefore}
            className="text-2xl font-semibold text-steel-deep"
            beforeClassName="text-base text-text-muted"
          />
        </div>
        <div className="flex items-center gap-2">
          <AddToCartButton product={product} />
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Preguntar por ${product.name} por WhatsApp`}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-black/15 px-4 py-2 text-sm font-medium text-text transition hover:border-black/30 hover:scale-[1.02]"
          >
            <MessageCircle size={15} aria-hidden />
            Preguntar
          </a>
        </div>
      </div>
    </article>
  );
}
