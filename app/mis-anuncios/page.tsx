import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getListingQuota } from "@/lib/listings";
import { purgeExpiredDrafts } from "@/lib/drafts";
import { Container, SectionHeading } from "@/components/ui/section";
import { ListingRow } from "@/components/listing/listing-row";
import { MAX_LISTINGS_PER_DAY } from "@/lib/listing-validation";

export const metadata = { title: "Mis anuncios | TECNOVO" };

const SELECT = {
  id: true,
  name: true,
  brand: true,
  priceRetail: true,
  status: true,
  reviewNote: true,
  soldAt: true,
  createdAt: true,
  images: true,
} as const;

export default async function MisAnunciosPage({
  searchParams,
}: {
  searchParams: Promise<{ enviado?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login?next=%2Fmis-anuncios");
  const { enviado } = await searchParams;

  await purgeExpiredDrafts().catch(() => 0);

  const [all, quota] = await Promise.all([
    prisma.product.findMany({
      where: { ownerId: session.user.id },
      select: SELECT,
      orderBy: { createdAt: "desc" },
    }),
    getListingQuota(session.user.id),
  ]);

  const drafts = all.filter((p) => p.status === "DRAFT");
  const pending = all.filter((p) => p.status === "PENDING");
  const approved = all.filter((p) => p.status === "APPROVED" && !p.soldAt);
  const rejected = all.filter((p) => p.status === "REJECTED");
  const sold = all.filter((p) => p.soldAt != null);

  const secciones = [
    { key: "draft", title: "Borradores", rows: drafts, empty: "No tienes publicaciones a medio hacer." },
    { key: "pending", title: "En revisión", rows: pending, empty: "No tienes anuncios esperando revisión." },
    { key: "approved", title: "Publicados", rows: approved, empty: "Todavía no tienes anuncios publicados." },
    { key: "rejected", title: "Rechazados", rows: rejected, empty: "Ningún anuncio tuyo fue rechazado." },
    { key: "sold", title: "Vendidos", rows: sold, empty: "Aún no has vendido una moto por aquí.", sold: true },
  ];

  return (
    <main className="bg-black py-10 text-text md:py-14">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="Marketplace"
            title="Mis anuncios."
            description="Revisa en qué estado está cada publicación tuya."
          />
          <div className="text-right">
            <Link
              href="/publicar"
              className="inline-flex items-center gap-2 rounded-full bg-steel px-5 py-2.5 text-sm font-medium text-[#000]"
            >
              <Plus size={15} aria-hidden /> Publicar otra
            </Link>
            <p className="mt-2 text-xs text-text-faint tabular-nums">
              {quota.publishedToday}/{MAX_LISTINGS_PER_DAY} publicaciones hoy
            </p>
          </div>
        </div>

        {enviado ? (
          <p role="status" className="mt-6 rounded-[24px] border border-steel/40 bg-surface p-5 text-sm">
            <strong>Enviado a revisión.</strong> Tu publicación debe ser autorizada por un
            administrador antes de aparecer en el catálogo.
          </p>
        ) : null}

        <div className="mt-8 flex flex-col gap-10">
          {secciones.map((s) => (
            <section key={s.key} aria-labelledby={`sec-${s.key}`}>
              <h2 id={`sec-${s.key}`} className="text-lg font-semibold">
                {s.title} <span className="text-text-faint tabular-nums">({s.rows.length})</span>
              </h2>
              <div className="mt-4 flex flex-col gap-4">
                {s.rows.length === 0 ? (
                  <p className="rounded-[24px] border border-white/10 bg-surface p-5 text-sm text-text-muted">
                    {s.empty}
                  </p>
                ) : (
                  s.rows.map((r) => <ListingRow key={r.id} row={r} sold={s.sold} />)
                )}
              </div>
            </section>
          ))}
        </div>
      </Container>
    </main>
  );
}