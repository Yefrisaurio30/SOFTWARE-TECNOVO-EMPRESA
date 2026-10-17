import Link from "next/link";
import { Container, Section, SectionHeading } from "@/components/ui/section";

export function LegalPage({
  eyebrow,
  title,
  intro,
  updated = "Octubre de 2026",
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <main>
      <Section>
        <Container>
          <SectionHeading eyebrow={eyebrow} title={title} description={intro} />
          <div className="mt-10 max-w-3xl space-y-8 text-[15px] leading-relaxed text-text-muted">
            {children}
          </div>
          <LegalFooterNote updated={updated} />
        </Container>
      </Section>
    </main>
  );
}

export function LegalSection({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-semibold text-text">
        {n}. {title}
      </h2>
      <div className="mt-2 space-y-2">{children}</div>
    </section>
  );
}

export function LegalNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-2xl border border-steel/40 bg-surface p-4 text-sm text-text">
      {children}
    </p>
  );
}

export function LegalWarning({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-2xl border border-danger/40 bg-danger/10 p-4 text-sm text-danger">
      {children}
    </p>
  );
}

function LegalFooterNote({ updated }: { updated: string }) {
  return (
    <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-text-faint">
      <p>Última actualización: {updated}</p>
      <p>
        Documento redactado con fines informativos. Antes de publicarlo en producción debe ser
        revisado y aprobado por un abogado en Colombia.
      </p>
      <nav aria-label="Documentos legales" className="flex flex-wrap gap-4">
        <Link href="/legales/terminos-y-condiciones" className="hover:text-text">
          Términos y Condiciones
        </Link>
        <Link href="/legales/politica-de-privacidad" className="hover:text-text">
          Política de Privacidad
        </Link>
        <Link href="/legales/politica-de-cookies" className="hover:text-text">
          Política de Cookies
        </Link>
        <Link href="/legales/derecho-de-retracto-y-reembolsos" className="hover:text-text">
          Retracto y Reembolsos
        </Link>
      </nav>
    </div>
  );
}