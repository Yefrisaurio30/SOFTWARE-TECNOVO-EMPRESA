import type { Metadata } from "next";
import Link from "next/link";
import { getCatalog } from "@/lib/products";
import { pageHref, parseFilters } from "@/lib/catalog-params";
import { Container, SectionHeading } from "@/components/ui/section";
import { Filters } from "@/components/catalog/filters";
import { StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { Pagination } from "@/components/catalog/pagination";
import { EmptyState } from "@/components/catalog/empty-state";
import { ProductCard } from "@/components/product/product-card";

export const metadata: Metadata = {
  title: "Motos de segunda | TECNOVO",
  description: "Motos eléctricas usadas revisadas, con historial y garantía. Unidades únicas.",
};

type SP = Record<string, string | string[] | undefined>;

export default async function UsadasPage({ searchParams }: { searchParams: Promise<SP> }) {
  const raw = await searchParams;
  const { filters, values } = parseFilters(raw);
  const { items, total, pages, page } = await getCatalog(["MOTO_USADA"], filters);

  return (
    <main className="bg-white py-10 text-text md:py-14">
      <Container>
        <SectionHeading
          eyebrow="Catálogo"
          title="Segunda mano."
          description="Cada unidad se inspecciona y se vende con garantía. Cuando se reserva, se bloquea."
        />
        <Link
          href="/publicar"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-steel px-8 py-4 text-lg font-semibold text-white shadow-md transition hover:scale-[1.03]"
        >
          ¿Tienes una moto para vender? Publícala aquí
        </Link>
        <div className="mt-8">
          <Filters values={values} clearHref="/motos-usadas" />
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
