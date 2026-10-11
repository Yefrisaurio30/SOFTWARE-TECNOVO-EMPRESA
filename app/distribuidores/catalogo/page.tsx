import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireApprovedDistributor, companyFor, minUnitsFor } from "@/lib/distributor";
import { Container, SectionHeading } from "@/components/ui/section";
import { WholesaleCard } from "@/components/distribuidor/wholesale-card";

export const metadata: Metadata = {
  title: "Catálogo mayorista | TECNOVO",
  description: "Motos nuevas a precio mayorista para mayoristas aprobados.",
};

export default async function CatalogoMayoristaPage() {
  const { session, profile } = await requireApprovedDistributor();
  const company = companyFor(profile, session.user.name ?? session.user.email ?? "Mayorista");
  const minUnits = minUnitsFor(profile);
  const products = await prisma.product.findMany({
    where: { active: true, type: "MOTO_NUEVA" },
    orderBy: [{ featured: "desc" }, { name: "asc" }],
  });

  return (
    <main className="bg-black py-10 text-text md:py-14">
      <Container>
        <SectionHeading
          eyebrow={`${company} · Pedido mínimo ${minUnits} uds.`}
          title="Catálogo mayorista."
          description="Solo motos nuevas a precio de distribuidor. El total se valida en el servidor."
        />
        <div className="mt-4 flex gap-4 text-sm">
          <Link href="/checkout" className="rounded-full bg-white px-5 py-2 font-medium text-black">
            Ir al checkout mayorista
          </Link>
          <Link href="/distribuidores/pedidos" className="py-2 text-text-muted hover:text-text">
            Mis pedidos ›
          </Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <WholesaleCard key={p.id} product={p} />
          ))}
        </div>
      </Container>
    </main>
  );
}
