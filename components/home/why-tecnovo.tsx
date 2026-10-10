import { BatteryCharging, PiggyBank, ShieldCheck, VolumeX, Wrench, Zap } from "lucide-react";
import { Container } from "@/components/ui/section";

const POINTS = [
  { icon: PiggyBank, title: "Ahorro real", text: "Recargar cuesta una fracción de tanquear gasolina." },
  { icon: VolumeX, title: "Cero ruido", text: "Movilidad silenciosa para la ciudad." },
  { icon: Wrench, title: "Taller propio", text: "Repuestos y servicio técnico garantizados." },
  { icon: BatteryCharging, title: "Batería extraíble", text: "Cárgala en casa o en la oficina." },
  { icon: ShieldCheck, title: "Garantía escrita", text: "Motor y batería con garantía en cada moto." },
  { icon: Zap, title: "Prueba de manejo", text: "Agenda y siente la diferencia antes de decidir." },
];

export function WhyTecnovo() {
  return (
    <section aria-label="Por qué TECNOVO" className="bg-black py-24 text-text md:py-32">
      <Container>
        <p className="text-sm font-medium tracking-wide text-steel uppercase">Por qué TECNOVO</p>
        <h2
          className="mt-3 max-w-2xl font-semibold"
          style={{ fontSize: "clamp(32px, 5vw, 64px)", lineHeight: 1.05, letterSpacing: "-0.03em" }}
        >
          Eléctrica, simple y respaldada.
        </h2>
        <div className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {POINTS.map((p) => (
            <div key={p.title}>
              <p.icon size={28} strokeWidth={1.5} className="text-steel" aria-hidden />
              <h3 className="mt-4 text-lg font-semibold">{p.title}</h3>
              <p className="mt-1 text-[15px] text-text-muted">{p.text}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
