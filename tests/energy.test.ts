import { describe, expect, it } from "vitest";
import { calcSavings, DEFAULT_ENERGY } from "@/lib/energy";

const S = DEFAULT_ENERGY;

describe("calcSavings", () => {
  it("calcula gasto mensual de gasolina y eléctrico a 40 km/día", () => {
    const r = calcSavings(40, S);
    expect(r.kmMonth).toBe(1200);
    // 1200 km / 130 km/galón = 9.2308 galones x $16.000
    expect(r.gasolineMonth).toBeCloseTo((1200 / 130) * 16000, 4);
    // 1200 km / 100 x 3 kWh x $900
    expect(r.electricMonth).toBeCloseTo(12 * 3 * 900, 4);
  });

  it("el ahorro anual es 12 veces el mensual", () => {
    const r = calcSavings(40, S);
    expect(r.saveYear).toBeCloseTo(r.saveMonth * 12, 6);
    expect(r.saveYear).toBeCloseTo(r.gasolineMonth * 12 - r.electricMonth * 12, 6);
  });

  it("con los valores por defecto el ahorro es positivo", () => {
    expect(calcSavings(40, S).isPositive).toBe(true);
  });

  it("0 km/día no produce ahorro ni valores negativos", () => {
    const r = calcSavings(0, S);
    expect(r.kmMonth).toBe(0);
    expect(r.gasolineMonth).toBe(0);
    expect(r.electricMonth).toBe(0);
    expect(r.saveMonth).toBe(0);
  });

  it("entradas inválidas se normalizan a 0", () => {
    for (const bad of [-10, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(calcSavings(bad, S).kmMonth).toBe(0);
    }
  });

  it("limita el entrada a 500 km/día", () => {
    expect(calcSavings(9999, S).kmMonth).toBe(500 * 30);
  });

  it("con gasolina barata el ahorro puede ser negativo", () => {
    const barato = { ...S, gasolinePriceCOP: 3000 };
    const r = calcSavings(40, barato);
    expect(r.isPositive).toBe(false);
    expect(r.saveMonth).toBeLessThan(0);
  });

  it("duplicar el precio del galón duplica el gasto de gasolina, no el ahorro", () => {
    // El costo eléctrico es constante, así que el ahorro NO se duplica.
    const base = calcSavings(40, S);
    const caro = calcSavings(40, { ...S, gasolinePriceCOP: S.gasolinePriceCOP * 2 });
    expect(caro.gasolineMonth).toBeCloseTo(base.gasolineMonth * 2, 6);
    expect(caro.electricMonth).toBeCloseTo(base.electricMonth, 6);
    expect(caro.saveMonth).toBeCloseTo(base.saveMonth + base.gasolineMonth, 6);
  });

  it("doble rendimiento en km por galón reduce a la mitad el gasto de gasolina", () => {
    const base = calcSavings(40, S);
    const eficiente = calcSavings(40, { ...S, kmPerGallon: S.kmPerGallon * 2 });
    expect(eficiente.gasolineMonth).toBeCloseTo(base.gasolineMonth / 2, 6);
    expect(eficiente.electricMonth).toBeCloseTo(base.electricMonth, 6);
  });
});