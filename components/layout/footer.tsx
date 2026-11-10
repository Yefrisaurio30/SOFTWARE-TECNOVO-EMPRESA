import Image from "next/image";
import Link from "next/link";
import { Wrench, Phone, Shield, MessageSquare } from "lucide-react";

import { TECNOVO_STORE_CITY } from "@/lib/store";

const quickLinks = [
  { href: "/taller", label: "Servicio Técnico", Icon: Wrench },
  { href: "/pqrs", label: "Contacto", Icon: Phone },
  { href: "/politica-datos", label: "Política de datos", Icon: Shield },
  { href: "/pqrs", label: "PQRS", Icon: MessageSquare },
];

export function Footer() {
  return (
    <footer className="bg-white text-gray-600">
      <div className="mx-auto max-w-5xl px-6 py-12 text-center">
        <div className="flex justify-center">
          <Image
            src="/brand/tecnovo-logo-original.png"
            alt="TECNOVO"
            width={180}
            height={180}
            className="h-auto w-40"
          />
        </div>
        <p className="mt-4 text-sm text-gray-500">
          Motos eléctricas nuevas, segunda mano, repuestos y accesorios en Colombia. ⚡
        </p>
      </div>

      <div className="mx-auto max-w-5xl px-6">
        <div className="border-t border-gray-100" />
      </div>

      <div className="mx-auto max-w-5xl px-6 py-8">
        <nav
          aria-label="Accesos rápidos"
          className="grid grid-cols-2 gap-4 sm:grid-cols-4"
        >
          {quickLinks.map(({ href, label, Icon }) => (
            <Link
              key={label}
              href={href}
              className="flex items-center justify-center gap-2 text-sm text-gray-500 transition hover:text-[#29F506]"
            >
              <Icon size={16} aria-hidden className="text-gray-400" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
        <p className="mt-8 text-center text-xs text-gray-400">
          © 2026 TECNOVO{TECNOVO_STORE_CITY ? ` · ${TECNOVO_STORE_CITY}` : ""}. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}