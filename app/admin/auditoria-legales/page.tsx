import Link from "next/link";
import { getConsents } from "@/lib/consent";

export const metadata = { title: "Auditoría legal | TECNOVO" };

const fmt = new Intl.DateTimeFormat("es-CO", {
  dateStyle: "short",
  timeStyle: "medium",
});

export default async function AuditoriaLegalesPage() {
  const { items, total } = await getConsents();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">
          Auditoría legal{" "}
          <span className="text-text-faint tabular-nums">({total})</span>
        </h1>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a
          href="/api/admin/auditoria-legales/export"
          className="rounded-full bg-steel px-5 py-2.5 text-sm font-medium text-white"
        >
          Exportar CSV
        </a>
      </div>
      <p className="mt-2 max-w-2xl text-sm text-text-muted">
        Evidencia de consentimiento de Términos y Condiciones y de la Política de Privacidad
        (Ley 1581 de 2012). Sirve para atender requerimientos de la SIC. No uses estos datos para
        rastrear al usuario.
      </p>

      {items.length === 0 ? (
        <p className="mt-6 rounded-[24px] border border-white/10 bg-surface p-8 text-center text-text-muted">
          Todavía no hay aceptaciones registradas.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-[24px] border border-white/10">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-text-muted">
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">Correo</th>
                <th className="px-4 py-3 font-medium">Origen</th>
                <th className="px-4 py-3 font-medium">IP</th>
                <th className="px-4 py-3 font-medium">Aceptó Términos</th>
                <th className="px-4 py-3 font-medium">Aceptó Privacidad</th>
                <th className="px-4 py-3 font-medium">Cuenta</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id} className="border-b border-white/5 last:border-0">
                  <td className="px-4 py-3">{c.user?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-text-muted">{c.email}</td>
                  <td className="px-4 py-3 text-text-muted">{c.source}</td>
                  <td className="px-4 py-3 font-mono text-xs text-text-muted">{c.ipAddress}</td>
                  <td className="px-4 py-3">
                    {c.termsAccepted ? (
                      <span className="text-steel">{fmt.format(c.termsAcceptedAt!)}</span>
                    ) : (
                      <span className="text-danger">No</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {c.privacyAccepted ? (
                      <span className="text-steel">{fmt.format(c.privacyAcceptedAt!)}</span>
                    ) : (
                      <span className="text-danger">No</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-text-muted">
                    {c.userId ? "Sí" : "No"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-6 text-sm text-text-faint">
        <Link href="/admin" className="text-steel underline">
          ← Volver al panel
        </Link>
      </p>
    </div>
  );
}