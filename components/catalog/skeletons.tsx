export function CatalogSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-label="Cargando productos">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse overflow-hidden rounded-[28px] border border-white/10 bg-surface"
        >
          <div className="aspect-[4/3] w-full bg-surface-2" />
          <div className="space-y-3 p-5">
            <div className="h-3 w-1/3 rounded-full bg-surface-2" />
            <div className="h-5 w-3/4 rounded-full bg-surface-2" />
            <div className="h-6 w-1/2 rounded-full bg-surface-2" />
          </div>
        </div>
      ))}
    </div>
  );
}
