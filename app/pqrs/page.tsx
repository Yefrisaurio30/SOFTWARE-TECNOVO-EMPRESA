import type { Metadata } from "next";
import { MessageCircle } from "lucide-react";
import { getWhatsAppNumber } from "@/lib/site-settings";
import { waLink } from "@/lib/whatsapp";
import { Container, Section, SectionHeading } from "@/components/ui/section";

export const metadata: Metadata = {
  title: "PQRS | TECNOVO",
  description: "Peticiones, quejas, reclamaciones y sugerencias para TECNOVO.",
};

export default async function PqrsPage() {
  const whatsapp = await getWhatsAppNumber();

  return (
    <main>
      <Section>
        <Container>
          <SectionHeading
            eyebrow="Atención"
            title="PQRS."
            description="Peticiones, quejas, reclamaciones y sugerencias. Responemos por WhatsApp."
          />

          <div className="mt-10 grid max-w-4xl gap-4 sm:grid-cols-2">
            {[
              { k: "Petición", d: "Solicitud de información o un servicio que necesitas." },
              { k: "Queja", d: "Inconformidad con un producto, el trato o el servicio." },
              { k: "Reclamación", d: "Problema con un pedido, cobro o garantía." },
              { k: "Sugerencia", d: "Una idea para mejorar la tienda o los procesos." },
            ].map((x) => (
              <div key={x.k} className="rounded-[24px] border border-white/10 bg-surface p-6">
                <h2 className="text-lg font-semibold text-text">{x.k}</h2>
                <p className="mt-1 text-[15px] text-text-muted">{x.d}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 max-w-2xl rounded-[28px] border border-steel/40 bg-surface p-8">
            <h2 className="text-xl font-semibold text-text">Cómo radicar tu PQRS</h2>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-[15px] text-text-muted">
              <li>Escríbenos por WhatsApp indicando que es una PQRS y describe el caso.</li>
              <li>Si es sobre un pedido, incluye el número de pedido y tu correo de compra.</li>
              <li>Recibirás respuesta por el mismo canal.</li>
            </ol>
            <a
              href={waLink("Hola TECNOVO, quiero radicar una PQRS.", whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-steel px-6 py-3 text-[15px] font-semibold text-black"
            >
              <MessageCircle size={17} aria-hidden />
              COTIZAR
            </a>
          </div>
        </Container>
      </Section>
    </main>
  );
}