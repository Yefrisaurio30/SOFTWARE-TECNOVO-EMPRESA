import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { getWhatsAppNumber } from "@/lib/site-settings";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { WhatsAppWidget } from "@/components/contact/whatsapp-widget";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { MotionProvider } from "@/components/motion/motion-provider";
import { AuthProvider } from "@/components/auth/auth-provider";
import { Splash } from "@/components/layout/splash";
import { CookieBanner } from "@/components/legal/cookie-banner";
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
    images: ["/brand/tecnovo-logo-negro.png"],
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const whatsapp = await getWhatsAppNumber();
  return (
    <html lang="es-CO">
      <body className={inter.className}>
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[60] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-[#000]"
        >
          Saltar al contenido
        </a>
        <MotionProvider>
        <AuthProvider>
        {/* Banda verde de marca: la barra de navegación vive dentro de ella. */}
        <div className="fixed inset-x-0 top-0 z-40 h-24 bg-[#29F506]">
          <Navbar />
        </div>
        <div id="contenido" className="pt-24">
          {children}
        </div>
        <Footer whatsapp={whatsapp} />
        <WhatsAppWidget number={whatsapp} />
        <CartDrawer />
        <CompareTray />
        <Splash />
        <CookieBanner />
        </AuthProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
