import type { Metadata } from "next";
import { getCatalog } from "@/lib/products";
import { Container, SectionHeading } from "@/components/ui/section";
import { StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { EmptyState } from "@/components/catalog/empty-state";
import { ProductCard } from "@/components/product/product-card";

export const metadata: Metadata = {
  title: "Motos eléctricas nuevas | TECNOVO",
  description: "Catálogo de motos eléctricas nuevas con autonomía, potencia y garantía en Colombia.",
};

export const revalidate = 60;

export default async function ElectricasPage() {
  const { items, total } = await getCatalog(["MOTO_NUEVA"], {}, 100);

  return (
    <main className="bg-white py-10 text-text md:py-14">
      <Container>
        <SectionHeading
          eyebrow="Catálogo"
          title="Motos eléctricas nuevas."
          description="Autonomía real, batería extraíble y garantía escrita."
        />
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
