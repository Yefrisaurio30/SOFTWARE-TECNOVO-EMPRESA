import type { Specs } from "@/lib/products";

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
};

const UNITS: Record<string, string> = {
  autonomia_km: " km",
  potencia_w: " W",
  velocidad_max_kmh: " km/h",
  tiempo_carga_h: " h",
  kilometraje_km: " km",
  estado_1_10: "/10",
};

export function specLabel(key: string): string {
  return LABELS[key] ?? key;
}

export function specValue(key: string, value: string | number): string {
  if (typeof value === "number") {
    const formatted = new Intl.NumberFormat("es-CO").format(value);
    return `${formatted}${UNITS[key] ?? ""}`;
  }
  return value;
}

/** Primeras N specs para tarjetas compactas. */
export function topSpecs(specs: Specs, n = 2): Array<[string, string]> {
  return Object.entries(specs)
    .slice(0, n)
    .map(([k, v]) => [specLabel(k), specValue(k, v)]);
}

/** Todas las specs para la tabla de detalle. */
export function allSpecs(specs: Specs): Array<[string, string]> {
  return Object.entries(specs).map(([k, v]) => [specLabel(k), specValue(k, v)]);
}
