"use client";

import { useMemo, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { formatCOP } from "@/lib/money";
import { Container, SectionHeading } from "@/components/ui/section";

const kwhFactor350 = 9.94 / 600;
const kwhFactor1000 = 20.7 / 600;
const tariff1 = 4243 / 9.94;
const tariff2 = 5303 / 9.94;
const gasPrice = 16000;
const kmPerGallon = 130;

const nfKwh = new Intl.NumberFormat("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function SavingsCalculator({
  warrantyYears,
}: {
  settings?: unknown;
  warrantyYears: number;
}) {
  const [kmDay, setKmDay] = useState<number>(20);
  const [strato, setStrato] = useState<1 | 2>(1);

  const tariff = strato === 1 ? tariff1 : tariff2;

  const r = useMemo(() => {
    const kmMonth = kmDay * 30;
    const kwh350 = kwhFactor350 * kmMonth;
    const kwh1000 = kwhFactor1000 * kmMonth;
    const cost350 = kwh350 * tariff;
    const cost1000 = kwh1000 * tariff;
    const gasolineMonth = (kmMonth / kmPerGallon) * gasPrice;
    const save350 = gasolineMonth - cost350;
    const save1000 = gasolineMonth - cost1000;
    const saveMonthMin = Math.min(save350, save1000);
    const saveMonthMax = Math.max(save350, save1000);
    return {
      kmMonth,
      kwh350,
      kwh1000,
      cost350,
      cost1000,
      gasolineMonth,
      saveMonthMin,
      saveMonthMax,
      saveYearMax: saveMonthMax * 12,
    };
  }, [kmDay, tariff]);

  
  const pct = ((kmDay - 5) / (100 - 5)) * 100;

  return (
    <section aria-label="Calculadora de ahorro" className="bg-white py-24 text-text md:py-32">
      <Container>
        <div className="grid items-start gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow="CALCULADORA"
              title="¿Cuánto te ahorras?"
              description="Simula tu consumo eléctrico y compara frente a una moto a gasolina."
            />
            <div className="mt-8 grid max-w-md gap-6">
              <div>
                <div className="mb-2 flex items-end justify-between">
                  <label className="text-xs font-medium tracking-wide text-text-muted uppercase">
                    Kilómetros que recorre diariamente
                  </label>
                  <span className="text-2xl font-semibold tabular-nums">{kmDay} km</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={100}
                  step={1}
                  value={kmDay}
                  onChange={(e) => setKmDay(Number(e.target.value))}
                  className="w-full accent-[#29F506] [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#29F506] [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-[#29F506]"
                  style={{
                    background: `linear-gradient(to right, #29F506 0%, #29F506 ${pct}%, #e5e7eb ${pct}%, #e5e7eb 100%)`,
                  }}
                />
                <div className="mt-1 flex justify-between text-xs text-text-faint">
                  <span>5 km</span>
                  <span>100 km</span>
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-medium tracking-wide text-text-muted uppercase">
                  Estrato residencial
                </p>
                <div className="inline-flex rounded-full border border-white/10 bg-surface p-1">
                  {([1, 2] as const).map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setStrato(n)}
                      className={`relative z-10 rounded-full px-4 py-2 text-sm font-medium transition ${
                        strato === n ? "bg-[#29F506] text-black" : "bg-transparent text-black"
                      }`}
                    >
                      Estrato {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4" role="status" aria-live="polite">
            <p className="text-sm text-text-muted">
              Gasto mensual estimado ({r.kmMonth} km/mes)
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[24px] border border-white/10 bg-surface p-6">
                <p className="text-sm text-text-muted">Moto 350 W</p>
                <p className="mt-2 text-xs text-text-faint">{nfKwh.format(r.kwh350)} kWh/mes</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums text-[#00E640]">
                  {formatCOP(Math.round(r.cost350))}
                </p>
                <p className="mt-1 text-xs text-text-faint">Al mes</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-surface p-6">
                <p className="text-sm text-text-muted">Moto 1.000 W</p>
                <p className="mt-2 text-xs text-text-faint">{nfKwh.format(r.kwh1000)} kWh/mes</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums text-[#00E640]">
                  {formatCOP(Math.round(r.cost1000))}
                </p>
                <p className="mt-1 text-xs text-text-faint">Al mes</p>
              </div>
            </div>

            <div className="rounded-[24px] border border-[#00E640]/40 bg-surface p-6">
              <p className="text-sm text-text-muted">
                Gasto mensual en gasolina: {formatCOP(Math.round(r.gasolineMonth))}
              </p>
              <p className="mt-2 text-sm text-text-muted">Rango de ahorro mensual</p>
              <p className="mt-1 text-4xl font-semibold tabular-nums">
                {formatCOP(Math.round(r.saveMonthMin))} – {formatCOP(Math.round(r.saveMonthMax))}
                <span className="text-lg text-text-muted"> /mes</span>
              </p>
              <p className="mt-1 text-lg tabular-nums text-text-muted">
                {formatCOP(Math.round(r.saveYearMax))} al año (máximo estimado)
              </p>
              <p className="mt-3 flex items-center gap-2 text-sm text-text-muted">
                <ShieldCheck size={16} className="shrink-0 text-[#00E640]" aria-hidden />
                Garantía de {warrantyYears} años en todas las motos TECNOVO.
              </p>
              <p className="mt-2 text-xs text-text-faint">
                Supuestos: gasolina a $16.000/galón con 130 km/galón. kWh con tarifa de estrato {strato}.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
