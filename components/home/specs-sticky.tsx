"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Bike } from "lucide-react";
import type { Product } from "@prisma/client";
import { getSpecs } from "@/lib/products";
import { specValue } from "@/lib/specs";
import { Container } from "@/components/ui/section";

function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const duration = 1200;
    let frame: number;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(eased * to));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, to]);

  return (
    <span ref={ref} className="tabular-nums">
      {new Intl.NumberFormat("es-CO").format(value)}
      {suffix}
    </span>
  );
}

export function SpecsSticky({ product }: { product: Product }) {
  const specs = getSpecs(product);
  const stats: Array<[string, number, string]> = [
    ["Autonomía", Number(specs.autonomia_km ?? 0), " km"],
    ["Velocidad máx.", Number(specs.velocidad_max_kmh ?? 0), " km/h"],
    ["Potencia", Number(specs.potencia_w ?? 0), " W"],
  ];

  return (
    <section aria-label={`Cifras de ${product.name}`} className="bg-black py-24 text-text md:py-32">
      <Container>
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div className="md:sticky md:top-28 md:self-start">
            <p className="text-sm font-medium tracking-wide text-steel uppercase">En cifras</p>
            <h2
              className="mt-3 font-semibold"
              style={{ fontSize: "clamp(32px, 5vw, 64px)", lineHeight: 1.05, letterSpacing: "-0.03em" }}
            >
              {product.name}
            </h2>
            <div
              className="relative mt-8 grid aspect-square w-full max-w-sm place-items-center overflow-hidden rounded-[24px] border border-white/10 bg-[radial-gradient(ellipse_at_center,#2E3440_0%,#0A0A0B_65%)]"
              aria-hidden
            >
              <div
                className="absolute rounded-full border border-steel/40"
                style={{ width: "65%", aspectRatio: "1" }}
              />
              <Bike size={96} strokeWidth={0.8} className="relative text-steel" />
            </div>
          </div>
          <div className="flex flex-col gap-6">
            {stats.map(([label, value, suffix], i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-[24px] border border-white/10 bg-surface p-8"
              >
                <p className="text-sm text-text-muted">{label}</p>
                <p className="mt-1 text-5xl font-semibold tracking-tight">
                  <Counter to={value} suffix={suffix} />
                </p>
                <p className="mt-2 text-xs text-text-faint">
                  Ref: {specValue("bateria", specs.bateria ?? "—")} · Carga en{" "}
                  {specValue("tiempo_carga_h", specs.tiempo_carga_h ?? "—")}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
