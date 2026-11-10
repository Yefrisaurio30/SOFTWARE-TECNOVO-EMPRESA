"use client";

import { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

type Slide = {
  id: string;
  image: string;
  imageMobile: string | null;
};

export function HeroBanner() {
  const [slides, setSlides] = useState<Slide[]>([]);

  const swiperRef = useRef<SwiperType | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const programmaticRef = useRef(false);
  const firstChangeRef = useRef(true);

  useEffect(() => {
    fetch("/api/hero-slides")
      .then((r) => r.json())
      .then((d) => setSlides(Array.isArray(d) ? d : []))
      .catch(() => setSlides([]));
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
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={s.image}
                alt="Banner TECNOVO"
                className="h-full w-full object-contain"
                loading={i === 0 ? "eager" : "lazy"}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
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
