export interface FilterValues {
  q: string;
  brand: string;
  minPrice: string;
  maxPrice: string;
  order: string;
  year: string;
  maxKm: string;
}

const inputCls =
  "w-full rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-text outline-none placeholder:text-text-faint focus:border-steel/60";
const labelCls = "mb-1 block text-xs font-medium tracking-wide text-text-muted uppercase";

export function Filters({
  values,
  clearHref,
}: {
  values: FilterValues;
  clearHref: string;
}) {
  return (
    <form
      method="get"
      role="search"
      aria-label="Buscar productos"
      className="rounded-[28px] border border-white/10 bg-surface p-5 md:p-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="f-q" className={labelCls}>
            Buscar
          </label>
          <input
            id="f-q"
            name="q"
            type="search"
            defaultValue={values.q}
            placeholder="Nombre, marca…"
            className={inputCls}
          />
        </div>
        <button
          type="submit"
          className="rounded-full bg-steel px-6 py-2.5 text-sm font-semibold text-black transition hover:scale-[1.02]"
        >
          Buscar
        </button>
        <a href={clearHref} className="text-sm text-text-muted hover:text-text">
          Limpiar
        </a>
      </div>
    </form>
  );
}

export function emptyFilterValues(): FilterValues {
  return { q: "", brand: "", minPrice: "", maxPrice: "", order: "", year: "", maxKm: "" };
}
