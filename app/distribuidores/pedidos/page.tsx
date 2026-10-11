import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireApprovedDistributor } from "@/lib/distributor";
import { formatCOP } from "@/lib/money";
import { Container, SectionHeading } from "@/components/ui/section";
import { PrintButton } from "@/components/distribuidor/print-button";

export const metadata: Metadata = {
  title: "Mis pedidos mayoristas | TECNOVO",
  description: "Historial de pedidos del distribuidor.",
};

export default async function PedidosMayoristasPage() {
  const { session } = await requireApprovedDistributor();
  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { items: { include: { product: { select: { name: true } } } } },
  });

  const totalComprado = orders
    .filter((o) => ["PAGADO", "ENVIADO", "ENTREGADO"].includes(o.status))
    .reduce((n, o) => n + o.total, 0);

  return (
    <main className="bg-black py-10 text-text md:py-14">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4 print:block">
          <SectionHeading
            eyebrow="Distribuidor"
            title="Mis pedidos."
            description={`Acumulado pagado: ${formatCOP(totalComprado)}`}
          />
          <div className="print:hidden">
            <PrintButton />
          </div>
        </div>
        {orders.length === 0 ? (
          <p className="mt-8 rounded-[24px] border border-white/10 bg-surface p-8 text-center text-text-muted print:hidden">
            Aún no tienes pedidos. <Link href="/distribuidores/catalogo" className="text-text underline">Ir al catálogo</Link>
          </p>
        ) : (
          <ul className="mt-8 flex flex-col gap-4">
            {orders.map((o) => (
              <li key={o.id} className="rounded-[24px] border border-white/10 bg-surface p-5">
                <div className="flex flex-wrap justify-between gap-2 text-sm">
                  <span className="text-text-muted">
                    {o.createdAt.toLocaleDateString("es-CO")} · {o.status}
                    {o.isWholesale ? " · Mayorista" : " · Retail"}
                  </span>
                  <span className="font-semibold tabular-nums">{formatCOP(o.total)}</span>
                </div>
                <ul className="mt-2 text-sm text-text-muted">
                  {o.items.map((it) => (
                    <li key={it.id}>
                      {it.qty} × {it.product.name} ({formatCOP(it.unitPrice)} c/u)
                    </li>
                  ))}
                </ul>
                <Link href={`/pedido/${o.id}`} className="mt-2 inline-block text-sm text-steel print:hidden">
                  Ver detalle ›
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </main>
  );
}
