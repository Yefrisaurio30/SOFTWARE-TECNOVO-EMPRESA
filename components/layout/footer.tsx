import Image from "next/image";
import Link from "next/link";
import { Facebook, Instagram, Phone, Settings, ShieldCheck, CircleAlert } from "lucide-react";
import { waLink } from "@/lib/whatsapp";

function TikTokIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

const SOCIALS = [
  { label: "Facebook", href: "https://www.facebook.com/tecnovo.co", Icon: Facebook },
  { label: "TikTok", href: "https://www.tiktok.com/@tecnovo.co", Icon: TikTokIcon },
  { label: "Instagram", href: "https://www.instagram.com/tecnovo.co", Icon: Instagram },
];

const UTILITIES = [
  { label: "Servicio Técnico", href: "/taller", Icon: Settings },
  { label: "Política de datos", href: "/politica-datos", Icon: ShieldCheck },
  { label: "PQRS", href: "/pqrs", Icon: CircleAlert },
] as const;

interface FooterProps {
  whatsapp?: string;
}

export function Footer({ whatsapp }: FooterProps) {
  const contactHref = waLink("Hola TECNOVO, quiero información. ¿Me ayudan?", whatsapp);
  const utilities = [
    { label: "Contacto", href: contactHref, Icon: Phone, external: true },
    ...UTILITIES.map((u) => ({ ...u, external: false })),
  ];

  return (
    <footer className="border-t border-black/10 bg-white text-text">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center px-4 py-14 text-center">
        <Image
          src="/brand/tecnovo-logo-negro.png"
          alt="TECNOVO"
          width={150}
          height={31}
          quality={80}
          priority
        />
        <p className="mt-6 max-w-md text-[15px] font-semibold leading-relaxed text-text-faint">
          ¡Bienvenido a la nueva revolución de movilidad eléctrica en Colombia!{" "}
          <span aria-hidden>⚡</span>
        </p>
        <div className="mt-6 flex items-center gap-6">
          {SOCIALS.map(({ label, href, Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="text-text-faint transition hover:text-text"
            >
              <Icon size={24} />
            </a>
          ))}
        </div>
      </div>
      <div className="border-t border-black/10 bg-surface">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-4 px-4 py-6">
          <nav
            aria-label="Enlaces de servicio"
            className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3"
          >
            {utilities.map(({ label, href, Icon, external }) =>
              external ? (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-text-muted transition hover:text-text"
                >
                  <Icon size={16} aria-hidden />
                  {label}
                </a>
              ) : (
                <Link
                  key={label}
                  href={href}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-text-muted transition hover:text-text"
                >
                  <Icon size={16} aria-hidden />
                  {label}
                </Link>
              ),
            )}
          </nav>
          <p className="text-xs text-text-faint">
            © 2026 TECNOVO. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
