import Link from "next/link";
import Image from "next/image";
import { requireAdmin } from "@/lib/admin";
import { auth, signOut } from "@/lib/auth";
import { Container } from "@/components/ui/section";

const NAV = [
  { href: "/admin", label: "Panel" },
  { href: "/admin/anuncios", label: "Revisión de anuncios" },
  { href: "/admin/auditoria-legales", label: "Auditoría legal" },
  { href: "/admin/productos", label: "Productos" },
  { href: "/admin/banners", label: "Banners" },
  { href: "/admin/pedidos", label: "Pedidos" },
  { href: "/admin/usuarios", label: "Usuarios" },
  { href: "/admin/taller", label: "Taller" },
  { href: "/admin/capacitacion", label: "Capacitación" },
  { href: "/admin/contenido", label: "Contenido" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  await requireAdmin();
  return (
    <main className="bg-white py-10 text-text md:py-14">
      <Container>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Image
              src="/brand/tecnovo-logo-verde.png"
              alt="TECNOVO — Superadmin"
              width={140}
              height={30}
              className="h-7 w-auto"
              priority
            />
            <p className="text-2xl md:text-3xl font-semibold tracking-wide text-steel-deep uppercase">Superadmin</p>
          </div>
          {session?.user ? (
            <div className="flex items-center gap-3 text-sm text-text-muted">
              <span>Hola, {session.user.name ?? session.user.email}</span>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button type="submit" className="rounded-full border border-white/15 px-4 py-1.5 text-sm text-text transition hover:border-white/30">
                  Cerrar sesión
                </button>
              </form>
            </div>
          ) : null}
        </div>
        <nav aria-label="Administración" className="mt-4 flex flex-wrap gap-2">
          {NAV.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-full border border-white/10 bg-surface px-4 py-2 text-sm text-text-muted transition hover:border-white/25 hover:text-text"
            >
              {l.label}
            </Link>
          ))}
          <Link href="/" className="rounded-full px-4 py-2 text-sm text-text-faint hover:text-text">
            ← Ver tienda
          </Link>
        </nav>
        <div className="mt-8">{children}</div>
      </Container>
    </main>
  );
}
