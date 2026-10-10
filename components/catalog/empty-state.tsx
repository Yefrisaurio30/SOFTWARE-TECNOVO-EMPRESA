import Link from "next/link";
import { PackageSearch } from "lucide-react";

export function EmptyState({
  title,
  text,
  clearHref,
}: {
  title: string;
  text: string;
  clearHref: string;
}) {
  return (
    <div className="flex flex-col items-center rounded-[28px] border border-white/10 bg-surface px-6 py-20 text-center">
      <PackageSearch size={40} strokeWidth={1.25} className="text-text-faint" aria-hidden />
      <h2 className="mt-4 text-xl font-semibold text-text">{title}</h2>
      <p className="mt-1 max-w-sm text-[15px] text-text-muted">{text}</p>
      <Link
        href={clearHref}
        className="mt-6 rounded-full bg-white px-6 py-2.5 text-sm font-medium text-black transition hover:scale-[1.02]"
      >
        Limpiar filtros
      </Link>
    </div>
  );
}
