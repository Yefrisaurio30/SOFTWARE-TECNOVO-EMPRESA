import { MapPin } from "lucide-react";
import { Container, SectionHeading } from "@/components/ui/section";

const LOCATIONS = [
  { city: "Bogotá", address: "Av. de las Motos 123, Centro", hours: "Lun–Sáb 9am–6pm" },
  { city: "Medellín", address: "Calle Eléctrica 45, Laureles", hours: "Lun–Sáb 9am–6pm" },
  { city: "Cali", address: "Carrera Verde 78, Norte", hours: "Lun–Vie 9am–6pm · Sáb 9am–1pm" },
];

export function Locations() {
  return (
    <section aria-label="Ubicaciones" className="bg-light py-24 text-light-text md:py-32">
      <Container>
        <SectionHeading
          tone="light"
          eyebrow="Visítanos"
          title="Cerca de ti."
          description="Prueba, pregunta y llévatela andando."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {LOCATIONS.map((l) => (
            <div key={l.city} className="rounded-[28px] border border-black/10 bg-light-surface p-8">
              <MapPin size={24} strokeWidth={1.5} className="text-steel-deep" aria-hidden />
              <h3 className="mt-4 text-xl font-semibold">{l.city}</h3>
              <p className="mt-1 text-[15px] text-light-muted">{l.address}</p>
              <p className="mt-1 text-sm text-light-muted">{l.hours}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
