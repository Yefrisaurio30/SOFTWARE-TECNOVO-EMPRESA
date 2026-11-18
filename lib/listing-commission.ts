/**
 * Comisiones del marketplace de motos de segunda.
 *
 * Es la verdad del negocio y vive SOLO aquí: el formulario muestra el
 * cálculo en vivo y el servidor lo recalcula y guarda al crear o editar el
 * anuncio (nunca se confía en lo que manda el cliente, igual que los
 * precios de la tienda).
 *
 * Tramos:
 *   - Menos de $100.000        → 15 %
 *   - De $100.000 a $1.000.000 → 10 %
 *   - Más de $1.000.000        → 8 %
 */

import { formatCOP } from "@/lib/money";

export interface CommissionTier {
  /** Precio máximo del tramo (inclusive). null = sin tope. */
  max: number | null;
  rate: number;
  label: string;
}

export const COMMISSION_TIERS: CommissionTier[] = [
  { max: 99_999, rate: 0.15, label: "Menos de $100.000" },
  { max: 1_000_000, rate: 0.1, label: "De $100.000 a $1.000.000" },
  { max: null, rate: 0.08, label: "Más de $1.000.000" },
];

/** Porcentaje de comisión que aplica a un precio de venta. */
export function commissionRate(price: number): number {
  const p = Math.max(0, Math.floor(price));
  for (const tier of COMMISSION_TIERS) {
    if (tier.max === null || p <= tier.max) return tier.rate;
  }
  return COMMISSION_TIERS[COMMISSION_TIERS.length - 1].rate;
}

export interface CommissionBreakdown {
  /** Porcentaje aplicado (0.15 / 0.1 / 0.08). */
  rate: number;
  /** Comisión de la plataforma en COP (entero). */
  commission: number;
  /** Lo que recibe el vendedor en COP (entero). */
  netEarn: number;
}

/**
 * Desglose de un precio de venta: comisión y ganancia del vendedor.
 * El servidor usa esta misma función al guardar el anuncio.
 */
export function commissionBreakdown(price: number): CommissionBreakdown {
  const p = Math.max(0, Math.floor(price));
  const rate = commissionRate(p);
  const commission = Math.round(p * rate);
  return { rate, commission, netEarn: p - commission };
}

/** Texto de porcentaje legible: 15 %, 10 %, 8 %. */
export function rateLabel(rate: number): string {
  return `${Math.round(rate * 100)} %`;
}

/** Texto del tramo que aplica a un precio, para el formulario. */
export function tierLabel(price: number): string {
  const p = Math.max(0, Math.floor(price));
  const tier =
    COMMISSION_TIERS.find((t) => t.max !== null && p <= t.max) ??
    COMMISSION_TIERS[COMMISSION_TIERS.length - 1];
  return tier.label;
}

/** Desglose ya formateado en COP, listo para mostrar. */
export function commissionText(price: number): string {
  const b = commissionBreakdown(price);
  return `Comisión ${rateLabel(b.rate)}: ${formatCOP(b.commission)} · Te quedan: ${formatCOP(b.netEarn)}`;
}

/**
 * Claves que se guardan en `specs` del anuncio para que comisión y ganancia
 * queden calculadas por el servidor (el cliente no las manda).
 */
export function commissionSpecs(price: number): {
  comision_pct: number;
  comision_cop: number;
  ganancia_vendedor: number;
} {
  const b = commissionBreakdown(price);
  return {
    comision_pct: Math.round(b.rate * 100),
    comision_cop: b.commission,
    ganancia_vendedor: b.netEarn,
  };
}
