import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageCircle } from "lucide-react";
import {
  CATEGORY_TO_TYPES,
  getProductBySlug,
  getRelatedProducts,
  getSpecs,
  isCatalogCategory,
} from "@/lib/products";
import { formatCOP } from "@/lib/money";
import { waProductLink } from "@/lib/whatsapp";
import { getWhatsAppNumber } from "@/lib/site-settings";
import { Container } from "@/components/ui/section";
import { AddToCartButton } from "@/components/cart/add-button";
import { Gallery } from "@/components/product/gallery";
import { SpecsTable } from "@/components/product/specs-table";
import { Price } from "@/components/product/price";
import { ProductCard, detailHref } from "@/components/product/product-card";

const CATEGORY_LABEL: Record<string, string> = {
  "motos-electricas": "Motos eléctricas",
  "motos-usadas": "Segunda mano",
  "repuestos-accesorios": "Repuestos y accesorios",
};

type Params = { categoria: string; slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { categoria, slug } = await params;
  if (!isCatalogCategory(categoria)) return { title: "No encontrado | TECNOVO" };
  const product = await getProductBySlug(slug);
  if (!product || !CATEGORY_TO_TYPES[categoria].includes(product.type)) {
    return { title: "No encontrado | TECNOVO" };
  }
  return {
    title: `${product.name} | TECNOVO`,
    description: product.description.slice(0, 155),
    openGraph: {
      title: product.name,
      description: product.description.slice(0, 155),
      images: product.images.length > 0 ? product.images : ["/brand/tecnovo-logo-original.png"],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<Params> }) {
  const { categoria, slug } = await params;
  if (!isCatalogCategory(categoria)) notFound();
  const product = await getProductBySlug(slug);
  if (!product || !CATEGORY_TO_TYPES[categoria].includes(product.type)) notFound();

  const specs = getSpecs(product);
  const related = await getRelatedProducts(product.type, product.id, 4);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const url = `${siteUrl}${detailHref(product)}`;
  const wa = waProductLink(product.name, detailHref(product), await getWhatsAppNumber());
  const isUsed = product.type === "MOTO_USADA";
  const available = product.stock > 0;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    brand: { "@type": "Brand", name: product.brand },
    image: product.images.length > 0 ? product.images : [`${siteUrl}/brand/tecnovo-logo-original.png`],
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "COP",
      price: product.priceRetail,
      availability: available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <main className="bg-black py-10 text-text md:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Container>
        <nav aria-label="Miga de pan" className="text-sm text-text-muted">
          <Link href="/" className="hover:text-text">
            Inicio
          </Link>
          <span aria-hidden> · </span>
          <Link href={`/${categoria}`} className="hover:text-text">
            {CATEGORY_LABEL[categoria]}
          </Link>
          <span aria-hidden> · </span>
          <span aria-current="page" className="text-text">
            {product.name}
          </span>
        </nav>

        <div className="mt-6 grid gap-10 lg:grid-cols-2">
          <Gallery images={product.images} name={product.name} type={product.type} />
          <div>
            <p className="text-sm font-medium tracking-wide text-steel uppercase">
              {CATEGORY_LABEL[categoria]} · {product.brand}
            </p>
            <h1
              className="mt-2 font-semibold"
              style={{ fontSize: "clamp(32px, 5vw, 56px)", lineHeight: 1.05, letterSpacing: "-0.03em" }}
            >
              {product.name}
            </h1>
            {isUsed ? (
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full border border-steel/50 px-3 py-1 text-steel">
                  Unidad única
                </span>
                <span className="rounded-full border border-white/10 px-3 py-1 text-text-muted">
                  Modelo {String(specs.anio ?? "—")}
                </span>
                <span className="rounded-full border border-white/10 px-3 py-1 text-text-muted">
                  {formatCOP(product.priceRetail)}
                </span>
              </div>
            ) : null}
            <Price value={product.priceRetail} className="mt-4 block text-3xl font-semibold" />
            <p className="mt-1 text-sm text-text-muted" role="status">
              {available ? `Disponible (${product.stock} en stock)` : "Agotado temporalmente"}
            </p>
            <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-text-muted">
              {product.description}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {available ? <AddToCartButton product={product} /> : null}
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-[15px] font-medium text-black transition hover:scale-[1.02]"
              >
                <MessageCircle size={18} aria-hidden />
                Cotizar por WhatsApp
              </a>
            </div>
            <div className="mt-8">
              <h2 className="mb-3 text-lg font-semibold">Ficha técnica</h2>
              <SpecsTable specs={specs} />
            </div>
          </div>
        </div>

        {related.length > 0 ? (
          <section aria-label="Productos relacionados" className="mt-20">
            <div className="flex items-end justify-between gap-4">
              <h2 className="text-2xl font-semibold tracking-tight">También te puede interesar</h2>
              <Link href={`/${categoria}`} className="text-[15px]">
                Ver más <span aria-hidden>›</span>
              </Link>
            </div>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        ) : null}
      </Container>
    </main>
  );
}
