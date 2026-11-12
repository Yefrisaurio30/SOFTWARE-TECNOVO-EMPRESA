import { FileBadge, IdCard, ShieldCheck, Wrench } from "lucide-react";
import { Container } from "@/components/ui/section";

/** Lo que no necesitas para rodar una TECNOVO. */
const NO_REQUIRE = [
  { icon: IdCard, label: "Sin SOAT" },
  { icon: ShieldCheck, label: "Sin Matrícula" },
  { icon: FileBadge, label: "Sin Licencia" },
  { icon: Wrench, label: "Sin Tecnomecánica" },
] as const;

export function WhyTecnovo() {
  return (
    <section aria-label="Por qué TECNOVO" className="bg-white py-24 text-text md:py-32">
      <Container>
        <p className="text-2xl md:text-3xl font-semibold tracking-wide text-steel-deep uppercase">Por qué TECNOVO</p>
        <h2
          className="mt-3 max-w-2xl font-semibold"
          style={{ fontSize: "clamp(32px, 5vw, 64px)", lineHeight: 1.05, letterSpacing: "-0.03em" }}
        >
          Eléctrica, simple y respaldada.
        </h2>
        <ul className="mt-8 flex flex-wrap gap-3" aria-label="No necesitas papeles para rodar">
          {NO_REQUIRE.map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="inline-flex items-center gap-2.5 rounded-xl bg-surface px-5 py-3 text-base font-semibold text-text"
            >
              <Icon size={22} strokeWidth={1.8} className="text-steel-deep" aria-hidden />
              {label}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
