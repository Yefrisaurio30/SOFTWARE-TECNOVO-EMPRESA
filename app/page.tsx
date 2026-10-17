import type { Metadata } from "next";
import { getFeaturedProducts, getProductsByType, getWarrantyYears } from "@/lib/products";
import { getWhatsAppNumber } from "@/lib/site-settings";
import { getEnergySettings } from "@/lib/energy";
import { Hero } from "@/components/home/hero";
import { WhyTecnovo } from "@/components/home/why-tecnovo";
import { ModelGrid } from "@/components/home/model-grid";
import { SpecsSticky } from "@/components/home/specs-sticky";
import { Locations } from "@/components/home/locations";
import { SavingsCalculator } from "@/components/home/savings-calculator";
import { TestRide } from "@/components/home/test-ride";
import { Reviews } from "@/components/home/reviews";

export const metadata: Metadata = {
  title: "TECNOVO — Motos eléctricas, segunda mano y repuestos",
  description:
    "Motos eléctricas nuevas, motos de segunda mano, repuestos y accesorios con taller y garantía en Colombia.",
};

export default async function Home() {
  const [heroModels, gridModels, stickyModels, whatsapp, energy, warrantyYears] =
    await Promise.all([
      getProductsByType("MOTO_NUEVA", 3),
      getFeaturedProducts(6),
      getProductsByType("MOTO_NUEVA", 5),
      getWhatsAppNumber(),
      getEnergySettings(),
      getWarrantyYears(),
    ]);

  return (
    <main>
      <Hero products={heroModels} whatsapp={whatsapp} />
      <WhyTecnovo />
      <ModelGrid products={gridModels} />
      {stickyModels.length > 0 ? <SpecsSticky products={stickyModels} /> : null}
      <SavingsCalculator settings={energy} warrantyYears={warrantyYears} />
      <Locations />
      <TestRide number={whatsapp} />
      <Reviews />
    </main>
  );
}
