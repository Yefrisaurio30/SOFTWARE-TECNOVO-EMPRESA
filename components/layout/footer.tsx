import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/section";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black text-text">
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
          </div>
          <nav aria-label="Enlaces de interés" className="grid grid-cols-2 gap-8 text-sm">
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
              <span className="text-text-faint uppercase tracking-wide text-xs">Empresa</span>
              <Link href="/distribuidores" className="text-text-muted hover:text-text">
                Distribuidores
              </Link>
              <Link href="/politica-datos" className="text-text-muted hover:text-text">
                Política de datos
              </Link>
              <Link href="/pqrs" className="text-text-muted hover:text-text">
                PQRS
              </Link>
            </div>
          </nav>
        </div>
        <div className="mt-12 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-text-faint md:flex-row md:justify-between">
          <span>© {new Date().getFullYear()} TECNOVO. Todos los derechos reservados.</span>
          <span>Precios en COP. La confirmación del pago la da la pasarela.</span>
        </div>
      </Container>
    </footer>
  );
}
