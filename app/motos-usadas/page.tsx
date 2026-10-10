import type { Metadata } from "next";
import { getBrandsByType, getCatalog } from "@/lib/products";
import { pageHref, parseFilters } from "@/lib/catalog-params";
import { Container, SectionHeading } from "@/components/ui/section";
import { Filters } from "@/components/catalog/filters";
import { Pagination } from "@/components/catalog/pagination";
import { EmptyState } from "@/components/catalog/empty-state";
import { ProductCard } from "@/components/product/product-card";

export const metadata: Metadata = {
  title: "Motos de segunda mano | TECNOVO",
  description: "Motos eléctricas usadas revisadas, con historial y garantía. Unidades únicas.",
};

type SP = Record<string, string | string[] | undefined>;

export default async function UsadasPage({ searchParams }: { searchParams: Promise<SP> }) {
  const raw = await searchParams;
  const { filters, values } = parseFilters(raw);
  const [{ items, total, pages, page }, brands] = await Promise.all([
    getCatalog(["MOTO_USADA"], filters),
    getBrandsByType(["MOTO_USADA"]),
  ]);

  return (
    <main className="bg-black py-10 text-text md:py-14">
      <Container>
        <SectionHeading
          eyebrow="Catálogo"
          title="Segunda mano revisada."
          description="Cada unidad se inspecciona y se vende con garantía. Cuando se reserva, se bloquea."
        />
        <div className="mt-8">
          <Filters variant="usadas" brands={brands} values={values} clearHref="/motos-usadas" />
        </div>
        <div className="mt-8">
          {items.length === 0 ? (
            <EmptyState
              title="Sin resultados"
              text="Las usadas vuelan: prueba con otros filtros o pregúntanos por WhatsApp."
              clearHref="/motos-usadas"
            />
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
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
