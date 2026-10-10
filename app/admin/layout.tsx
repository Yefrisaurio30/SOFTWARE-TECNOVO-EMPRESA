import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { Container } from "@/components/ui/section";

const NAV = [
  { href: "/admin", label: "Panel" },
  { href: "/admin/productos", label: "Productos" },
  { href: "/admin/pedidos", label: "Pedidos" },
  { href: "/admin/usuarios", label: "Usuarios" },
  { href: "/admin/contenido", label: "Contenido" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <main className="bg-black py-10 text-text md:py-14">
      <Container>
        <p className="text-sm font-medium tracking-wide text-steel uppercase">Superadmin</p>
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
