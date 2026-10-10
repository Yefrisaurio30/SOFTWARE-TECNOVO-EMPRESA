import Link from "next/link";
import type { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatCOP } from "@/lib/money";
import { setOrderStatus } from "@/lib/admin-actions";

const STATUSES = ["PENDIENTE", "PAGADO", "RECHAZADO", "ENVIADO", "ENTREGADO", "CANCELADO"];

export default async function PedidosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const statusParam = typeof raw.status === "string" && STATUSES.includes(raw.status) ? (raw.status as OrderStatus) : undefined;
  const status = statusParam ?? "";
  const orders = await prisma.order.findMany({
    where: statusParam ? { status: statusParam } : {},
    orderBy: { createdAt: "desc" },
    take: 100,
    select: { id: true, status: true, total: true, contactName: true, city: true, createdAt: true, isWholesale: true },
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">Pedidos ({orders.length})</h1>
        <a
          href={status ? `/api/admin/orders/export?status=${status}` : "/api/admin/orders/export"}
          className="rounded-full border border-white/15 px-5 py-2 text-sm"
        >
          Exportar CSV
        </a>
      </div>
      <div className="mt-4 flex flex-wrap gap-2" role="navigation" aria-label="Filtrar por estado">
        <Link href="/admin/pedidos" className={`rounded-full px-4 py-1.5 text-sm ${!status ? "bg-white text-black" : "border border-white/10 text-text-muted"}`}>
          Todos
        </Link>
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/pedidos?status=${s}`}
            className={`rounded-full px-4 py-1.5 text-sm ${status === s ? "bg-white text-black" : "border border-white/10 text-text-muted"}`}
          >
            {s}
          </Link>
        ))}
      </div>
      <div className="mt-6 overflow-x-auto rounded-[24px] border border-white/10">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-text-muted">
              <th className="px-4 py-3 font-medium">Pedido</th>
              <th className="px-4 py-3 font-medium">Cliente</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Cambiar</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-white/5 last:border-0">
                <td className="px-4 py-3">
                  <Link href={`/admin/pedidos/${o.id}`} className="hover:underline">
                    {o.id.slice(-8).toUpperCase()}
                  </Link>
                  <p className="text-xs text-text-faint">
                    {o.createdAt.toLocaleDateString("es-CO")}{o.isWholesale ? " · Mayorista" : ""}
                  </p>
                </td>
                <td className="px-4 py-3">{o.contactName} · {o.city}</td>
                <td className="px-4 py-3 tabular-nums">{formatCOP(o.total)}</td>
                <td className="px-4 py-3">{o.status}</td>
                <td className="px-4 py-3">
                  <form action={async (fd: FormData) => {
                    "use server";
                    await setOrderStatus(o.id, String(fd.get("status")));
                  }} className="flex gap-2">
                    <select name="status" defaultValue={o.status} aria-label={`Estado del pedido ${o.id}`} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs">
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <button type="submit" className="rounded-full border border-white/15 px-3 py-1 text-xs">
                      OK
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
