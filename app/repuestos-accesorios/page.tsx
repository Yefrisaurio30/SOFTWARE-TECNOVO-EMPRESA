import type { Metadata } from "next";
import { getCatalog } from "@/lib/products";
import { pageHref, parseFilters } from "@/lib/catalog-params";
import { Container, SectionHeading } from "@/components/ui/section";
import { Filters } from "@/components/catalog/filters";
import { StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { Pagination } from "@/components/catalog/pagination";
import { EmptyState } from "@/components/catalog/empty-state";
import { ProductCard } from "@/components/product/product-card";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Repuestos y accesorios | TECNOVO",
  description: "Baterías, llantas, frenos, cascos y accesorios compatibles con tu moto eléctrica.",
  path: "/repuestos-accesorios",
});

type SP = Record<string, string | string[] | undefined>;

export default async function RepuestosPage({ searchParams }: { searchParams: Promise<SP> }) {
  const raw = await searchParams;
  const { filters, values } = parseFilters(raw);
  const { items, total, pages, page } = await getCatalog(["REPUESTO", "ACCESORIO"], filters);

  return (
    <main className="bg-white py-10 text-text md:py-14">
      <Container>
        <SectionHeading
          eyebrow="Catálogo"
          title="Repuestos y accesorios."
          description="Originales y compatibles, con referencia y modelos aplicables."
        />
        <div className="mt-8">
          <Filters values={values} clearHref="/repuestos-accesorios" />
        </div>
        <div className="mt-8">
          {items.length === 0 ? (
            <EmptyState
              title="Sin resultados"
              text="Escríbenos por WhatsApp con la referencia: la conseguimos."
              clearHref="/repuestos-accesorios"
            />
          ) : (
            <>
              <StaggerGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((p) => (
                  <StaggerItem key={p.id}>
                    <ProductCard product={p} />
                  </StaggerItem>
                ))}
              </StaggerGroup>
              <div className="mt-8">
                <Pagination
                  page={page}
                  pages={pages}
                  total={total}
                  buildHref={(n) => pageHref(raw, n)}
                />
              </div>
            </>
          )}
        </div>
      </Container>
    </main>
  );
}
