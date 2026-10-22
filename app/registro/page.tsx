"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Container } from "@/components/ui/section";
import { ConsentCheckboxes } from "@/components/legal/consent-checkboxes";

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
  const [consents, setConsents] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (!consents) {
      setError("Debes aceptar los Términos y Condiciones y la Política de Privacidad.");
      return;
    }
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          email,
          password,
          terms: fd.get("terms") === "on",
          privacy: fd.get("privacy") === "on",
        }),
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
            <input
              id="reg-name"
              name="name"
              required
              minLength={3}
              maxLength={100}
              autoComplete="name"
              pattern="[A-Za-zÁÉÍÓÚáéíóúñÑüÜ ]+"
              title="Solo letras y espacios"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="reg-email" className={labelCls}>Correo</label>
            <input id="reg-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label htmlFor="reg-pass" className={labelCls}>Contraseña (mín. 8)</label>
            <input id="reg-pass" type="password" required autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} />
            {password.length > 0 && password.length < 8 ? (
              <p className="mt-1 text-xs text-danger">La contraseña debe tener al menos 8 caracteres.</p>
            ) : null}
          </div>
          <ConsentCheckboxes onChange={setConsents} />
          {error ? <p role="alert" className="text-sm text-danger">{error}</p> : null}
          <button type="submit" disabled={loading || !consents} className="rounded-full bg-white py-3 text-[15px] font-medium text-[#000] disabled:opacity-50">
            {loading ? "Creando…" : "Crear cuenta"}
          </button>
          {!consents ? (
            <p className="-mt-2 text-center text-xs text-text-faint">
              Marca las dos casillas para crear la cuenta.
            </p>
          ) : null}
          <p className="text-center text-sm text-text-muted">
            ¿Ya tienes? <Link href="/login" className="text-text underline">Entra</Link>
          </p>
          <p className="text-center text-sm text-text-muted">
            ¿Tienes negocio? <Link href="/distribuidores/registro" className="text-text underline">Solicita acceso mayorista</Link>
          </p>
        </form>
      </Container>
    </main>
  );
}
