import type { Metadata } from "next";
import { getBrandsByType, getCatalog } from "@/lib/products";
import { pageHref, parseFilters } from "@/lib/catalog-params";
import { Container, SectionHeading } from "@/components/ui/section";
import { Filters } from "@/components/catalog/filters";
import { StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { Pagination } from "@/components/catalog/pagination";
import { EmptyState } from "@/components/catalog/empty-state";
import { ProductCard } from "@/components/product/product-card";

export const metadata: Metadata = {
  title: "Motos eléctricas nuevas | TECNOVO",
  description: "Catálogo de motos eléctricas nuevas con autonomía, potencia y garantía en Colombia.",
};

type SP = Record<string, string | string[] | undefined>;

export default async function ElectricasPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const raw = await searchParams;
  const { filters, values } = parseFilters(raw);
  const [{ items, total, pages, page }, brands] = await Promise.all([
    getCatalog(["MOTO_NUEVA"], filters),
    getBrandsByType(["MOTO_NUEVA"]),
  ]);

  return (
    <main className="bg-black py-10 text-text md:py-14">
      <Container>
        <SectionHeading
          eyebrow="Catálogo"
          title="Motos eléctricas nuevas."
          description="Autonomía real, batería extraíble y garantía escrita."
        />
        <div className="mt-8">
          <Filters variant="nuevas" brands={brands} values={values} clearHref="/motos-electricas" />
        </div>
        <div className="mt-8">
          {items.length === 0 ? (
            <EmptyState
              title="Sin resultados"
              text="Prueba con otra marca, otro rango de precio u otra búsqueda."
              clearHref="/motos-electricas"
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
