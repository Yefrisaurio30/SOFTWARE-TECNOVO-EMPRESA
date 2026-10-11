"use client";

import { useCallback, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ProductType } from "@prisma/client";
import { ProductImage } from "@/components/product/product-image";
import { cn } from "@/lib/utils";

export function Gallery({
  images,
  name,
  type,
}: {
  images: string[];
  name: string;
  type: ProductType;
}) {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(0);
  const reduceMotion = useReducedMotion();

  const goTo = useCallback(
    (index: number) => {
      if (images.length <= 1) return;
      const next = (index + images.length) % images.length;
      setDirection(next === active ? 0 : next > active ? 1 : -1);
      setActive(next);
    },
    [active, images.length],
  );

  const next = useCallback(() => goTo(active + 1), [active, goTo]);
  const prev = useCallback(() => goTo(active - 1), [active, goTo]);

  if (images.length === 0) {
    return (
      <ProductImage
        images={[]}
        name={name}
        type={type}
        className="aspect-[4/3] w-full rounded-[24px] border border-white/10"
        sizes="(max-width: 768px) 100vw, 50vw"
      />
    );
  }

  const single = images.length === 1;

  return (
    <div>
      <div
        role="region"
        aria-roledescription="carrusel"
        aria-label={`Fotos de ${name}`}
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
        className="relative aspect-[4/3] overflow-hidden rounded-[24px] border border-white/10 bg-white outline-none focus-visible:border-steel"
      >
        <AnimatePresence mode="popLayout" initial={false} custom={direction}>
          <motion.img
            key={images[active]}
            src={images[active]}
            alt={`${name} — foto ${active + 1} de ${images.length}`}
            custom={direction}
            initial={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, x: direction >= 0 ? 64 : -64 }
            }
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: direction >= 0 ? -64 : 64 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            drag={single || reduceMotion ? false : "x"}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.6}
            onDragEnd={(_, info) => {
              if (info.offset.x < -60) next();
              else if (info.offset.x > 60) prev();
            }}
            className="absolute inset-0 h-full w-full cursor-grab object-contain p-4 active:cursor-grabbing md:p-6"
            draggable={false}
          />
        </AnimatePresence>

        {!single ? (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Foto anterior"
              className="absolute top-1/2 left-3 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-black/60 text-white backdrop-blur transition hover:scale-[1.05] hover:bg-black/80"
            >
              <ChevronLeft size={20} aria-hidden />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Foto siguiente"
              className="absolute top-1/2 right-3 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-black/60 text-white backdrop-blur transition hover:scale-[1.05] hover:bg-black/80"
            >
              <ChevronRight size={20} aria-hidden />
            </button>
            <p
              aria-live="polite"
              className="absolute right-3 bottom-3 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white tabular-nums backdrop-blur"
            >
              {active + 1} / {images.length}
            </p>
          </>
        ) : null}
      </div>

      {!single ? (
        <>
          <div
            className="mt-3 flex justify-center gap-2 md:hidden"
            aria-hidden
          >
            {images.map((src, i) => (
              <span
                key={src}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-200",
                  i === active ? "w-6 bg-white" : "w-1.5 bg-white/30",
                )}
              />
            ))}
          </div>
          <div
            className="mt-3 grid grid-cols-4 gap-3"
            role="tablist"
            aria-label="Fotos del producto"
          >
            {images.map((src, i) => (
              <button
                key={src}
                type="button"
                role="tab"
                aria-selected={i === active}
                aria-label={`Ver foto ${i + 1} de ${images.length}`}
                onClick={() => goTo(i)}
                className={cn(
                  "overflow-hidden rounded-2xl border bg-white transition duration-200",
                  i === active
                    ? "border-steel"
                    : "border-white/10 opacity-70 hover:scale-[1.03] hover:opacity-100",
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt=""
                  className="aspect-square w-full object-contain p-1"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
