"use client";

import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Link from "next/link";
import Image from "next/image";

type Slide = {
  id: string;
  title: string | null;
  subtitle: string | null;
  image: string;
  imageMobile: string | null;
  ctaText: string | null;
  ctaUrl: string | null;
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
              <Image
                src={s.image}
                alt={s.title ?? "Banner TECNOVO"}
                fill
                priority={i === 0}
                loading={i === 0 ? "eager" : "lazy"}
                sizes="100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 flex flex-col items-start justify-center gap-3 px-6 md:px-16">
                {s.title ? (
                  <h2 className="text-2xl md:text-5xl font-bold text-white drop-shadow">
                    {s.title}
                  </h2>
                ) : null}
                {s.subtitle ? (
                  <p className="text-sm md:text-xl text-white/90 drop-shadow">
                    {s.subtitle}
                  </p>
                ) : null}
                {s.ctaText && s.ctaUrl ? (
                  <Link
                    href={s.ctaUrl}
                    className="mt-2 rounded-full bg-cta px-6 py-3 text-sm font-medium text-[#000] transition hover:scale-[1.02]"
                  >
                    {s.ctaText}
                  </Link>
                ) : null}
              </div>
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