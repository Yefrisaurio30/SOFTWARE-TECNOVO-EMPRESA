import type { Metadata } from "next";
import Link from "next/link";
import { getCatalog } from "@/lib/products";
import { Container, SectionHeading } from "@/components/ui/section";
import { StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { EmptyState } from "@/components/catalog/empty-state";
import { ProductCard } from "@/components/product/product-card";

export const metadata: Metadata = {
  title: "Motos de segunda | TECNOVO",
  description: "Motos eléctricas usadas revisadas, con historial y garantía. Unidades únicas.",
};

export const revalidate = 60;

export default async function UsadasPage() {
  const { items, total } = await getCatalog(["MOTO_USADA"], {}, 100);

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
              <p className="mt-8 text-sm text-text-muted" role="status">
                {total} {total === 1 ? "moto disponible" : "motos disponibles"}
              </p>
            </>
          )}
        </div>
      </Container>
    </main>
  );
}
