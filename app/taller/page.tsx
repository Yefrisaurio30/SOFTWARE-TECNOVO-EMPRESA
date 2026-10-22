import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Phone, ShieldCheck, Wrench } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getWarrantyYears } from "@/lib/products";
import { getWhatsAppNumber } from "@/lib/site-settings";
import { waLink } from "@/lib/whatsapp";
import { TECNOVO_MAPS_URL, TECNOVO_STORE_CITY } from "@/lib/store";
import { Container, Section, SectionHeading } from "@/components/ui/section";

export const metadata: Metadata = {
  title: "Taller y servicio técnico | TECNOVO",
  description:
    "Red de servicio técnico TECNOVO, garantía de las motos eléctricas y agenda de mantenimiento en Colombia.",
};

export default async function TallerPage() {
  const [services, warrantyYears, whatsapp] = await Promise.all([
    prisma.service.findMany({ where: { active: true }, orderBy: [{ order: "asc" }, { name: "asc" }] }),
    getWarrantyYears(),
    getWhatsAppNumber(),
  ]);

  return (
    <main>
      <Section>
        <Container>
          <SectionHeading
            eyebrow="Servicio técnico"
            title="Taller y garantía."
            description="Mantenimiento, diagnóstico y repuestos originales para tu moto eléctrica."
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[24px] border border-steel/40 bg-surface p-6">
              <ShieldCheck size={26} strokeWidth={1.5} className="text-steel" aria-hidden />
              <p className="mt-3 text-3xl font-semibold">{warrantyYears} años</p>
              <p className="mt-1 text-sm text-text-muted">de garantía en todas las motos</p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-surface p-6">
              <Wrench size={26} strokeWidth={1.5} className="text-steel" aria-hidden />
              <p className="mt-3 text-3xl font-semibold">{services.length}</p>
              <p className="mt-1 text-sm text-text-muted">
                {services.length === 1 ? "punto de servicio" : "puntos de servicio"} activos
              </p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-surface p-6">
              <Phone size={26} strokeWidth={1.5} className="text-steel" aria-hidden />
              <p className="mt-3 text-3xl font-semibold">WhatsApp</p>
              <p className="mt-1 text-sm text-text-muted">agenda tu cita sin costo</p>
            </div>
          </div>
        </Container>
      </Section>

      <Section tone="light">
        <Container>
          <SectionHeading tone="light" eyebrow="Red de servicio" title="Dónde te atendemos." />
          {services.length === 0 ? (
            <div className="mt-10 rounded-[28px] border border-black/10 bg-light-surface p-10 text-center">
              <p className="text-lg font-semibold text-light-text">Estamos ampliando la red</p>
              <p className="mt-2 text-light-muted">
                Escríbenos y te decimos cuándo hay servicio cerca de ti.
              </p>
              <a
                href={waLink(`Hola TECNOVO, ¿cuándo hay servicio técnico cerca de mí?`, whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-block rounded-full bg-black px-6 py-2.5 text-sm font-medium text-white"
              >
                Consultar por WhatsApp
              </a>
            </div>
          ) : (
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {services.map((s) => (
                <article
                  key={s.id}
                  className="rounded-[28px] border border-black/10 bg-light-surface p-8"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-semibold text-light-text">
                        {s.name}
                        {s.isHeadquarter ? (
                          <span className="ml-2 rounded-full bg-black px-3 py-1 text-xs font-medium text-white">
                            Sede principal
                          </span>
                        ) : null}
                      </h3>
                      <p className="mt-1 text-sm text-light-muted">
                        <MapPin size={14} className="mr-1 inline text-steel-deep" aria-hidden />
                        {s.city}
                      </p>
                    </div>
                    {s.warranty ? (
                      <span className="shrink-0 rounded-full border border-black/15 px-3 py-1 text-xs text-light-muted">
                        Garantía
                      </span>
                    ) : null}
                  </div>
                  {s.address ? (
                    <p className="mt-3 text-[15px] text-light-text">{s.address}</p>
                  ) : null}
                  {s.services.length > 0 ? (
                    <ul className="mt-4 flex flex-wrap gap-2">
                      {s.services.map((x) => (
                        <li
                          key={x}
                          className="rounded-full border border-black/12 px-3 py-1 text-xs text-light-muted"
                        >
                          {x}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  <div className="mt-6 flex flex-wrap gap-3">
                    <a
                      href={waLink(`Hola TECNOVO, quiero agendar servicio técnico en ${s.name} (${s.city}).`, whatsapp)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white"
                    >
                      Agendar cita
                    </a>
                    {s.mapsUrl ? (
                      <a
                        href={s.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-full border border-black/15 px-5 py-2 text-sm text-light-text"
                      >
                        Cómo llegar
                      </a>
                    ) : null}
                    {s.phone ? (
                      <a href={`tel:${s.phone.replace(/\s/g, "")}`} className="px-2 py-2 text-sm text-light-muted">
                        {s.phone}
                      </a>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          )}
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="flex flex-col items-start gap-6 rounded-[28px] bg-surface p-10 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight">¿Necesitas mantenimiento?</h2>
              <p className="mt-2 max-w-md text-[15px] text-text-muted">
                Atendemos en {TECNOVO_STORE_CITY} y coordinamos envío a otras ciudades.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href={waLink("Hola TECNOVO, quiero agendar mantenimiento de mi moto eléctrica.", whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-steel px-6 py-3 text-[15px] font-medium text-[#000]"
              >
                Agendar por WhatsApp
              </a>
              <a
                href={TECNOVO_MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/15 px-6 py-3 text-[15px] text-text"
              >
                Ver sede <span aria-hidden>›</span>
              </a>
            </div>
          </div>
          <p className="mt-8 text-center text-sm text-text-faint">
            ¿Buscas una moto? <Link href="/motos-electricas" className="text-steel underline">Ver catálogo</Link>
          </p>
        </Container>
      </Section>
    </main>
  );
}