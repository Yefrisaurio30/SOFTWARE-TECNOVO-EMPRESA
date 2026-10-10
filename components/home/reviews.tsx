import { Star } from "lucide-react";
import { Container, SectionHeading } from "@/components/ui/section";

const REVIEWS = [
  { name: "Carolina M. — Bogotá", text: "Llevo 6 meses con la City S2 y no vuelvo a la gasolina. El taller responde rápido.", model: "City S2" },
  { name: "Javier R. — Medellín", text: "La compré para domicilios. La batería me da el día completo y cargo en la noche.", model: "Trabajo T1" },
  { name: "Paola y Andrés — Cali", text: "Probamos dos modelos antes de decidir. La prueba de manejo nos convenció.", model: "Urban Pro" },
];

export function Reviews() {
  return (
    <section aria-label="Opiniones" className="bg-black py-24 text-text md:py-32">
      <Container>
        <SectionHeading
          eyebrow="Reseñas"
          title="Lo que dicen quienes ya ruedan."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {REVIEWS.map((r) => (
            <figure key={r.name} className="rounded-[28px] border border-white/10 bg-surface p-8">
              <div className="flex gap-1" aria-label="5 de 5 estrellas">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={16} className="fill-steel text-steel" aria-hidden />
                ))}
              </div>
              <blockquote className="mt-4 text-[15px] leading-relaxed text-text">
                “{r.text}”
              </blockquote>
              <figcaption className="mt-4 text-sm text-text-muted">
                {r.name} · {r.model}
              </figcaption>
            </figure>
          ))}
        </div>
      </Container>
    </section>
  );
}
