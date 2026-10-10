import type { Metadata } from "next";
import Link from "next/link";
import { Container, SectionHeading } from "@/components/ui/section";

export const metadata: Metadata = {
  title: "Distribuidores | TECNOVO",
  description: "Vende motos eléctricas TECNOVO en tu ciudad. Precios mayoristas y respaldo de taller.",
};

const STEPS = [
  { n: "1", title: "Crea tu cuenta", text: "Regístrate como cliente en 1 minuto." },
  { n: "2", title: "Envía tu empresa", text: "NIT, ciudad y contacto. Revisamos en 48 horas." },
  { n: "3", title: "Compra al por mayor", text: "Catálogo mayorista con pedido mínimo por volumen." },
];

export default function DistribuidoresPage() {
  return (
    <main className="bg-black text-text">
      <section className="py-20 md:py-28">
        <Container>
          <p className="text-sm font-medium tracking-wide text-steel uppercase">Negocios</p>
          <h1
            className="mt-3 max-w-3xl font-semibold"
            style={{ fontSize: "clamp(40px, 7vw, 88px)", lineHeight: 1.05, letterSpacing: "-0.03em" }}
          >
            Vende eléctrico en tu ciudad.
          </h1>
          <p className="mt-4 max-w-xl text-[17px]/relaxed text-text-muted">
            Precios mayoristas en motos nuevas, material comercial y respaldo de repuestos.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/distribuidores/registro"
              className="rounded-full bg-white px-7 py-3 text-[15px] font-medium text-black transition hover:scale-[1.02]"
            >
              Solicitar acceso
            </Link>
            <Link href="/distribuidores/catalogo" className="py-3 text-[15px]">
              Ver catálogo mayorista <span aria-hidden>›</span>
            </Link>
          </div>
        </Container>
      </section>
      <section className="bg-light py-20 text-light-text md:py-28">
        <Container>
          <SectionHeading
            tone="light"
            eyebrow="Cómo funciona"
            title="Tres pasos, sin vueltas."
          />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="rounded-[28px] border border-black/10 bg-light-surface p-8">
                <p className="text-4xl font-semibold text-steel-deep">{s.n}</p>
                <h2 className="mt-3 text-xl font-semibold">{s.title}</h2>
                <p className="mt-1 text-[15px] text-light-muted">{s.text}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </main>
  );
}
