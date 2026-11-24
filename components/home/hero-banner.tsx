"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export type Slide = {
  id: string;
  image: string;
  imageMobile: string | null;
};

const BLUR =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScxNicgaGVpZ2h0PSc5Jz48cmVjdCB3aWR0aD0nMTYnIGhlaWdodD0nOScgZmlsbD0nI2Y0ZjVmNycvPjwvc3ZnPg==";

export function HeroBanner({ initialSlides }: { initialSlides: Slide[] }) {
  const [slides, setSlides] = useState<Slide[]>(initialSlides);

  const swiperRef = useRef<SwiperType | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const programmaticRef = useRef(false);
  const firstChangeRef = useRef(true);

  useEffect(() => {
    fetch("/api/hero-slides")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d) && d.length > 0) setSlides(d);
      })
      .catch(() => {});
  }, []);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const scheduleAuto = (delay: number) => {
    clearTimer();
    if (slides.length < 2) return;
    timerRef.current = setTimeout(() => {
      const swiper = swiperRef.current;
      if (!swiper) return;
      programmaticRef.current = true;
      swiper.slideNext();
      programmaticRef.current = false;
      scheduleAuto(3000);
    }, delay);
  };

  useEffect(() => {
    return () => clearTimer();
  }, []);

  const handleSlideChange = () => {
    if (firstChangeRef.current) {
      firstChangeRef.current = false;
      return;
    }
    if (programmaticRef.current) return; // avance automático: ya programado
    // interacción manual: esperar 10s antes de reanudar el automático
    clearTimer();
    timerRef.current = setTimeout(() => {
      const swiper = swiperRef.current;
      if (!swiper) return;
      programmaticRef.current = true;
      swiper.slideNext();
      programmaticRef.current = false;
      scheduleAuto(3000);
    }, 10000);
  };

  if (slides.length === 0) return null;

  return (
    <section className="relative w-full">
      <Swiper
        modules={[Navigation, Pagination]}
        loop
        navigation
        pagination={{ clickable: true }}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
          firstChangeRef.current = true;
          scheduleAuto(3000);
        }}
        onSlideChange={handleSlideChange}
        className="hero-swiper w-full"
      >
        {slides.map((s, i) => (
          <SwiperSlide key={s.id}>
            <div className="relative w-full aspect-[16/9]">
              <Image
                src={s.image}
                alt="Banner TECNOVO"
                fill
                priority={i === 0}
                loading={i === 0 ? "eager" : "lazy"}
                quality={70}
                sizes="100vw"
                placeholder="blur"
                blurDataURL={BLUR}
                className="h-full w-full object-contain"
              />
              <Link
                href="/motos-electricas"
                className="absolute bottom-6 left-6 z-10 hidden items-center gap-2 rounded-full bg-[#29F506] px-8 py-4 text-lg font-semibold tracking-wide text-white uppercase shadow-xl transition hover:scale-[1.03] active:scale-[0.98] md:inline-flex md:bottom-10 md:left-10 md:px-10 md:py-5 md:text-xl"
              >
                Catálogo
              </Link>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      {/* En móvil el botón no tapa la imagen: queda entre el carrusel y
          "Por qué TECNOVO". En escritorio sigue sobre el banner. */}
      <div className="px-4 pt-4 md:hidden">
        <Link
          href="/motos-electricas"
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[#29F506] px-8 py-4 text-lg font-semibold tracking-wide text-white uppercase shadow-xl transition active:scale-[0.98]"
        >
          Catálogo
        </Link>
      </div>
      <style jsx global>{`
        .hero-swiper .swiper-button-next,
        .hero-swiper .swiper-button-prev {
          color: #28d8a7;
        }
        .hero-swiper .swiper-pagination-bullet-active {
          background: #28d8a7;
        }
      `}</style>
    </section>
  );
}
