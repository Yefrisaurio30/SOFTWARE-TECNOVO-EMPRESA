export function Pagination({
  page,
  pages,
  total,
  buildHref,
}: {
  page: number;
  pages: number;
  total: number;
  buildHref: (page: number) => string;
}) {
  if (pages <= 1) {
    return (
      <p className="text-sm text-text-muted" role="status">
        {total} {total === 1 ? "producto" : "productos"}
      </p>
    );
  }
  return (
    <nav aria-label="Paginación" className="flex items-center justify-between gap-4">
      <p className="text-sm text-text-muted" role="status">
        Página {page} de {pages} · {total} {total === 1 ? "producto" : "productos"}
      </p>
      <div className="flex gap-2">
        {page > 1 ? (
          <a
            href={buildHref(page - 1)}
            className="rounded-full border border-white/10 px-5 py-2 text-sm text-text transition hover:border-white/25"
          >
            ‹ Anterior
          </a>
        ) : null}
        {page < pages ? (
          <a
            href={buildHref(page + 1)}
            className="rounded-full bg-white px-5 py-2 text-sm font-medium text-black transition hover:scale-[1.02]"
          >
            Siguiente ›
          </a>
        ) : null}
      </div>
    </nav>
  );
}
