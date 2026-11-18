import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { parseYoutubeId } from "@/lib/youtube";
import { formatCOP } from "@/lib/money";
import { DeleteCourseButton } from "@/components/admin/delete-course-button";

const dateFmt = new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "short", year: "numeric" });

export default async function AdminCapacitacionPage() {
  const courses = await prisma.course.findMany({ orderBy: [{ order: "asc" }, { createdAt: "desc" }] });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">Capacitación ({courses.length})</h1>
        <div className="flex flex-wrap gap-3">
          <Link href="/capacitacion" className="rounded-full border border-white/15 px-5 py-2.5 text-sm">
            Ver /capacitacion
          </Link>
          <Link href="/admin/capacitacion/nuevo" className="rounded-full bg-steel px-5 py-2.5 text-sm font-medium text-white">
            + Nuevo curso
          </Link>
        </div>
      </div>

      {courses.length === 0 ? (
        <p className="mt-6 rounded-[24px] border border-white/10 bg-surface p-8 text-center text-text-muted">
          No hay cursos todavía. Mientras tanto la página pública muestra &quot;Próximamente&quot;.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-[24px] border border-white/10">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-text-muted">
                <th className="px-4 py-3 font-medium">Curso</th>
                <th className="px-4 py-3 font-medium">Video</th>
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 font-medium">Precio</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => (
                <tr key={c.id} className="border-b border-white/5 last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium">{c.title}</p>
                    {c.modality || c.city ? (
                      <p className="text-xs text-text-faint">
                        {[c.modality, c.city].filter(Boolean).join(" · ")}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    {c.youtubeUrl ? (
                      parseYoutubeId(c.youtubeUrl) ? (
                        <span className="text-xs text-steel">YouTube OK</span>
                      ) : (
                        <span className="text-xs text-danger">URL inválida</span>
                      )
                    ) : (
                      <span className="text-xs text-text-faint">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-text-muted">
                    {c.startsAt ? dateFmt.format(c.startsAt) : "—"}
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {c.price != null && c.price > 0 ? formatCOP(c.price) : "Gratis"}
                  </td>
                  <td className="px-4 py-3 text-text-muted">{c.active ? "Visible" : "Oculto"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Link href={`/admin/capacitacion/${c.id}`} className="text-steel hover:underline">
                        Editar
                      </Link>
                      <DeleteCourseButton id={c.id} title={c.title} />
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