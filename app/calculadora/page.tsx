import type { Metadata } from "next";
import { SavingsCalculator } from "@/components/home/savings-calculator";
import { getEnergySettings } from "@/lib/energy";
import { getWarrantyYears } from "@/lib/products";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Calculadora de ahorro | TECNOVO",
  description: "Calcula cuánto ahorras al mes y al año pasando de gasolina a moto eléctrica.",
  path: "/calculadora",
});

export default async function CalculadoraPage() {
  const [settings, warrantyYears] = await Promise.all([getEnergySettings(), getWarrantyYears()]);
  return (
    <main>
      <SavingsCalculator settings={settings} warrantyYears={warrantyYears} />
    </main>
  );
}