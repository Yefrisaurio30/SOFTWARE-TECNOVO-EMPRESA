import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ModerationCard } from "@/components/admin/moderation-card";
import { formatCOP } from "@/lib/money";
import { getSpecs, type Specs } from "@/lib/products";

const FILTERS = [
  { key: "PENDING", label: "Pendientes" },
  { key: "APPROVED", label: "Aprobados" },
  { key: "REJECTED", label: "Rechazados" },
] as const;

export default async function AdminAnunciosPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const { estado } = await searchParams;
  const status = (FILTERS.find((f) => f.key === estado)?.key ?? "PENDING") as
    | "PENDING"
    | "APPROVED"
    | "REJECTED";

  const listings = await prisma.product.findMany({
    where: { ownerId: { not: null }, status },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      brand: true,
      description: true,
      priceRetail: true,
      images: true,
      specs: true,
      createdAt: true,
      reviewNote: true,
      soldAt: true,
      owner: { select: { name: true, email: true } },
    },
  });

  const counts = await prisma.product.groupBy({
    by: ["status"],
    where: { ownerId: { not: null } },
    _count: true,
  });
  const countOf = (k: string) => counts.find((c) => c.status === k)?._count ?? 0;

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">
        Revisión de anuncios{" "}
        {countOf("PENDING") > 0 ? (
          <span className="ml-2 rounded-full bg-steel px-3 py-1 text-sm font-medium text-[#000] tabular-nums">
            {countOf("PENDING")}
          </span>
        ) : null}
      </h1>
      <p className="mt-2 text-sm text-text-muted">
        Anuncios publicados por particulares. Solo los aprobados aparecen en el catálogo.
      </p>

      <nav aria-label="Filtrar por estado" className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={`/admin/anuncios?estado=${f.key}`}
            className={`rounded-full px-4 py-1.5 text-sm ${
              status === f.key
                ? "bg-white text-[#000]"
                : "border border-white/10 text-text-muted hover:text-text"
            }`}
          >
            {f.label} <span className="tabular-nums">({countOf(f.key)})</span>
          </Link>
        ))}
      </nav>

      <div className="mt-6 flex flex-col gap-4">
        {listings.length === 0 ? (
          <p className="rounded-[24px] border border-white/10 bg-surface p-8 text-center text-text-muted">
            No hay anuncios en este estado.
          </p>
        ) : (
          listings.map((l) =>
            status === "PENDING" ? (
              <ModerationCard
                key={l.id}
                listing={{ ...l, owner: l.owner }}
              />
            ) : (
              <div key={l.id} className="rounded-[24px] border border-white/10 bg-surface p-5 text-sm">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-semibold">{l.name}</p>
                  <p className="tabular-nums">{formatCOP(l.priceRetail)}</p>
                </div>
                <p className="text-text-muted">
                  {l.brand} · {specValueCity(getSpecs(l))} · {l.owner?.email ?? "sin cuenta"}
                  {l.soldAt ? " · vendida" : ""}
                </p>
                {l.reviewNote ? (
                  <p className="mt-2 rounded-2xl border border-white/10 bg-white/5 p-3 text-text-muted">
                    Motivo enviado al usuario: {l.reviewNote}
                  </p>
                ) : null}
              </div>
            ),
          )
        )}
      </div>
    </div>
  );
}

function specValueCity(specs: Specs): string {
  const c = specs.ciudad;
  return c ? String(c) : "—";
}