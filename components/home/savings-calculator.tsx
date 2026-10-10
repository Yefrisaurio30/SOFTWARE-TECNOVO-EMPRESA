"use client";

import { useMemo, useState } from "react";
import { formatCOP } from "@/lib/money";
import { Container, SectionHeading } from "@/components/ui/section";

const inputCls =
  "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[15px] text-text outline-none placeholder:text-text-faint focus:border-steel/60";
const labelCls = "mb-1 block text-xs font-medium tracking-wide text-text-muted uppercase";

/**
 * Supuestos editables y visibles:
 * - Moto a gasolina: 130 km por galón (promedio urbano Colombia).
 * - Eléctrica: 3 kWh cada 100 km, energía a $900/kWh.
 */
export function SavingsCalculator() {
  const [kmDay, setKmDay] = useState(40);
  const [gallonPrice, setGallonPrice] = useState(16000);

  const result = useMemo(() => {
    const kmMonth = Math.max(0, kmDay) * 30;
    const gasMonth = (kmMonth / 130) * Math.max(0, gallonPrice);
    const elecMonth = (kmMonth / 100) * 3 * 900;
    return { gasMonth, elecMonth, saveMonth: gasMonth - elecMonth, saveYear: (gasMonth - elecMonth) * 12 };
  }, [kmDay, gallonPrice]);

  return (
    <section aria-label="Calculadora de ahorro" className="bg-black py-24 text-text md:py-32">
      <Container>
        <div className="grid items-start gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow="Calculadora"
              title="¿Cuánto te ahorras?"
              description="Mueve los números y mira la diferencia frente a una moto a gasolina."
            />
            <div className="mt-8 grid max-w-md gap-5">
              <div>
                <label htmlFor="calc-km" className={labelCls}>Km que recorres al día</label>
                <input id="calc-km" type="number" min={0} max={500} value={kmDay} onChange={(e) => setKmDay(Number(e.target.value))} className={inputCls} />
              </div>
              <div>
                <label htmlFor="calc-gas" className={labelCls}>Precio del galón (COP)</label>
                <input id="calc-gas" type="number" min={0} step={100} value={gallonPrice} onChange={(e) => setGallonPrice(Number(e.target.value))} className={inputCls} />
              </div>
              <p className="text-xs text-text-faint">
                Supuestos: gasolina 130 km/galón · eléctrica 3 kWh/100 km a $900/kWh. Sin contar aceite ni mantenimiento.
              </p>
            </div>
          </div>
          <div className="grid gap-4" role="status" aria-live="polite">
            <div className="rounded-[24px] border border-white/10 bg-surface p-6">
              <p className="text-sm text-text-muted">Gasto mensual en gasolina</p>
              <p className="mt-1 text-3xl font-semibold tabular-nums">{formatCOP(Math.round(result.gasMonth))}</p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-surface p-6">
              <p className="text-sm text-text-muted">Costo mensual en eléctrico</p>
              <p className="mt-1 text-3xl font-semibold tabular-nums">{formatCOP(Math.round(result.elecMonth))}</p>
            </div>
            <div className="rounded-[24px] border border-steel/40 bg-surface p-6">
              <p className="text-sm text-steel">Ahorro estimado</p>
              <p className="mt-1 text-4xl font-semibold tabular-nums">{formatCOP(Math.round(result.saveMonth))} <span className="text-lg text-text-muted">/mes</span></p>
              <p className="mt-1 text-lg tabular-nums text-text-muted">{formatCOP(Math.round(result.saveYear))} al año</p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
