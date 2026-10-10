import Link from "next/link";
import type { Product } from "@prisma/client";
import { Container, SectionHeading } from "@/components/ui/section";
import { ProductCard } from "@/components/product/product-card";

export function ModelGrid({ products }: { products: Product[] }) {
  if (products.length === 0) return null;
  return (
    <section aria-label="Modelos destacados" className="bg-light py-24 text-light-text md:py-32">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            tone="light"
            eyebrow="Catálogo"
            title="Modelos que se mueven solos."
            description="Una selección de nuestras eléctricas nuevas más pedidas."
          />
          <Link href="/motos-electricas" className="text-[15px] font-medium">
            Ver todas <span aria-hidden>›</span>
          </Link>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </Container>
    </section>
  );
}
