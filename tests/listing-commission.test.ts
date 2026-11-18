import { describe, expect, it } from "vitest";
import {
  commissionBreakdown,
  commissionRate,
  commissionSpecs,
  rateLabel,
  tierLabel,
} from "@/lib/listing-commission";

describe("commissionRate", () => {
  it("aplica 15% a precios menores a $100.000", () => {
    expect(commissionRate(50_000)).toBe(0.15);
    expect(commissionRate(99_999)).toBe(0.15);
  });

  it("aplica 10% de $100.000 a $1.000.000 inclusive", () => {
    expect(commissionRate(100_000)).toBe(0.1);
    expect(commissionRate(500_000)).toBe(0.1);
    expect(commissionRate(1_000_000)).toBe(0.1);
  });

  it("aplica 8% a precios mayores de $1.000.000", () => {
    expect(commissionRate(1_000_001)).toBe(0.08);
    expect(commissionRate(15_000_000)).toBe(0.08);
  });
});

describe("commissionBreakdown", () => {
  it("calcula comisión y ganancia del vendedor", () => {
    expect(commissionBreakdown(99_999)).toEqual({
      rate: 0.15,
      commission: 15000,
      netEarn: 84_999,
    });
    expect(commissionBreakdown(500_000)).toEqual({
      rate: 0.1,
      commission: 50_000,
      netEarn: 450_000,
    });
    expect(commissionBreakdown(2_500_000)).toEqual({
      rate: 0.08,
      commission: 200_000,
      netEarn: 2_300_000,
    });
  });

  it("no se pasa con precios decimales (redondeo a entero)", () => {
    const b = commissionBreakdown(1_234_567);
    expect(Number.isInteger(b.commission)).toBe(true);
    expect(Number.isInteger(b.netEarn)).toBe(true);
    expect(b.commission + b.netEarn).toBe(1_234_567);
  });
});

describe("commissionSpecs", () => {
  it("guarda porcentaje, comisión y ganancia para el anuncio", () => {
    expect(commissionSpecs(800_000)).toEqual({
      comision_pct: 10,
      comision_cop: 80_000,
      ganancia_vendedor: 720_000,
    });
  });
});

describe("etiquetas", () => {
  it("nombra el tramo correcto", () => {
    expect(tierLabel(50_000)).toBe("Menos de $100.000");
    expect(tierLabel(100_000)).toBe("De $100.000 a $1.000.000");
    expect(tierLabel(2_000_000)).toBe("Más de $1.000.000");
  });

  it("formatea el porcentaje sin decimales", () => {
    expect(rateLabel(0.15)).toBe("15 %");
    expect(rateLabel(0.1)).toBe("10 %");
    expect(rateLabel(0.08)).toBe("8 %");
  });
});
