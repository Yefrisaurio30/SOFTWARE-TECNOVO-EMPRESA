"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Container } from "@/components/ui/section";

const inputCls =
  "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[15px] text-text outline-none placeholder:text-text-faint focus:border-steel/60";
const labelCls = "mb-1 block text-xs font-medium tracking-wide text-text-muted uppercase";

export default function RegistroPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(json.error ?? "No se pudo crear la cuenta");
        return;
      }
      const login = await signIn("credentials", { email, password, redirect: false });
      if (login?.error) {
        router.push("/login");
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setError("Error de red. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-black py-16 text-text">
      <Container className="max-w-md">
        <p className="text-sm font-medium tracking-wide text-steel uppercase">Cuenta</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Crear cuenta</h1>
        <form onSubmit={submit} className="mt-8 flex flex-col gap-4 rounded-[28px] border border-white/10 bg-surface p-6">
          <div>
            <label htmlFor="reg-name" className={labelCls}>Nombre</label>
            <input id="reg-name" required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label htmlFor="reg-email" className={labelCls}>Correo</label>
            <input id="reg-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label htmlFor="reg-pass" className={labelCls}>Contraseña (mín. 8)</label>
            <input id="reg-pass" type="password" required autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} />
          </div>
          {error ? <p role="alert" className="text-sm text-danger">{error}</p> : null}
          <button type="submit" disabled={loading} className="rounded-full bg-white py-3 text-[15px] font-medium text-black disabled:opacity-60">
            {loading ? "Creando…" : "Crear cuenta"}
          </button>
          <p className="text-center text-sm text-text-muted">
            ¿Ya tienes? <Link href="/login" className="text-text underline">Entra</Link>
          </p>
        </form>
      </Container>
    </main>
  );
}
