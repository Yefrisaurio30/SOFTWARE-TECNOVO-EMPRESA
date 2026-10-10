import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCOP } from "@/lib/money";
import { SalesChart } from "@/components/admin/sales-chart";

function monthStart(): Date {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export default async function AdminPage() {
  const [monthSales, pending, lowStock, recent, lastWeek] = await Promise.all([
    prisma.order.aggregate({
      where: { status: { in: ["PAGADO", "ENVIADO", "ENTREGADO"] }, createdAt: { gte: monthStart() } },
      _sum: { total: true },
      _count: true,
    }),
    prisma.order.count({ where: { status: "PENDIENTE" } }),
    prisma.product.findMany({
      where: { active: true, stock: { lte: 5 } },
      orderBy: { stock: "asc" },
      take: 8,
      select: { id: true, name: true, stock: true },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: { id: true, status: true, total: true, contactName: true, createdAt: true },
    }),
    prisma.order.findMany({
      where: {
        status: { in: ["PAGADO", "ENVIADO", "ENTREGADO"] },
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 3600 * 1000) },
      },
      select: { total: true, createdAt: true },
    }),
  ]);

  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    const total = lastWeek
      .filter((o) => o.createdAt.toISOString().slice(0, 10) === key)
      .reduce((n, o) => n + o.total, 0);
    return { day: d.toLocaleDateString("es-CO", { weekday: "short" }), total };
  });

  const cards = [
    { label: "Ventas del mes", value: formatCOP(monthSales._sum.total ?? 0) },
    { label: "Pedidos mes", value: String(monthSales._count) },
    { label: "Pendientes", value: String(pending) },
  ];

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Panel</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-[24px] border border-white/10 bg-surface p-6">
            <p className="text-sm text-text-muted">{c.label}</p>
            <p className="mt-1 text-3xl font-semibold tabular-nums">{c.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-[24px] border border-white/10 bg-surface p-6">
          <h2 className="font-semibold">Ventas últimos 7 días</h2>
          <div className="mt-4">
            <SalesChart data={days} />
          </div>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-surface p-6">
          <h2 className="font-semibold">Stock bajo (≤ 5)</h2>
          {lowStock.length === 0 ? (
            <p className="mt-3 text-sm text-text-muted">Todo bien por ahora.</p>
          ) : (
            <ul className="mt-3 flex flex-col gap-2 text-sm">
              {lowStock.map((p) => (
                <li key={p.id} className="flex justify-between gap-3">
                  <Link href={`/admin/productos/${p.id}`} className="truncate hover:underline">
                    {p.name}
                  </Link>
                  <span className="shrink-0 tabular-nums text-danger">{p.stock}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="mt-6 rounded-[24px] border border-white/10 bg-surface p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Pedidos recientes</h2>
          <Link href="/admin/pedidos" className="text-sm">Ver todos ›</Link>
        </div>
        <ul className="mt-3 flex flex-col gap-2 text-sm">
          {recent.map((o) => (
            <li key={o.id} className="flex justify-between gap-3">
              <span className="truncate text-text-muted">
                {o.contactName} · {o.status}
              </span>
              <span className="shrink-0 tabular-nums">{formatCOP(o.total)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
