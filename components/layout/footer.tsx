import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { Container } from "@/components/ui/section";

import { TECNOVO_MAPS_URL, TECNOVO_STORE_CITY } from "@/lib/store";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#29F506] text-text" style={{ boxShadow: "none", backgroundImage: "none" }}>
      <Container className="py-16">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <Image
              src="/brand/tecnovo-logo-original.png"
              alt="TECNOVO"
              width={220}
              height={220}
              className="opacity-60"
            />
            <p className="mt-4 text-sm leading-relaxed text-text-muted">
              Motos eléctricas nuevas, segunda mano, repuestos y accesorios.
            </p>
            <a
              href={TECNOVO_MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm text-text-muted transition hover:text-text"
            >
              <MapPin size={16} aria-hidden />
              Sede {TECNOVO_STORE_CITY} · Cómo llegar
            </a>
          </div>
          <nav aria-label="Enlaces de interés" className="grid grid-cols-2 gap-8 text-sm md:grid-cols-4">
            <div className="flex flex-col gap-3">
              <span className="text-text-faint uppercase tracking-wide text-xs">Tienda</span>
              <Link href="/motos-electricas" className="text-text-muted hover:text-text">
                Motos eléctricas
              </Link>
              <Link href="/motos-usadas" className="text-text-muted hover:text-text">
                Segunda mano
              </Link>
              <Link href="/repuestos-accesorios" className="text-text-muted hover:text-text">
                Repuestos
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-text-faint uppercase tracking-wide text-xs">Servicio</span>
              <Link href="/taller" className="text-text-muted hover:text-text">
                Taller y garantía
              </Link>
              <Link href="/capacitacion" className="text-text-muted hover:text-text">
                Capacitación
              </Link>
              <Link href="/calculadora" className="text-text-muted hover:text-text">
                Calculadora de ahorro
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-text-faint uppercase tracking-wide text-xs">Empresa</span>
              <Link href="/distribuidores" className="text-text-muted hover:text-text">
                Distribuidores
              </Link>
              <Link href="/publicar" className="text-text-muted hover:text-text">
                Publica tu moto
              </Link>
              <Link href="/pqrs" className="text-text-muted hover:text-text">
                PQRS
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-text-faint uppercase tracking-wide text-xs">Legal</span>
              <Link href="/legales/terminos-y-condiciones" className="text-text-muted hover:text-text">
                Términos y condiciones
              </Link>
              <Link href="/legales/politica-de-privacidad" className="text-text-muted hover:text-text">
                Política de privacidad
              </Link>
              <Link href="/legales/politica-de-cookies" className="text-text-muted hover:text-text">
                Política de cookies
              </Link>
              <Link href="/legales/derecho-de-retracto-y-reembolsos" className="text-text-muted hover:text-text">
                Retracto y reembolsos
              </Link>
            </div>
          </nav>
        </div>
        <div className="mt-12 border-t border-white/10 pt-6 text-xs text-text-faint">
          <span>© 2026 TECNOVO. Todos los derechos reservados.</span>
        </div>
      </Container>
    </footer>
  );
}
