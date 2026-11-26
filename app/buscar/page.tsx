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
  title: "Buscar | TECNOVO",
  description: "Busca motos eléctricas, segunda mano, repuestos y accesorios.",
  path: "/buscar",
});

type SP = Record<string, string | string[] | undefined>;

export default async function BuscarPage({ searchParams }: { searchParams: Promise<SP> }) {
  const raw = await searchParams;
  const { filters, values } = parseFilters(raw);
  const { items, total, pages, page } = await getCatalog(
    ["MOTO_NUEVA", "MOTO_USADA", "REPUESTO", "ACCESORIO"],
    filters,
  );

  return (
    <main className="bg-white py-10 text-text md:py-14">
      <Container>
        <SectionHeading
          eyebrow="Búsqueda"
          title={filters.q ? `Resultados para "${filters.q}".` : "Busca en todo el catálogo."}
          description={`${total} resultado${total === 1 ? "" : "s"}.`}
        />
        <div className="mt-8">
          <Filters values={values} clearHref="/buscar" />
        </div>
        <div className="mt-8">
          {items.length === 0 ? (
            <EmptyState
              title="Sin resultados"
              text="Prueba con otro término o ajusta los filtros."
              clearHref="/buscar"
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
                <Pagination page={page} pages={pages} total={total} buildHref={(n) => pageHref(raw, n)} />
              </div>
            </>
          )}
        </div>
      </Container>
    </main>
  );
}