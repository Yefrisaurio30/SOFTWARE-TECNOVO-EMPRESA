import { waTestRideLink } from "@/lib/whatsapp";
import { Container } from "@/components/ui/section";

export function TestRide() {
  return (
    <section aria-label="Prueba de manejo" className="bg-light pb-24 text-light-text md:pb-32">
      <Container>
        <div className="flex flex-col items-start gap-6 rounded-[28px] bg-black p-10 text-text md:flex-row md:items-center md:justify-between md:p-14">
          <div>
            <h2
              className="font-semibold"
              style={{ fontSize: "clamp(28px, 4vw, 48px)", lineHeight: 1.05, letterSpacing: "-0.03em" }}
            >
              Siéntela antes de decidir.
            </h2>
            <p className="mt-2 max-w-md text-[15px] text-text-muted">
              Agenda una prueba de manejo por WhatsApp. Sin compromiso.
            </p>
          </div>
          <a
            href={waTestRideLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-full bg-white px-7 py-3 text-[15px] font-medium text-black transition hover:scale-[1.02]"
          >
            Agendar por WhatsApp
          </a>
        </div>
      </Container>
    </section>
  );
}
