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
import { auth } from "@/lib/auth";
import { getWhatsAppNumber } from "@/lib/site-settings";
import { INTERMEDIARY_PHONE_DIGITS } from "@/lib/intermediary";
import { DirectPurchaseButton } from "@/components/purchase/direct-purchase";
import { Container } from "@/components/ui/section";
import { AddToCartButton } from "@/components/cart/add-button";
import { Gallery } from "@/components/product/gallery";
import { SpecsTable } from "@/components/product/specs-table";
import { Price } from "@/components/product/price";
import { StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { ProductCard, detailHref } from "@/components/product/product-card";
import { absoluteUrl, jsonLd, pageMetadata } from "@/lib/seo";

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
  return pageMetadata({
    title: `${product.name} | TECNOVO`,
    description: product.description.slice(0, 155),
    path: detailHref({ slug: product.slug, type: product.type }),
    image: product.images[0] ?? "/brand/tecnovo-logo-negro.png",
  });
}

export default async function ProductPage({ params }: { params: Promise<Params> }) {
  const { categoria, slug } = await params;
  if (!isCatalogCategory(categoria)) notFound();
  const product = await getProductBySlug(slug);
  if (!product || !CATEGORY_TO_TYPES[categoria].includes(product.type)) notFound();

  const specs = getSpecs(product);
  // La comisión y la ganancia del vendedor solo aparecen en la ficha cuando
  // el que mira es el SUPERADMIN; para el público se filtran en allSpecs.
  const session = await auth();
  const isAdmin = session?.user?.role === "SUPERADMIN";
  const related = await getRelatedProducts(product.type, product.id, 4);
  const url = absoluteUrl(detailHref(product));
  const isUsed = product.type === "MOTO_USADA";
  const available = product.stock > 0;

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        name: product.name,
        description: product.description,
        sku: product.slug,
        brand: { "@type": "Brand", name: product.brand },
        image:
          product.images.length > 0
            ? product.images.map(absoluteUrl)
            : [absoluteUrl("/brand/tecnovo-logo-negro.png")],
        offers: {
          "@type": "Offer",
          url,
          priceCurrency: "COP",
          price: product.priceRetail,
          availability: available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Inicio", item: absoluteUrl("/") },
          {
            "@type": "ListItem",
            position: 2,
            name: CATEGORY_LABEL[categoria],
            item: absoluteUrl(`/${categoria}`),
          },
          { "@type": "ListItem", position: 3, name: product.name, item: url },
        ],
      },
    ],
  };

  return (
    <main className="bg-white py-10 text-text md:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }}
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
            <p className="text-xl md:text-2xl font-semibold tracking-wide text-steel-deep uppercase">
              {CATEGORY_LABEL[categoria]} · {product.brand}
            </p>
            <h1
              className="mt-2 font-semibold break-words"
              style={{ fontSize: "clamp(30px, 5.5vw, 64px)", lineHeight: 1.05, letterSpacing: "-0.03em" }}
            >
              {product.name}
            </h1>
            {isUsed ? (
              <div className="mt-3 flex flex-wrap gap-2 text-sm">
                <span className="rounded-full border border-steel/50 px-3 py-1 text-steel-deep">
                  Unidad única
                </span>
                <span className="rounded-full border border-black/15 px-3 py-1 text-text-muted">
                  Modelo {String(specs.anio ?? "—")}
                </span>
                <span className="rounded-full border border-black/15 px-3 py-1 text-text-muted">
                  {formatCOP(product.priceRetail)}
                </span>
              </div>
            ) : null}
            <Price
              value={product.priceRetail}
              before={product.priceBefore}
              className="mt-4 text-4xl font-semibold text-steel-deep"
              beforeClassName="text-2xl text-text-muted"
            />
            <p className="mt-1 text-sm text-text-muted" role="status">
              {available ? null : "Agotado temporalmente"}
            </p>
            <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-text-muted">
              {product.description}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {available ? <AddToCartButton product={product} /> : null}
              <DirectPurchaseButton
                product={{ name: product.name, price: product.priceRetail }}
                number={isUsed ? INTERMEDIARY_PHONE_DIGITS : await getWhatsAppNumber()}
                className="inline-flex items-center gap-2 rounded-full border border-black/15 px-7 py-3 text-[15px] font-semibold text-text transition hover:border-black/30 hover:scale-[1.02]"
              >
                <MessageCircle size={18} aria-hidden />
                Preguntar
              </DirectPurchaseButton>
            </div>
            <div className="mt-8">
              <h2 className="mb-3 text-lg font-semibold">Ficha técnica</h2>
              <SpecsTable specs={specs} admin={isAdmin} />
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
            <StaggerGroup className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p) => (
                <StaggerItem key={p.id}>
                  <ProductCard product={p} />
                </StaggerItem>
              ))}
            </StaggerGroup>
          </section>
        ) : null}
      </Container>
    </main>
  );
}
