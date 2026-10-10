import Link from "next/link";
import { Container, Section } from "@/components/ui/section";

export default function Home() {
  return (
    <>
      <Section>
        <Container className="text-center">
          <p className="mx-auto w-fit rounded-full border border-white/10 px-4 py-1 text-sm text-text-muted">
            TECNOVO · Sistema de diseño F1
          </p>
          <h1
            className="mx-auto mt-6 max-w-4xl font-semibold"
            style={{ fontSize: "clamp(44px, 8vw, 104px)", lineHeight: 1.05, letterSpacing: "-0.03em" }}
          >
            Monocromo premium.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-[17px]/relaxed text-text-muted">
            Negro y gris, aire generoso y la moto como protagonista. La home
            completa llega en F3.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              href="/motos-electricas"
              className="rounded-full bg-white px-6 py-3 text-[15px] font-medium text-black transition hover:scale-[1.02]"
            >
              Ver eléctricas
            </Link>
            <Link href="/motos-usadas" className="text-[15px] text-text">
              Segunda mano <span aria-hidden>›</span>
            </Link>
          </div>
        </Container>
      </Section>
      <Section tone="light">
        <Container>
          <p className="text-sm font-medium tracking-wide text-steel-deep uppercase">F1 · Tokens</p>
          <h2
            className="mt-3 font-semibold text-light-text"
            style={{ fontSize: "clamp(32px, 5vw, 64px)", lineHeight: 1.05, letterSpacing: "-0.03em" }}
          >
            Secciones que alternan negro y gris claro.
          </h2>
        </Container>
      </Section>
    </>
  );
}
