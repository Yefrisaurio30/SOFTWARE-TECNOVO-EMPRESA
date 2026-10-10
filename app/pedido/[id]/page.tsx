import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCOP } from "@/lib/money";
import { Container, SectionHeading } from "@/components/ui/section";
import { PayButton } from "@/components/payment/pay-button";

const STATUS_LABEL: Record<string, string> = {
  PENDIENTE: "Pendiente de pago",
  PAGADO: "Pagado",
  RECHAZADO: "Pago rechazado",
  ENVIADO: "Enviado",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

export const metadata: Metadata = {
  title: "Estado del pedido | TECNOVO",
  description: "Consulta el estado de tu pedido.",
};

export default async function PedidoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { product: { select: { name: true, brand: true, slug: true } } } } },
  });
  if (!order) notFound();

  return (
    <main className="bg-black py-10 text-text md:py-14">
      <Container>
        <SectionHeading eyebrow="Pedido" title="Así va tu pedido." />
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="rounded-[28px] border border-white/10 bg-surface p-6 md:p-8">
            <div className="flex flex-wrap items-center gap-3">
              <span
                role="status"
                className="rounded-full border border-steel/50 px-4 py-1.5 text-sm font-medium text-steel"
              >
                {STATUS_LABEL[order.status] ?? order.status}
              </span>
              <span className="text-xs text-text-faint">N.º {order.id.slice(-8).toUpperCase()}</span>
            </div>
            <ul className="mt-6 flex flex-col gap-3">
              {order.items.map((it) => (
                <li key={it.id} className="flex justify-between gap-3 text-[15px]">
                  <span className="text-text-muted">
                    {it.qty} × {it.product.name}
                  </span>
                  <span className="shrink-0 tabular-nums">{formatCOP(it.unitPrice * it.qty)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex justify-between border-t border-white/10 pt-4 text-lg font-semibold">
              <span>Total pagado/por pagar</span>
              <span className="tabular-nums">{formatCOP(order.total)}</span>
            </div>
            <dl className="mt-6 grid gap-2 text-sm text-text-muted sm:grid-cols-2">
              <div><dt className="text-text-faint">Nombre</dt><dd className="text-text">{order.contactName}</dd></div>
              <div><dt className="text-text-faint">Celular</dt><dd className="text-text">{order.contactPhone}</dd></div>
              <div><dt className="text-text-faint">Ciudad</dt><dd className="text-text">{order.city}</dd></div>
              <div><dt className="text-text-faint">Entrega</dt><dd className="text-text">{order.delivery === "ENVIO" ? "Envío a domicilio" : "Recoger en tienda"}</dd></div>
              <div className="sm:col-span-2"><dt className="text-text-faint">Dirección</dt><dd className="text-text">{order.address}</dd></div>
            </dl>
            {order.status === "PENDIENTE" ? (
              <div className="mt-6 rounded-[24px] border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-text-muted">
                  Tu pedido quedó registrado y está verificando el pago. Si aún no pagas:
                </p>
                <div className="mt-3">
                  <PayButton orderId={order.id} />
                </div>
              </div>
            ) : null}
          </div>
          <aside className="h-fit rounded-[24px] border border-white/10 bg-surface p-6">
            <h2 className="font-semibold">¿Necesitas ayuda?</h2>
            <p className="mt-1 text-sm text-text-muted">Escríbenos con el número de pedido.</p>
            <Link
              href="/motos-electricas"
              className="mt-4 block rounded-full border border-white/15 py-2.5 text-center text-sm"
            >
              Seguir explorando
            </Link>
          </aside>
        </div>
      </Container>
    </main>
  );
}
