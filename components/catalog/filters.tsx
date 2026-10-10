export type FilterVariant = "nuevas" | "usadas" | "repuestos";

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
  variant,
  brands,
  values,
  clearHref,
}: {
  variant: FilterVariant;
  brands: string[];
  values: FilterValues;
  clearHref: string;
}) {
  return (
    <form
      method="get"
      role="search"
      aria-label="Filtrar productos"
      className="rounded-[28px] border border-white/10 bg-surface p-5 md:p-6"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
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
        <div>
          <label htmlFor="f-brand" className={labelCls}>
            Marca
          </label>
          <select id="f-brand" name="brand" defaultValue={values.brand} className={inputCls}>
            <option value="">Todas</option>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="f-order" className={labelCls}>
            Orden
          </label>
          <select id="f-order" name="order" defaultValue={values.order || "relevancia"} className={inputCls}>
            <option value="relevancia">Relevancia</option>
            <option value="precio-asc">Menor precio</option>
            <option value="precio-desc">Mayor precio</option>
            <option value="recientes">Más recientes</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="f-min" className={labelCls}>
              Mín. $
            </label>
            <input
              id="f-min"
              name="minPrice"
              type="number"
              min={0}
              step={10000}
              defaultValue={values.minPrice}
              placeholder="0"
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="f-max" className={labelCls}>
              Máx. $
            </label>
            <input
              id="f-max"
              name="maxPrice"
              type="number"
              min={0}
              step={10000}
              defaultValue={values.maxPrice}
              placeholder="Sin tope"
              className={inputCls}
            />
          </div>
        </div>
        {variant === "usadas" ? (
          <>
            <div>
              <label htmlFor="f-year" className={labelCls}>
                Año
              </label>
              <input
                id="f-year"
                name="year"
                type="number"
                min={2015}
                max={2030}
                defaultValue={values.year}
                placeholder="Cualquiera"
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="f-km" className={labelCls}>
                Km máx.
              </label>
              <input
                id="f-km"
                name="maxKm"
                type="number"
                min={0}
                step={1000}
                defaultValue={values.maxKm}
                placeholder="Sin tope"
                className={inputCls}
              />
            </div>
          </>
        ) : null}
      </div>
      <div className="mt-4 flex items-center gap-4">
        <button
          type="submit"
          className="rounded-full bg-white px-6 py-2.5 text-sm font-medium text-black transition hover:scale-[1.02]"
        >
          Filtrar
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
