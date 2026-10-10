import type { Metadata } from "next";
import { getFeaturedProducts, getProductsByType } from "@/lib/products";
import { Hero } from "@/components/home/hero";
import { WhyTecnovo } from "@/components/home/why-tecnovo";
import { ModelGrid } from "@/components/home/model-grid";
import { SpecsSticky } from "@/components/home/specs-sticky";
import { Locations } from "@/components/home/locations";
import { TestRide } from "@/components/home/test-ride";
import { Reviews } from "@/components/home/reviews";

export const metadata: Metadata = {
  title: "TECNOVO — Motos eléctricas, segunda mano y repuestos",
  description:
    "Motos eléctricas nuevas, motos de segunda mano, repuestos y accesorios con taller y garantía en Colombia.",
};

export default async function Home() {
  const [heroModels, gridModels, nuevas] = await Promise.all([
    getProductsByType("MOTO_NUEVA", 3),
    getFeaturedProducts(6),
    getProductsByType("MOTO_NUEVA", 1),
  ]);
  const specsModel = nuevas[0] ?? heroModels[0] ?? gridModels[0];

  return (
    <main>
      <Hero products={heroModels} />
      <WhyTecnovo />
      <ModelGrid products={gridModels} />
      {specsModel ? <SpecsSticky product={specsModel} /> : null}
      <Locations />
      <TestRide />
      <Reviews />
    </main>
  );
}
