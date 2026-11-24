import type { Metadata } from "next";
import { getFeaturedProducts, getProductsByType, getWarrantyYears } from "@/lib/products";
import { getWhatsAppNumber } from "@/lib/site-settings";
import { getEnergySettings } from "@/lib/energy";
import { prisma } from "@/lib/prisma";
import { HeroBanner } from "@/components/home/hero-banner";
import { WhyTecnovo } from "@/components/home/why-tecnovo";
import { ModelGrid } from "@/components/home/model-grid";
import { SpecsSticky } from "@/components/home/specs-sticky";
import { Locations } from "@/components/home/locations";
import { SavingsCalculator } from "@/components/home/savings-calculator";
import { TestRide } from "@/components/home/test-ride";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "TECNOVO — Motos eléctricas, Motos de segunda y repuestos",
  description:
    "Motos eléctricas nuevas, motos de segunda mano, repuestos y accesorios con taller y garantía en Colombia.",
};

export default async function Home() {
  const [gridModels, stickyModels, whatsapp, energy, warrantyYears, slides] =
    await Promise.all([
      getFeaturedProducts(6),
      getProductsByType("MOTO_NUEVA", 5),
      getWhatsAppNumber(),
      getEnergySettings(),
      getWarrantyYears(),
      prisma.heroSlide.findMany({
        where: { isActive: true },
        orderBy: { order: "asc" },
      }),
    ]);

  return (
    <main>
      <HeroBanner initialSlides={slides} />
      <WhyTecnovo />
      <ModelGrid products={gridModels} />
      {stickyModels.length > 0 ? <SpecsSticky products={stickyModels} /> : null}
      <SavingsCalculator settings={energy} warrantyYears={warrantyYears} />
      <Locations />
      <TestRide number={whatsapp} />
    </main>
  );
}
