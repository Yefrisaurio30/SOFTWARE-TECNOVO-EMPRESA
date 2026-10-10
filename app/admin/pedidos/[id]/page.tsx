import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCOP } from "@/lib/money";

export default async function PedidoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { product: { select: { name: true } } } }, user: { select: { email: true } } },
  });
  if (!order) notFound();

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Pedido {order.id.slice(-8).toUpperCase()}</h1>
      <div className="mt-6 grid max-w-4xl gap-4">
        <div className="rounded-[24px] border border-white/10 bg-surface p-6 text-sm">
          <p><span className="text-text-muted">Estado:</span> {order.status}</p>
          <p><span className="text-text-muted">Total:</span> <span className="tabular-nums">{formatCOP(order.total)}</span></p>
          <p><span className="text-text-muted">Cliente:</span> {order.contactName} · {order.contactPhone}{order.contactEmail ? ` · ${order.contactEmail}` : ""}</p>
          <p><span className="text-text-muted">Entrega:</span> {order.delivery} · {order.address} · {order.city}</p>
          <p><span className="text-text-muted">Cuenta:</span> {order.user?.email ?? "Invitado"}{order.isWholesale ? " · Mayorista" : ""}</p>
          <p><span className="text-text-muted">Ref. pago:</span> {order.paymentRef ?? "—"}</p>
        </div>
        <div className="overflow-x-auto rounded-[24px] border border-white/10">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-text-muted">
                <th className="px-4 py-3 font-medium">Producto</th>
                <th className="px-4 py-3 font-medium">Cant.</th>
                <th className="px-4 py-3 font-medium">Unitario</th>
                <th className="px-4 py-3 font-medium">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((it) => (
                <tr key={it.id} className="border-b border-white/5 last:border-0">
                  <td className="px-4 py-3">{it.product.name}</td>
                  <td className="px-4 py-3 tabular-nums">{it.qty}</td>
                  <td className="px-4 py-3 tabular-nums">{formatCOP(it.unitPrice)}</td>
                  <td className="px-4 py-3 tabular-nums">{formatCOP(it.unitPrice * it.qty)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
