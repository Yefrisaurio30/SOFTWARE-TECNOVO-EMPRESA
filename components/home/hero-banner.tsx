"use client";

import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
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

  useEffect(() => {
    fetch("/api/hero-slides")
      .then((r) => r.json())
      .then((d) => setSlides(Array.isArray(d) ? d : []))
      .catch(() => setSlides([]));
  }, []);

  if (slides.length === 0) return null;

  return (
    <section className="relative w-full">
      <Swiper
        modules={[Autoplay, Navigation, Pagination]}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        loop
        navigation
        pagination={{ clickable: true }}
        className="hero-swiper w-full"
      >
        {slides.map((s, i) => (
          <SwiperSlide key={s.id}>
            <div className="relative w-full aspect-[16/6] sm:aspect-[16/5]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={s.image}
                alt="Banner TECNOVO"
                className="h-full w-full object-cover"
                loading={i === 0 ? "eager" : "lazy"}
              />
              null
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