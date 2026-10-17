import type { Metadata } from "next";
import { getWhatsAppNumber } from "@/lib/site-settings";
import { waLink } from "@/lib/whatsapp";
import { Container, Section, SectionHeading } from "@/components/ui/section";

export const metadata: Metadata = {
  title: "Política de datos | TECNOVO",
  description: "Cómo tratamos los datos personales que nos entrega en esta tienda.",
};

export default async function PoliticaDatosPage() {
  const whatsapp = await getWhatsAppNumber();

  return (
    <main>
      <Section>
        <Container>
          <SectionHeading
            eyebrow="Legal"
            title="Política de datos."
            description="Texto base. Este documento debe ser revisado y aprobado por el abogado de la empresa antes de publicar en producción."
          />

          <div className="mt-10 max-w-3xl space-y-8 text-[15px] leading-relaxed text-text-muted">
            <section>
              <h2 className="text-xl font-semibold text-text">1. Qué datos recogemos</h2>
              <p className="mt-2">
                Cuando realizas una compra registramos tu nombre, número de celular, correo
                electrónico (si lo das), ciudad, dirección de entrega y los productos que pediste.
                Si creas cuenta, guardamos tu correo y tu nombre.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-text">2. Para qué los usamos</h2>
              <p className="mt-2">
                Para procesar tu pedido, coordinar la entrega por WhatsApp, emitir la factura y
                atender garantías o solicitudes de servicio técnico.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-text">3. Pagos</h2>
              <p className="mt-2">
                El pago lo procesa Wompi. TECNOVO no guarda números de tarjeta ni datos financieros.
                El estado del pago se confirma mediante el evento que reporta la pasarela.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-text">4. Con quién los compartimos</h2>
              <p className="mt-2">
                Solo con la pasarela de pagos para procesar la transacción y con la empresa de
                transporte o mensajería que lleva el pedido. No vendemos ni cedemos tus datos.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-text">5. Tus derechos</h2>
              <p className="mt-2">
                Puedes pedir información sobre tus datos, corregirlos o pedir su eliminación.
                Escríbenos y atendemos tu solicitud dentro de los plazos de la ley.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-text">6. Cambios a esta política</h2>
              <p className="mt-2">
                Si actualizamos este documento, publicamos la versión vigente en esta misma página.
              </p>
            </section>

            <div className="rounded-[24px] border border-steel/40 bg-surface p-6">
              <p className="text-text">
                ¿Tienes dudas sobre tus datos?{" "}
                <a
                  href={waLink("Hola TECNOVO, tengo una duda sobre el tratamiento de mis datos.", whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-steel underline"
                >
                  Escríbenos
                </a>
              </p>
            </div>
          </div>
        </Container>
      </Section>
    </main>
  );
}