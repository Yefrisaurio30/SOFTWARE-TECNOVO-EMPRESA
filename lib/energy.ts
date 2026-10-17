import { prisma } from "@/lib/prisma";

export interface EnergySettings {
  /** Precio del galón de gasolina en COP. */
  gasolinePriceCOP: number;
  /** Kilómetros que rinde un galón en moto a gasolina (urbano Colombia). */
  kmPerGallon: number;
  /** Consumo eléctrico en kWh cada 100 km. */
  kwhPer100km: number;
  /** Precio de la energía eléctrica en COP por kWh. */
  copPerKwh: number;
}

export const DEFAULT_ENERGY: EnergySettings = {
  gasolinePriceCOP: 16000,
  kmPerGallon: 130,
  kwhPer100km: 3,
  copPerKwh: 900,
};

const KEY = "ENERGY_SETTINGS";

/** Lee los ajustes guardados en SiteSetting; si no hay, los valores por defecto. */
export async function getEnergySettings(): Promise<EnergySettings> {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key: KEY } });
    if (!row || typeof row.value !== "object" || row.value === null) return DEFAULT_ENERGY;
    const v = row.value as Partial<Record<keyof EnergySettings, unknown>>;
    const num = (x: unknown, fallback: number) =>
      typeof x === "number" && Number.isFinite(x) && x >= 0 ? x : fallback;
    return {
      gasolinePriceCOP: num(v.gasolinePriceCOP, DEFAULT_ENERGY.gasolinePriceCOP),
      kmPerGallon: num(v.kmPerGallon, DEFAULT_ENERGY.kmPerGallon) || DEFAULT_ENERGY.kmPerGallon,
      kwhPer100km: num(v.kwhPer100km, DEFAULT_ENERGY.kwhPer100km),
      copPerKwh: num(v.copPerKwh, DEFAULT_ENERGY.copPerKwh),
    };
  } catch (e) {
    console.error("No se pudieron leer los ajustes de energía, se usan los defaults", e);
    return DEFAULT_ENERGY;
  }
}

export async function saveEnergySettings(s: EnergySettings): Promise<void> {
  // Objeto literal: Prisma exige InputJsonObject (con index signature).
  const json = {
    gasolinePriceCOP: s.gasolinePriceCOP,
    kmPerGallon: s.kmPerGallon,
    kwhPer100km: s.kwhPer100km,
    copPerKwh: s.copPerKwh,
  };
  await prisma.siteSetting.upsert({
    where: { key: KEY },
    update: { value: json },
    create: { key: KEY, value: json },
  });
}

export interface SavingsResult {
  kmMonth: number;
  gasolineMonth: number;
  electricMonth: number;
  saveMonth: number;
  saveYear: number;
  /** Ahorro anual acumulado. Puede ser negativo si la moto eléctrica no conviene. */
  isPositive: boolean;
}

/**
 * Cálculo de ahorro mensual/anual frente a una moto a gasolina.
 * Función pura: sin I/O, para poder testearla.
 */
export function calcSavings(kmPerDay: number, s: EnergySettings): SavingsResult {
  const kmDay = Number.isFinite(kmPerDay) && kmPerDay > 0 ? Math.min(kmPerDay, 500) : 0;
  const kmMonth = kmDay * 30;
  const gasolineMonth = (kmMonth / s.kmPerGallon) * s.gasolinePriceCOP;
  const electricMonth = (kmMonth / 100) * s.kwhPer100km * s.copPerKwh;
  const saveMonth = gasolineMonth - electricMonth;
  return {
    kmMonth,
    gasolineMonth,
    electricMonth,
    saveMonth,
    saveYear: saveMonth * 12,
    isPositive: saveMonth > 0,
  };
}