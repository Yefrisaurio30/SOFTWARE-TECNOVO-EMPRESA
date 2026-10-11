"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Bike, ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "@prisma/client";
import { getSpecs } from "@/lib/products";
import { allSpecs } from "@/lib/specs";
import { Container } from "@/components/ui/section";
import { detailHref } from "@/components/product/product-card";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

export function SpecsSticky({ products }: { products: Product[] }) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const reduceMotion = useReducedMotion();

  const goTo = useCallback(
    (next: number) => {
      if (products.length === 0) return;
      const n = (next + products.length) % products.length;
      if (n === index) return;
      const forward =
        (n - index + products.length) % products.length <= products.length / 2;
      setDirection(forward ? 1 : -1);
      setIndex(n);
    },
    [index, products.length],
  );

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  if (products.length === 0) return null;
  const product = products[index];
  const stats = allSpecs(getSpecs(product)).slice(0, 3);
  const src = product.images[0];
  const single = products.length === 1;

  const slide = (dir: number) =>
    reduceMotion ? { opacity: 0 } : { opacity: 0, x: 48 * dir };

  return (
    <section aria-label="Modelos en cifras" className="bg-black py-24 text-text md:py-32">
      <Container>
        <div
          className="grid items-center gap-10 outline-none md:grid-cols-2"
          role="region"
          aria-roledescription="carrusel"
          aria-label="Cambiar de modelo"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") {
              e.preventDefault();
              next();
            } else if (e.key === "ArrowLeft") {
              e.preventDefault();
              prev();
            }
          }}
        >
          <div className="md:sticky md:top-28 md:self-start">
            <p className="text-sm font-medium tracking-wide text-steel uppercase">En cifras</p>
            <AnimatePresence mode="wait" initial={false}>
              <motion.h2
                key={product.id}
                initial={slide(direction)}
                animate={{ opacity: 1, x: 0 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -48 * direction }}
                transition={{ duration: 0.4, ease: EASE }}
                className="mt-3 font-semibold"
                style={{ fontSize: "clamp(32px, 5vw, 64px)", lineHeight: 1.05, letterSpacing: "-0.03em" }}
              >
                {product.name}
              </motion.h2>
            </AnimatePresence>

            <div className="relative mt-8 aspect-square w-full max-w-sm overflow-hidden rounded-[24px] border border-white/10 bg-white">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={src ?? product.id}
                  initial={slide(direction)}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -48 * direction }}
                  transition={{ duration: 0.4, ease: EASE }}
                  className="absolute inset-0"
                >
                  {src ? (
                    <Image
                      src={src}
                      alt={`${product.name} — foto principal`}
                      fill
                      sizes="(max-width: 768px) 100vw, 384px"
                      className="object-contain p-6"
                      loading="lazy"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center bg-[radial-gradient(ellipse_at_center,#2E3440_0%,#0A0A0B_65%)]">
                      <Bike size={96} strokeWidth={0.8} className="relative text-steel" />
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {!single ? (
                <>
                  <button
                    type="button"
                    onClick={prev}
                    aria-label="Modelo anterior"
                    className="absolute top-1/2 left-3 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-black/60 text-white backdrop-blur transition hover:scale-[1.05] hover:bg-black/80"
                  >
                    <ChevronLeft size={20} aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={next}
                    aria-label="Modelo siguiente"
                    className="absolute top-1/2 right-3 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-black/60 text-white backdrop-blur transition hover:scale-[1.05] hover:bg-black/80"
                  >
                    <ChevronRight size={20} aria-hidden />
                  </button>
                  <p
                    aria-live="polite"
                    className="absolute right-3 bottom-3 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white tabular-nums backdrop-blur"
                  >
                    {index + 1} / {products.length}
                  </p>
                </>
              ) : null}
            </div>

            {!single ? (
              <div className="mt-4 flex items-center gap-3">
                <div className="flex gap-2" role="tablist" aria-label="Elegir modelo">
                  {products.map((p, i) => (
                    <button
                      key={p.id}
                      role="tab"
                      aria-selected={i === index}
                      aria-label={`Ver ${p.name}`}
                      onClick={() => goTo(i)}
                      className={cn(
                        "h-1.5 rounded-full transition-all",
                        i === index ? "w-8 bg-steel" : "w-3 bg-white/15 hover:bg-white/30",
                      )}
                    />
                  ))}
                </div>
                <Link href={detailHref(product)} className="ml-2 text-[15px]">
                  Ver modelo <span aria-hidden>›</span>
                </Link>
              </div>
            ) : (
              <Link href={detailHref(product)} className="mt-4 inline-block text-[15px]">
                Ver modelo <span aria-hidden>›</span>
              </Link>
            )}
          </div>

          <div className="flex flex-col gap-6" aria-live="polite">
            {stats.map(([label, value], i) => (
              <motion.div
                key={`${product.id}-${label}`}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.65, delay: i * 0.1, ease: EASE }}
                whileHover={{ x: 6 }}
                className="rounded-[24px] border border-white/10 bg-surface p-8"
              >
                <p className="text-sm text-text-muted">{label}</p>
                <p className="mt-1 text-4xl font-semibold tracking-tight md:text-5xl">{value}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
