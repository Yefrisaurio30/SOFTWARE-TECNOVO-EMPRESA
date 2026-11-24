import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, MapPin, Video } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { parseYoutubeId } from "@/lib/youtube";
import { formatCOP } from "@/lib/money";
import { Container, Section, SectionHeading } from "@/components/ui/section";
import { YouTubeEmbed } from "@/components/capacitacion/youtube-embed";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/reveal";

export const metadata: Metadata = {
  title: "Capacitación | TECNOVO",
  description:
    "Cursos y guías para aprender a manejar, mantener y vender motos eléctricas TECNOVO.",
};

const dateFmt = new Intl.DateTimeFormat("es-CO", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export default async function CapacitacionPage() {
  const courses = await prisma.course.findMany({
    where: { active: true },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });

  return (
    <main>
      {/* Banner superior */}
      <section className="relative overflow-hidden bg-white py-20 text-text md:py-28">
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse at 50% -10%, rgba(57,255,20,.14), transparent 60%)" }}
          aria-hidden
        />
        <Container className="relative text-center">
          <p className="text-3xl md:text-4xl font-semibold tracking-wide text-steel-deep uppercase">Capacitación</p>
          <h1
            className="mx-auto mt-3 max-w-4xl font-semibold"
            style={{ fontSize: "clamp(26px, 6vw, 52px)", lineHeight: 1.05, letterSpacing: "-0.03em" }}
          >
            CONVIERTE EN UN EXPERTO DEL SERVICIO TECNICO ESPECIALIZADO EN MOVILIDAD ELECTRICA.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-[17px]/relaxed text-text-muted">
            Cursos , guias y talleres en mecánica de motos electricas.
          </p>
        </Container>
      </section>

      <Section>
        <Container>
          {courses.length === 0 ? (
            <div className="rounded-[28px] border border-white/10 bg-surface p-6 text-center md:p-12">
              <Video size={36} strokeWidth={1.25} className="mx-auto text-text-faint" aria-hidden />
              <h2 className="mt-4 text-xl font-semibold">Próximamente</h2>
              <p className="mx-auto mt-2 max-w-md text-[15px] text-text-muted">
                Estamos preparando los cursos. Escríbenos y te avisamos apenas abran enrollment.
              </p>
              <Link
                href="/taller"
                className="mt-6 inline-block rounded-full border border-white/15 px-6 py-2.5 text-sm"
              >
                Ver servicio técnico
              </Link>
            </div>
          ) : (
            <>
              <SectionHeading
                eyebrow="Programs"
                title="Cursos y guías."
                description={courses.length === 1 ? "1 programa disponible" : `${courses.length} programas disponibles`}
              />
              <StaggerGroup className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {courses.map((c) => {
                  const videoId = parseYoutubeId(c.youtubeUrl);
                  return (
                    <StaggerItem key={c.id}>
                      <article className="flex h-full flex-col overflow-hidden rounded-[28px] border border-white/10 bg-surface">
                        {videoId ? (
                          <YouTubeEmbed videoId={videoId} title={c.title} />
                        ) : (
                          <div
                            className="grid aspect-video w-full place-items-center bg-[radial-gradient(ellipse_at_center,#2E3440_0%,#161618_70%)]"
                            aria-hidden
                          >
                            <Video size={40} strokeWidth={1} className="text-steel" />
                          </div>
                        )}
                        <div className="flex flex-1 flex-col gap-3 p-6">
                          <h3 className="text-lg font-semibold">{c.title}</h3>
                          {c.summary ? (
                            <p className="text-[15px] leading-relaxed text-text-muted">{c.summary}</p>
                          ) : null}
                          <dl className="mt-auto flex flex-col gap-2 pt-2 text-sm text-text-muted">
                            {c.startsAt ? (
                              <div className="flex items-center gap-2">
                                <CalendarDays size={15} className="shrink-0 text-steel" aria-hidden />
                                <dt className="sr-only">Fecha</dt>
                                <dd>{dateFmt.format(c.startsAt)}</dd>
                              </div>
                            ) : null}
                            {c.modality ? (
                              <div className="flex items-center gap-2">
                                <Video size={15} className="shrink-0 text-steel" aria-hidden />
                                <dt className="sr-only">Modalidad</dt>
                                <dd>{c.modality}</dd>
                              </div>
                            ) : null}
                            {c.city ? (
                              <div className="flex items-center gap-2">
                                <MapPin size={15} className="shrink-0 text-steel" aria-hidden />
                                <dt className="sr-only">Ciudad</dt>
                                <dd>{c.city}</dd>
                              </div>
                            ) : null}
                          </dl>
                          {c.price != null && c.price > 0 ? (
                            <p className="text-xl font-semibold tabular-nums">{formatCOP(c.price)}</p>
                          ) : null}
                        </div>
                      </article>
                    </StaggerItem>
                  );
                })}
              </StaggerGroup>
            </>
          )}

          <Reveal className="mt-16">
            <p className="text-center text-sm text-text-faint">
              ¿Tienes dudas sobre un curso?{" "}
              <Link href="/taller" className="text-steel underline">
                Escríbenos por el taller
              </Link>
            </p>
          </Reveal>
        </Container>
      </Section>
    </main>
  );
}