"use client";

import { motion } from "framer-motion";
import { Bike } from "lucide-react";
import type { Product } from "@prisma/client";
import { getSpecs } from "@/lib/products";
import { allSpecs } from "@/lib/specs";
import { Container } from "@/components/ui/section";

export function SpecsSticky({ product }: { product: Product }) {
  const stats = allSpecs(getSpecs(product)).slice(0, 3);

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
            {stats.map(([label, value], i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.65, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
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
