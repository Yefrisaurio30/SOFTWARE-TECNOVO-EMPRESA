import type { Specs } from "@/lib/products";
import { formatCOP } from "@/lib/money";

/**
 * Specs internas de cálculo (comisión del marketplace). Solo las ve el
 * SUPERADMIN: al público jamás — ni en la ficha del detalle ni en tarjetas.
 */
export const INTERNAL_SPEC_KEYS = [
  "comision_pct",
  "comision_cop",
  "ganancia_vendedor",
];

export function isInternalSpec(key: string): boolean {
  return INTERNAL_SPEC_KEYS.includes(key);
}

/** Copia de specs sin las claves internas, para render público. */
export function publicSpecs(specs: Specs): Specs {
  const out: Specs = {};
  for (const [k, v] of Object.entries(specs)) {
    if (!isInternalSpec(k)) out[k] = v;
  }
  return out;
}

const LABELS: Record<string, string> = {
  autonomia: "Autonomía",
  autonomia_km: "Autonomía",
  potencia: "Potencia",
  potencia_w: "Potencia",
  motor: "Motor",
  velocidad_max: "Velocidad máx.",
  velocidad_max_kmh: "Velocidad máx.",
  bateria: "Batería",
  tiempo_carga_h: "Carga",
  carga_max: "Carga máxima",
  anio: "Año",
  kilometraje_km: "Kilometraje",
  estado_1_10: "Estado",
  garantia: "Garantía",
  referencia: "Referencia",
  compatibilidad: "Compatible con",
  // Internas (solo admin):
  comision_pct: "Comisión",
  comision_cop: "Comisión (COP)",
  ganancia_vendedor: "Ganancia del vendedor",
};

const UNITS: Record<string, string> = {
  autonomia_km: " km",
  potencia_w: " W",
  velocidad_max_kmh: " km/h",
  tiempo_carga_h: " h",
  kilometraje_km: " km",
  estado_1_10: "/10",
  comision_pct: " %",
};

export function specLabel(key: string): string {
  return LABELS[key] ?? key;
}

export function specValue(key: string, value: string | number): string {
  if (typeof value === "number") {
    if (key === "comision_cop" || key === "ganancia_vendedor") return formatCOP(value);
    if (key === "anio") return String(value);
    const formatted = new Intl.NumberFormat("es-CO").format(value);
    return `${formatted}${UNITS[key] ?? ""}`;
  }
  return value;
}

/** Primeras N specs para tarjetas compactas. Nunca incluye las internas. */
export function topSpecs(specs: Specs, n = 2): Array<[string, string]> {
  return Object.entries(publicSpecs(specs))
    .slice(0, n)
    .map(([k, v]) => [specLabel(k), specValue(k, v)]);
}

/**
 * Todas las specs para la tabla de detalle. Las internas (comisión) solo
 * entran si el llamador es el panel del admin.
 */
export function allSpecs(specs: Specs, includeInternal = false): Array<[string, string]> {
  const source = includeInternal ? specs : publicSpecs(specs);
  return Object.entries(source).map(([k, v]) => [specLabel(k), specValue(k, v)]);
}

/** Claves que en la BD son números (el resto son texto). */
export const NUMERIC_SPEC_KEYS = ["anio", "kilometraje_km", "estado_1_10"];

/**
 * Del formulario (todo string) al JSON de la BD: recorta, omite vacíos
 * y convierte las claves numéricas a Number. Misma forma que el seed.
 */
export function serializeSpecs(values: Record<string, string>): Specs {
  const out: Specs = {};
  for (const [rawKey, rawValue] of Object.entries(values)) {
    const key = rawKey.trim();
    const value = (rawValue ?? "").trim();
    if (!key || !value) continue;
    if (NUMERIC_SPEC_KEYS.includes(key)) {
      const n = Number(value);
      if (Number.isNaN(n)) continue;
      out[key] = n;
    } else {
      out[key] = value;
    }
  }
  return out;
}
