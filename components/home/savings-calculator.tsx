"use client";

import { useMemo, useState } from "react";
import { ShieldCheck } from "lucide-react";
import type { EnergySettings } from "@/lib/energy";
import { calcSavings } from "@/lib/energy";
import { formatCOP } from "@/lib/money";
import { Container, SectionHeading } from "@/components/ui/section";

const inputCls =
  "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[15px] text-text outline-none placeholder:text-text-faint focus:border-steel/60";
const labelCls = "mb-1 block text-xs font-medium tracking-wide text-text-muted uppercase";

const nf = new Intl.NumberFormat("es-CO");

export function SavingsCalculator({
  settings,
  warrantyYears,
}: {
  settings: EnergySettings;
  warrantyYears: number;
}) {
  const [kmDay, setKmDay] = useState<string>("40");

  const kmNumber = kmDay.trim() === "" ? 0 : Number(kmDay);
  const r = useMemo(() => calcSavings(Number.isFinite(kmNumber) ? kmNumber : 0, settings), [kmNumber, settings]);

  return (
    <section aria-label="Calculadora de ahorro" className="bg-black py-24 text-text md:py-32">
      <Container>
        <div className="grid items-start gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow="Calculadora"
              title="¿Cuánto te ahorras?"
              description="Mueve el número de kilómetros y compara contra una moto a gasolina."
            />
            <div className="mt-8 grid max-w-md gap-5">
              <div>
                <label htmlFor="calc-km" className={labelCls}>
                  Km al día
                </label>
                <input
                  id="calc-km"
                  type="number"
                   min={0}
                   max={500}
                   value={kmDay}
                   onChange={(e) => setKmDay(e.target.value)}
                   placeholder="0"
                  className={inputCls}
                />
              </div>
              <p className="text-xs leading-relaxed text-text-faint">
                Supuestos: gasolina a{" "}
                <strong className="text-text-muted">{formatCOP(settings.gasolinePriceCOP)}</strong>{" "}
                el galón con {nf.format(settings.kmPerGallon)} km/galón · eléctrica consume{" "}
                {nf.format(settings.kwhPer100km)} kWh cada 100 km a{" "}
                {formatCOP(settings.copPerKwh)}. No incluye aceite ni mantenimiento.
              </p>
            </div>
          </div>

          <div className="grid gap-4" role="status" aria-live="polite">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[24px] border border-white/10 bg-surface p-6">
                <p className="text-sm text-text-muted">Gasto mensual en gasolina</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums">
                  {formatCOP(Math.round(r.gasolineMonth))}
                </p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-surface p-6">
                <p className="text-sm text-text-muted">Costo mensual en eléctrico</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums">
                  {formatCOP(Math.round(r.electricMonth))}
                </p>
              </div>
            </div>

            <div className="rounded-[24px] border border-steel/40 bg-surface p-6">
              <p className="text-sm text-steel">
                {r.isPositive ? "Ahorro estimado" : "Costo adicional estimado"}
              </p>
              <p className="mt-1 text-4xl font-semibold tabular-nums">
                {formatCOP(Math.abs(Math.round(r.saveMonth)))}
                <span className="text-lg text-text-muted"> /mes</span>
              </p>
              <p className="mt-1 text-lg tabular-nums text-text-muted">
                {formatCOP(Math.abs(Math.round(r.saveYear)))} al año
              </p>
              <p className="mt-3 flex items-center gap-2 text-sm text-text-muted">
                <ShieldCheck size={16} className="shrink-0 text-steel" aria-hidden />
                Garantía de {warrantyYears} años en todas las motos TECNOVO.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}