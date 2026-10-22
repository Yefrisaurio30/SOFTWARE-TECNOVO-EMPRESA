"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Container } from "@/components/ui/section";

const inputCls =
  "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[15px] text-text outline-none placeholder:text-text-faint focus:border-steel/60";
const labelCls = "mb-1 block text-xs font-medium tracking-wide text-text-muted uppercase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Correo o contraseña incorrectos.");
      return;
    }
    // Destino único e incondicional: inicio, sin importar el rol.
    router.push("/");
    router.refresh();
  };

  return (
    <main className="bg-white py-16 text-text">
      <Container className="max-w-md">
        <p className="text-sm font-medium tracking-wide text-steel uppercase">Cuenta</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Entrar</h1>
        <form onSubmit={submit} className="mt-8 flex flex-col gap-4 rounded-[28px] border border-white/10 bg-surface p-6">
          <div>
            <label htmlFor="login-email" className={labelCls}>Correo</label>
            <input id="login-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label htmlFor="login-pass" className={labelCls}>Contraseña</label>
            <input id="login-pass" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} />
          </div>
          {error ? <p role="alert" className="text-sm text-danger">{error}</p> : null}
          <button type="submit" disabled={loading} className="rounded-full bg-white py-3 text-[15px] font-medium text-[#000] disabled:opacity-60">
            {loading ? "Entrando…" : "Iniciar sesión"}
          </button>
          <p className="text-center text-sm text-text-muted">
            ¿Sin cuenta? <Link href="/registro" className="text-text underline">Regístrate</Link>
          </p>
        </form>
      </Container>
    </main>
  );
}