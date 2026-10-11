"use client";

import { useMemo, useState } from "react";
import type { ProductType } from "@prisma/client";
import type { Specs } from "@/lib/products";
import { serializeSpecs } from "@/lib/specs";

const inputCls =
  "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-[15px] text-text outline-none placeholder:text-text-faint focus:border-steel/60";
const labelCls = "mb-1 block text-xs font-medium tracking-wide text-text-muted uppercase";

interface Field {
  key: string;
  label: string;
  kind: "text" | "number";
  placeholder?: string;
  min?: number;
  max?: number;
}

const FIELDS: Record<ProductType, Field[]> = {
  MOTO_NUEVA: [
    { key: "motor", label: "Motor", kind: "text", placeholder: "1000 W full cobre" },
    { key: "bateria", label: "Batería", kind: "text", placeholder: "Grafeno 60/72 V 25 Ah" },
    { key: "velocidad_max", label: "Velocidad máx.", kind: "text", placeholder: "60-70 km/h" },
    { key: "autonomia", label: "Autonomía", kind: "text", placeholder: "60-75 km" },
    { key: "carga_max", label: "Carga máxima", kind: "text", placeholder: "250 kg" },
    { key: "garantia", label: "Garantía", kind: "text", placeholder: "5 años" },
  ],
  MOTO_USADA: [
    { key: "anio", label: "Año", kind: "number", placeholder: "2023" },
    { key: "kilometraje_km", label: "Kilometraje (km)", kind: "number", placeholder: "8200" },
    { key: "estado_1_10", label: "Estado (1 a 10)", kind: "number", placeholder: "9", min: 1, max: 10 },
    { key: "garantia", label: "Garantía", kind: "text", placeholder: "3 meses de motor y batería" },
  ],
  REPUESTO: [
    { key: "referencia", label: "Referencia", kind: "text", placeholder: "BAT-72V32-EXT" },
    { key: "compatibilidad", label: "Compatible con", kind: "text", placeholder: "City S1, Mini P1" },
  ],
  ACCESORIO: [
    { key: "referencia", label: "Referencia", kind: "text", placeholder: "CSC-AB-NEG" },
    { key: "compatibilidad", label: "Compatible con", kind: "text", placeholder: "Universal" },
  ],
};

/**
 * Editor de ficha técnica por tipo de producto. Al guardar produce el mismo
 * JSON de specs de siempre (mismas claves y tipos): solo cambia la forma de
 * diligenciarlo. Las claves que no son del tipo quedan en "Otras".
 */
export function SpecsEditor({ type, initial }: { type: ProductType; initial: Specs }) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(Object.entries(initial).map(([k, v]) => [k, String(v)])),
  );
  const [extraCount, setExtraCount] = useState(0);

  const fields = FIELDS[type];
  const known = useMemo(() => new Set(fields.map((f) => f.key)), [fields]);

  const set = (key: string, value: string) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const renameExtra = (oldKey: string, newKey: string) =>
    setValues((prev) => {
      if (oldKey === newKey || prev[oldKey] === undefined) return prev;
      const next = { ...prev, [newKey]: prev[oldKey] };
      delete next[oldKey];
      return next;
    });

  const removeKey = (key: string) =>
    setValues((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });

  const extras = Object.keys(values).filter((k) => !known.has(k));

  return (
    <div>
      <div className="grid gap-5 sm:grid-cols-2">
        {fields.map((f) => (
          <div key={f.key}>
            <label htmlFor={`spec-${f.key}`} className={labelCls}>
              {f.label}
            </label>
            <input
              id={`spec-${f.key}`}
              value={values[f.key] ?? ""}
              onChange={(e) => set(f.key, e.target.value)}
              placeholder={f.placeholder}
              className={inputCls}
              {...(f.kind === "number"
                ? { type: "number", min: f.min, max: f.max }
                : { type: "text" })}
            />
          </div>
        ))}
      </div>

      <p className={`${labelCls} mt-5`}>Otras especificaciones (opcional)</p>
      {extras.length === 0 ? (
        <p className="text-sm text-text-faint">Sin extras. Agrega filas si este producto necesita más datos.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {extras.map((k) => (
            <li key={k} className="grid grid-cols-[1fr_1fr_auto] gap-2">
              <input
                aria-label="Nombre del dato"
                defaultValue={k}
                key={`key-${k}`}
                onBlur={(e) => renameExtra(k, e.target.value)}
                placeholder="dato"
                className={inputCls}
              />
              <input
                aria-label={`Valor de ${k}`}
                value={values[k] ?? ""}
                onChange={(e) => set(k, e.target.value)}
                placeholder="valor"
                className={inputCls}
              />
              <button
                type="button"
                onClick={() => removeKey(k)}
                aria-label={`Quitar ${k}`}
                className="grid size-10 place-items-center self-center rounded-full border border-white/10 text-text-muted transition hover:border-white/25 hover:text-text"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
      <button
        type="button"
        onClick={() => {
          const key = `dato_${extraCount + 1}`;
          setExtraCount((n) => n + 1);
          set(key, "");
        }}
        className="mt-3 rounded-full border border-white/15 px-4 py-1.5 text-xs text-text-muted transition hover:border-white/30 hover:text-text"
      >
        + Agregar fila
      </button>

      <input type="hidden" name="specsRaw" value={JSON.stringify(serializeSpecs(values))} />
    </div>
  );
}
