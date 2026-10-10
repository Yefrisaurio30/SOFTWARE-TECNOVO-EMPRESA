"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Bike } from "lucide-react";
import type { Product } from "@prisma/client";
import { getSpecs } from "@/lib/products";
import { specValue } from "@/lib/specs";
import { waTestRideLink } from "@/lib/whatsapp";
import { detailHref } from "@/components/product/product-card";
import { Price } from "@/components/product/price";

const EASE = [0.22, 1, 0.36, 1] as const;

export function Hero({ products, whatsapp }: { products: Product[]; whatsapp: string }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = useCallback(
    (dir: 1 | -1) => setIndex((i) => (i + dir + products.length) % products.length),
    [products.length],
  );

  useEffect(() => {
    if (paused || products.length < 2) return;
    timer.current = setInterval(() => go(1), 6000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [paused, go, products.length]);

  if (products.length === 0) return null;
  const p = products[index];
  const specs = getSpecs(p);

  return (
    <section
      aria-label="Modelos destacados"
      className="relative overflow-hidden bg-black pt-10 pb-20 text-text md:pt-16 md:pb-28"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="mx-auto w-full max-w-[1200px] px-6 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <p className="text-sm font-medium tracking-wide text-steel uppercase">
              {p.brand} · Eléctrica
            </p>
            <h1
              className="mx-auto mt-3 max-w-4xl font-semibold"
              style={{
                fontSize: "clamp(44px, 8vw, 104px)",
                lineHeight: 1.05,
                letterSpacing: "-0.03em",
              }}
            >
              {p.name}
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-[17px]/relaxed text-text-muted">
              {specValue("autonomia_km", specs.autonomia_km ?? "")} de autonomía ·{" "}
              {specValue("velocidad_max_kmh", specs.velocidad_max_kmh ?? "")} de velocidad máx.
            </p>
            <div className="mt-6">
              <Price value={p.priceRetail} className="text-2xl font-semibold tabular-nums" />
            </div>
            <div className="mt-6 flex items-center justify-center gap-5">
              <Link
                href={detailHref(p)}
                className="rounded-full bg-white px-7 py-3 text-[15px] font-medium text-black transition hover:scale-[1.02]"
              >
                Ver modelo
              </Link>
              <a
                href={waTestRideLink(whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[15px] text-text"
              >
                Agendar prueba <span aria-hidden>›</span>
              </a>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Moto protagonista: halo + foco gris suave */}
        <div
          className="relative mx-auto mt-12 grid aspect-[16/9] w-full max-w-3xl place-items-center overflow-hidden rounded-[24px] border border-white/10 bg-[radial-gradient(ellipse_at_center,#2E3440_0%,#0A0A0B_65%)]"
          aria-hidden
        >
          <div
            className="absolute rounded-full border border-steel/40"
            style={{ width: "62%", aspectRatio: "1" }}
          />
          <Bike size={120} strokeWidth={0.8} className="relative text-steel" />
        </div>

        {products.length > 1 ? (
          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              onClick={() => go(-1)}
              aria-label="Modelo anterior"
              className="grid size-9 place-items-center rounded-full border border-white/10 text-text-muted transition hover:border-white/25 hover:text-text"
            >
              ‹
            </button>
            <div className="flex gap-2" role="tablist" aria-label="Elegir modelo">
              {products.map((item, i) => (
                <button
                  key={item.id}
                  role="tab"
                  aria-selected={i === index}
                  aria-label={`Ver ${item.name}`}
                  onClick={() => setIndex(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === index ? "w-8 bg-steel" : "w-3 bg-white/15 hover:bg-white/30"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={() => go(1)}
              aria-label="Modelo siguiente"
              className="grid size-9 place-items-center rounded-full border border-white/10 text-text-muted transition hover:border-white/25 hover:text-text"
            >
              ›
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
