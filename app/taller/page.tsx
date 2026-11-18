import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MapPin, MessageCircle, Phone, ShieldCheck, Wrench } from "lucide-react";
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
    <div className="rounded-[24px] border border-steel/40 bg-zinc-200 p-6">
      <ShieldCheck size={26} strokeWidth={1.5} className="text-steel" aria-hidden />
      <p className="mt-3 text-3xl font-semibold text-black">{warrantyYears} años</p>
      <p className="mt-1 text-sm text-text-muted">de garantía en defectos de fabrica</p>
    </div>
    <div className="rounded-[24px] border border-zinc-400/20 bg-zinc-200 p-6">
      <Wrench size={26} strokeWidth={1.5} className="text-steel" aria-hidden />
      <p className="mt-3 text-3xl font-semibold text-black">{services.length}</p>
      <p className="mt-1 text-sm text-text-muted">
        {services.length === 1 ? "punto de servicio" : "puntos de servicio"} activos
      </p>
    </div>
    <div className="rounded-[24px] border border-zinc-400/20 bg-zinc-200 p-6">
      <Phone size={26} strokeWidth={1.5} className="text-steel" aria-hidden />
      <p className="mt-3 text-3xl font-semibold text-black">WhatsApp</p>
      <p className="mt-1 text-sm text-text-muted">agenda tu cita sin costo</p>
    </div>
  </div>
</Container>
      </Section>

      <Section tone="light">
        <Container>
          <Image
            src="/taller/taller-motos-electricas.jpg"
            alt="Técnico TECNOVO revisando el sistema eléctrico de una moto en el taller"
            width={2000}
            height={1000}
            quality={80}
            sizes="(max-width: 768px) 100vw, 1200px"
            className="mb-10 aspect-[2/1] w-full rounded-[28px] border border-black/10 object-cover"
          />
          <SectionHeading tone="light" eyebrow="Red de servicio" title="Dónde te atendemos." />
          {services.length === 0 ? (
            <div className="mt-10 rounded-[28px] border border-black/10 bg-light-surface p-6 text-center md:p-10">
              <p className="text-lg font-semibold text-light-text">Estamos ampliando la red</p>
              <p className="mt-2 text-light-muted">
                Escríbenos y te decimos cuándo hay servicio cerca de ti.
              </p>
              <a
                href={waLink(`Hola TECNOVO, ¿cuándo hay servicio técnico cerca de mí?`, whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-steel px-6 py-2.5 text-sm font-semibold text-white"
              >
                <MessageCircle size={15} aria-hidden />
                COTIZAR
              </a>
            </div>
          ) : (
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {services.map((s) => (
                <article
                  key={s.id}
                  className="flex flex-col items-center rounded-[28px] border border-black/10 bg-light-surface p-6 text-center md:p-10"
                >
                  <div className="flex flex-col items-center gap-3">
                    <h3 className="text-3xl font-semibold break-words text-light-text">
                      {s.name}
                      {s.isHeadquarter ? (
                        <span className="ml-2 rounded-full bg-white px-3 py-1 align-middle text-xs font-medium text-white">
                          Sede principal
                        </span>
                      ) : null}
                    </h3>
                    <p className="text-base font-medium text-light-muted">
                      <MapPin size={16} className="mr-1 inline text-steel-deep" aria-hidden />
                      {s.city}
                    </p>
                    {s.warranty ? (
                      <span className="rounded-full border border-black/15 px-3 py-1 text-sm text-light-muted">
                        Garantía
                      </span>
                    ) : null}
                  </div>
                  {s.address ? (
                    <p className="mt-3 text-[17px] text-light-text">{s.address}</p>
                  ) : null}
                  {s.services.length > 0 ? (
                    <ul className="mt-4 flex flex-wrap justify-center gap-2">
                      {s.services.map((x) => (
                        <li
                          key={x}
                          className="rounded-full border border-black/12 px-3 py-1 text-sm text-light-muted"
                        >
                          {x}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                    <a
                      href={waLink(`Hola TECNOVO, quiero agendar servicio técnico en ${s.name} (${s.city}).`, whatsapp)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full bg-steel px-5 py-2 text-sm font-semibold text-white"
                    >
                      <MessageCircle size={15} aria-hidden />
                      COTIZAR
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
                      <a href={`tel:${s.phone.replace(/\s/g, "")}`} className="px-2 py-2 text-base font-medium text-black">
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
          <div className="flex flex-col items-start gap-6 rounded-[28px] bg-surface p-6 md:flex-row md:items-center md:justify-between md:p-10">
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
                className="inline-flex items-center gap-2 rounded-full bg-steel px-6 py-3 text-[15px] font-semibold text-white"
              >
                <MessageCircle size={17} aria-hidden />
                COTIZAR
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