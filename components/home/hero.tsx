"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Bike } from "lucide-react";
import type { Product } from "@prisma/client";
import { getSpecs } from "@/lib/products";
import { topSpecs } from "@/lib/specs";
import { waTestRideLink } from "@/lib/whatsapp";
import { detailHref } from "@/components/product/product-card";
import { Price } from "@/components/product/price";

const EASE = [0.22, 1, 0.36, 1] as const;

function HeroVisual({ product }: { product: Product }) {
  const src = product.images[0];
  return (
    <div className="relative mx-auto mt-12 w-full max-w-3xl">
      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="relative grid aspect-[16/9] w-full place-items-center overflow-hidden rounded-[24px] border border-white/10 bg-[radial-gradient(ellipse_at_center,#2E3440_0%,#0A0A0B_65%)]"
        aria-hidden
      >
        <div
          className="absolute rounded-full border border-steel/40"
          style={{ width: "62%", aspectRatio: "1" }}
        />
        <AnimatePresence mode="wait">
          <motion.div
            key={src ?? product.id}
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="absolute inset-0"
          >
            {src ? (
              <Image
                src={src}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-cover"
                priority
              />
            ) : (
              <div className="grid h-full w-full place-items-center">
                <Bike size={120} strokeWidth={0.8} className="relative text-steel" />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,.55), transparent 45%)" }}
        />
      </motion.div>
    </div>
  );
}

export function Hero({ products, whatsapp }: { products: Product[]; whatsapp: string }) {
  const [[index, direction], setIndex] = useState<[number, number]>([0, 0]);
  const [paused, setPaused] = useState(false);

  const go = useCallback(
    (dir: 1 | -1) => setIndex(([i]) => [(i + dir + products.length) % products.length, dir]),
    [products.length],
  );

  useEffect(() => {
    if (paused || products.length < 2) return;
    const timer = setInterval(() => go(1), 6000);
    return () => clearInterval(timer);
  }, [paused, go, products.length]);

  if (products.length === 0) return null;
  const p = products[index];
  const chips = topSpecs(getSpecs(p), 3);

  return (
    <section
      aria-label="Modelos destacados"
      className="relative overflow-hidden bg-black pt-10 pb-20 text-text md:pt-16 md:pb-28"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="mx-auto w-full max-w-[1200px] px-6 text-center">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={p.id}
            custom={direction}
            initial={{ opacity: 0, x: 72 * direction }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -72 * direction }}
            transition={{ duration: 0.55, ease: EASE }}
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
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              {chips.map(([k, v], i) => (
                <motion.span
                  key={`${p.id}-${k}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.08, duration: 0.45, ease: EASE }}
                  className="rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm text-text-muted"
                >
                  {k}: <span className="text-text">{v}</span>
                </motion.span>
              ))}
            </div>
            <div className="mt-6">
              <Price value={p.priceRetail} className="text-2xl font-semibold tabular-nums" />
            </div>
            <div className="mt-6 flex items-center justify-center gap-5">
              <Link
                href={detailHref(p)}
                className="rounded-full bg-white px-7 py-3 text-[15px] font-medium text-black transition hover:scale-[1.02] active:scale-[0.98]"
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

        <HeroVisual product={p} />

        {products.length > 1 ? (
          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              onClick={() => go(-1)}
              aria-label="Modelo anterior"
              className="grid size-9 place-items-center rounded-full border border-white/10 text-text-muted transition hover:border-white/25 hover:text-text active:scale-95"
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
                  onClick={() => setIndex([i, i > index ? 1 : -1])}
                  className={`h-1.5 rounded-full transition-all ${
                    i === index ? "w-8 bg-steel" : "w-3 bg-white/15 hover:bg-white/30"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={() => go(1)}
              aria-label="Modelo siguiente"
              className="grid size-9 place-items-center rounded-full border border-white/10 text-text-muted transition hover:border-white/25 hover:text-text active:scale-95"
            >
              ›
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
