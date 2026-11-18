import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCOP } from "@/lib/money";
import { DeleteProductButton } from "@/components/admin/delete-button";
import { ToggleProductActiveButton } from "@/components/admin/toggle-product-button";

export default async function ProductosPage() {
  const products = await prisma.product.findMany({
    orderBy: { updatedAt: "desc" },
    select: { id: true, name: true, type: true, brand: true, priceRetail: true, stock: true, featured: true, active: true },
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">Productos ({products.length})</h1>
        <Link
          href="/admin/productos/nuevo"
          className="rounded-full bg-white px-5 py-2.5 text-sm font-medium text-[#000]"
        >
          + Nuevo
        </Link>
      </div>
      <div className="mt-6 overflow-x-auto rounded-[24px] border border-white/10">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-text-muted">
              <th className="px-4 py-3 font-medium">Producto</th>
              <th className="px-4 py-3 font-medium">Tipo</th>
              <th className="px-4 py-3 font-medium">Precio</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-white/5 last:border-0">
                <td className="px-4 py-3">
                  <p className="font-medium">{p.name}</p>
                  <p className="text-xs text-text-faint">{p.brand}</p>
                </td>
                <td className="px-4 py-3 text-text-muted">{p.type}</td>
                <td className="px-4 py-3 tabular-nums">{formatCOP(p.priceRetail)}</td>
                <td className="px-4 py-3 tabular-nums">{p.stock}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      p.active
                        ? "inline-block rounded-full border border-steel/50 px-2.5 py-0.5 text-xs text-steel"
                        : "inline-block rounded-full border border-danger/40 px-2.5 py-0.5 text-xs text-danger"
                    }
                  >
                    {p.active ? "Activo" : "Inactivo"}
                  </span>
                  {p.featured ? <span className="ml-1 text-xs">★</span> : null}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <Link href={`/admin/productos/${p.id}`} className="text-steel hover:underline">
                      Editar
                    </Link>
                    <ToggleProductActiveButton id={p.id} name={p.name} active={p.active} />
                    <DeleteProductButton id={p.id} name={p.name} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
