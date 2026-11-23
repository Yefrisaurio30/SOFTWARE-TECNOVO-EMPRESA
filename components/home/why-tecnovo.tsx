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
    <section aria-label="¿Por qué TECNOVO?" className="bg-white py-24 text-text md:py-32">
      <Container>
        <p className="text-center text-2xl md:text-3xl font-semibold tracking-wide text-steel-deep uppercase">¿Por qué TECNOVO?</p>
        <h2
          className="mx-auto mt-3 max-w-2xl text-center font-semibold"
          style={{ fontSize: "clamp(32px, 5vw, 64px)", lineHeight: 1.05, letterSpacing: "-0.03em" }}
        >
          Eléctrica, simple y respaldada.
        </h2>
        <ul
          className="mt-10 flex flex-wrap justify-center gap-4"
          aria-label="No necesitas papeles para rodar"
        >
          {NO_REQUIRE.map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="inline-flex items-center gap-3 rounded-2xl bg-surface px-7 py-4 text-xl font-semibold text-text md:text-2xl"
            >
              <Icon size={30} strokeWidth={1.8} className="text-steel-deep" aria-hidden />
              {label}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
