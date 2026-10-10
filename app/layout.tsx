import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CO">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
