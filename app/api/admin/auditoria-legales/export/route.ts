import { auth } from "@/lib/auth";
import { getConsents } from "@/lib/consent";

/** Exporta la trazabilidad de consentimiento para un requerimiento de la SIC. */
export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "SUPERADMIN") {
    return new Response("No autorizado", { status: 401 });
  }

  const { items, total } = await getConsents(0, 100000);

  const cell = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const iso = (d: Date | null) => (d ? d.toISOString() : "");

  const rows = [
    [
      "id",
      "nombre",
      "correo",
      "origen",
      "ip",
      "acepto_terminos",
      "terminos_at",
      "acepto_privacidad",
      "privacidad_at",
      "cuenta_registrada",
      "navegador",
      "registrado_at",
    ].join(","),
    ...items.map((c) =>
      [
        cell(c.id),
        cell(c.user?.name ?? ""),
        cell(c.email),
        cell(c.source),
        cell(c.ipAddress),
        c.termsAccepted ? "SI" : "NO",
        cell(iso(c.termsAcceptedAt)),
        c.privacyAccepted ? "SI" : "NO",
        cell(iso(c.privacyAcceptedAt)),
        c.userId ? "SI" : "NO",
        cell(c.userAgent ?? ""),
        cell(iso(c.createdAt)),
      ].join(","),
    ),
  ];

  const stamp = new Date().toISOString().slice(0, 10);
  return new Response(rows.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="auditoria-consentimientos-${stamp}.csv"`,
      "X-Total-Registros": String(total),
    },
  });
}