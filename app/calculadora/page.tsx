import type { Metadata } from "next";
import { SavingsCalculator } from "@/components/home/savings-calculator";

export const metadata: Metadata = {
  title: "Calculadora de ahorro | TECNOVO",
  description: "Calcula cuánto ahorras al mes y al año pasando de gasolina a moto eléctrica.",
};

export default function CalculadoraPage() {
  return (
    <main>
      <SavingsCalculator />
    </main>
  );
}
