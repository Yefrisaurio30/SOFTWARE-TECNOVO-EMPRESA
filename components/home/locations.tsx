import { MapPin } from "lucide-react";
import { Container, SectionHeading } from "@/components/ui/section";
import { TECNOVO_MAPS_EMBED_URL, TECNOVO_MAPS_URL, TECNOVO_STORE_CITY } from "@/lib/store";

export function Locations() {
  return (
    <section aria-label="Ubicación" className="bg-light py-24 text-light-text md:py-32">
      <Container>
        <SectionHeading
          tone="light"
          eyebrow="Visítanos"
          title="Cerca de ti."
          description="Prueba, pregunta y llévatela andando."
        />
        <div className="mt-12 overflow-hidden rounded-[28px] border border-black/10 bg-light-surface">
          <div className="grid md:grid-cols-2">
            <div className="flex flex-col items-start justify-center gap-3 p-8 md:p-10">
              <MapPin size={24} strokeWidth={1.5} className="text-steel-deep" aria-hidden />
              <h3 className="text-2xl font-semibold tracking-tight">Sede principal</h3>
              <p className="text-[15px] text-light-muted">
                Taller y tienda · {TECNOVO_STORE_CITY}
              </p>
              <a
                href={TECNOVO_MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-2 rounded-full bg-black px-6 py-3 text-[15px] font-medium text-white transition hover:scale-[1.02]"
              >
                Cómo llegar en Google Maps <span aria-hidden>›</span>
              </a>
            </div>
            <iframe
              title="Mapa de la sede TECNOVO en Google Maps"
              src={TECNOVO_MAPS_EMBED_URL}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
              className="h-72 w-full border-0 grayscale md:h-full md:min-h-[320px]"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
