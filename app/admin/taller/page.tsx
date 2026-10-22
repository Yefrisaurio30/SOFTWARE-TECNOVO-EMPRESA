import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DeleteServiceButton } from "@/components/admin/delete-service-button";

export default async function AdminTallerPage() {
  const services = await prisma.service.findMany({ orderBy: [{ order: "asc" }, { name: "asc" }] });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">Red de servicio ({services.length})</h1>
        <div className="flex gap-3">
          <Link href="/taller" className="rounded-full border border-white/15 px-5 py-2.5 text-sm">
            Ver /taller
          </Link>
          <Link href="/admin/taller/nuevo" className="rounded-full bg-steel px-5 py-2.5 text-sm font-medium text-[#000]">
            + Nuevo punto
          </Link>
        </div>
      </div>

      {services.length === 0 ? (
        <p className="mt-6 rounded-[24px] border border-white/10 bg-surface p-8 text-center text-text-muted">
          Aún no hay puntos de servicio. Crea el primero.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-[24px] border border-white/10">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-text-muted">
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">Ciudad</th>
                <th className="px-4 py-3 font-medium">Servicios</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {services.map((s) => (
                <tr key={s.id} className="border-b border-white/5 last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium">{s.name}</p>
                    {s.isHeadquarter ? <p className="text-xs text-steel">Sede principal</p> : null}
                  </td>
                  <td className="px-4 py-3 text-text-muted">{s.city}</td>
                  <td className="px-4 py-3 text-text-muted">{s.services.join(", ") || "—"}</td>
                  <td className="px-4 py-3 text-text-muted">
                    {s.active ? "Activo" : "Inactivo"}{s.warranty ? " · garantía" : ""}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Link href={`/admin/taller/${s.id}`} className="text-steel hover:underline">
                        Editar
                      </Link>
                      <DeleteServiceButton id={s.id} name={s.name} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}