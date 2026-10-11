import { describe, expect, it } from "vitest";
import { serializeSpecs } from "@/lib/specs";

/** El editor de ficha técnica debe guardar el mismo JSON de siempre. */
describe("serializeSpecs", () => {
  it("conserva la forma de moto nueva (todo texto)", () => {
    expect(
      serializeSpecs({
        motor: "1000 W full cobre",
        bateria: "Grafeno 60/72 V 25 Ah",
        velocidad_max: "60-70 km/h",
        autonomia: "60-75 km",
        carga_max: "250 kg",
        garantia: "5 años",
      }),
    ).toEqual({
      motor: "1000 W full cobre",
      bateria: "Grafeno 60/72 V 25 Ah",
      velocidad_max: "60-70 km/h",
      autonomia: "60-75 km",
      carga_max: "250 kg",
      garantia: "5 años",
    });
  });

  it("convierte las claves numéricas de usada a Number", () => {
    expect(
      serializeSpecs({
        anio: "2023",
        kilometraje_km: "8200",
        estado_1_10: "9",
        garantia: "3 meses de motor y batería",
      }),
    ).toEqual({
      anio: 2023,
      kilometraje_km: 8200,
      estado_1_10: 9,
      garantia: "3 meses de motor y batería",
    });
  });

  it("omite vacíos y conserva extras tal cual", () => {
    expect(
      serializeSpecs({
        referencia: "BAT-72V32-EXT",
        compatibilidad: "",
        color: "rojo",
        nota: "   ",
      }),
    ).toEqual({ referencia: "BAT-72V32-EXT", color: "rojo" });
  });

  it("omite numéricos inválidos en vez de guardar NaN", () => {
    expect(serializeSpecs({ anio: "no-numérico", garantia: "x" })).toEqual({ garantia: "x" });
  });
});
