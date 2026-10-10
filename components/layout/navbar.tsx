"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, Search, ShoppingCart, X } from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/motos-electricas", label: "Eléctricas" },
  { href: "/motos-usadas", label: "Segunda mano" },
  { href: "/repuestos-accesorios", label: "Repuestos" },
  { href: "/distribuidores", label: "Distribuidores" },
];

export function Navbar() {
  const [compact, setCompact] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4">
      <nav
        aria-label="Navegación principal"
        className={cn(
          "flex w-full max-w-[1200px] items-center gap-3 rounded-full border border-white/10 bg-black/70 backdrop-blur-xl transition-all duration-200",
          compact ? "h-12 px-3" : "h-14 px-4",
        )}
        style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,.06)" }}
      >
        <Link href="/" className="flex items-center gap-2" aria-label="TECNOVO inicio">
          <Image
            src="/brand/tecnovo-mark-512.png"
            alt="TECNOVO"
            width={compact ? 26 : 30}
            height={compact ? 26 : 30}
            className="rounded-full"
            priority
          />
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-full px-3 py-1.5 text-sm text-text-muted transition hover:bg-white/5 hover:text-text"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <form
          action="/motos-electricas"
          method="get"
          role="search"
          className="ml-auto hidden min-w-0 flex-1 max-w-55 items-center md:flex"
        >
          <label htmlFor="nav-search" className="sr-only">
            Buscar motos y repuestos
          </label>
          <div className="flex w-full items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
            <Search size={15} className="shrink-0 text-text-faint" aria-hidden />
            <input
              id="nav-search"
              name="q"
              type="search"
              placeholder="Buscar…"
              className="w-full bg-transparent text-sm text-text outline-none placeholder:text-text-faint"
            />
          </div>
        </form>

        <Link
          href="/carrito"
          aria-label="Ver carrito"
          className="ml-auto grid size-9 shrink-0 place-items-center rounded-full border border-white/10 bg-white/5 text-text transition hover:border-white/20 md:ml-0"
        >
          <ShoppingCart size={17} aria-hidden />
        </Link>

        <button
          className="grid size-9 shrink-0 place-items-center rounded-full border border-white/10 bg-white/5 text-text lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
        >
          {open ? <X size={17} /> : <Menu size={17} />}
        </button>
      </nav>

      {open ? (
        <div className="fixed inset-x-4 top-20 z-50 rounded-3xl border border-white/10 bg-graphite p-3 lg:hidden">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block rounded-2xl px-4 py-3 text-[15px] text-text hover:bg-white/5"
            >
              {l.label}
            </Link>
          ))}
        </div>
      ) : null}
    </header>
  );
}
