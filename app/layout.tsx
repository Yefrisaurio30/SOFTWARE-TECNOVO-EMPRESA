import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { getWhatsAppNumber } from "@/lib/site-settings";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { WhatsAppWidget } from "@/components/contact/whatsapp-widget";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { Splash } from "@/components/layout/splash";
import { CompareTray } from "@/components/compare/compare-tray";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "TECNOVO — Motos eléctricas, repuestos y accesorios",
  description:
    "Tienda TECNOVO: motos eléctricas nuevas, motos de segunda mano, repuestos y accesorios en Colombia.",
  icons: { icon: "/brand/favicon-64.png" },
  openGraph: {
    title: "TECNOVO",
    description: "Motos eléctricas, segunda mano, repuestos y accesorios.",
    images: ["/brand/tecnovo-logo-original.png"],
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const whatsapp = await getWhatsAppNumber();
  return (
    <html lang="es-CO">
      <body className={inter.className}>
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[60] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-black"
        >
          Saltar al contenido
        </a>
        <Navbar />
        <div id="contenido" className="pt-24">
          {children}
        </div>
        <Footer />
        <WhatsAppWidget number={whatsapp} />
        <CartDrawer />
        <CompareTray />
        <Splash />
      </body>
    </html>
  );
}
