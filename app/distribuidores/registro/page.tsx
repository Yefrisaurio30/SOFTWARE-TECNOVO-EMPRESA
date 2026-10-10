"use client";

import { useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/section";

const inputCls =
  "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[15px] text-text outline-none placeholder:text-text-faint focus:border-steel/60";
const labelCls = "mb-1 block text-xs font-medium tracking-wide text-text-muted uppercase";

export default function RegistroDistribuidorPage() {
  const [company, setCompany] = useState("");
  const [nit, setNit] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/distribuidor/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company, nit, city, phone }),
      });
      const json = (await res.json()) as { error?: string };
      if (res.status === 401) {
        window.location.href = "/login?next=/distribuidores/registro";
        return;
      }
      if (!res.ok) {
        setError(json.error ?? "No se pudo enviar la solicitud");
        return;
      }
      setDone(true);
    } catch {
      setError("Error de red. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <main className="bg-black py-16 text-text">
        <Container className="max-w-lg text-center">
          <h1 className="text-4xl font-semibold tracking-tight">Solicitud enviada</h1>
          <p className="mt-3 text-text-muted">
            Revisamos tu empresa en máximo 48 horas y te avisamos. Puedes seguir explorando mientras tanto.
          </p>
          <Link href="/" className="mt-6 inline-block rounded-full bg-white px-6 py-3 text-sm font-medium text-black">
            Volver al inicio
          </Link>
        </Container>
      </main>
    );
  }

  return (
    <main className="bg-black py-16 text-text">
      <Container className="max-w-lg">
        <p className="text-sm font-medium tracking-wide text-steel uppercase">Distribuidores</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Registra tu empresa</h1>
        <p className="mt-2 text-text-muted">
          Necesitas una cuenta. Si no has entrado, te pedimos login al enviar.
        </p>
        <form onSubmit={submit} className="mt-8 flex flex-col gap-4 rounded-[28px] border border-white/10 bg-surface p-6">
          <div>
            <label htmlFor="dist-company" className={labelCls}>Empresa</label>
            <input id="dist-company" required value={company} onChange={(e) => setCompany(e.target.value)} className={inputCls} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="dist-nit" className={labelCls}>NIT</label>
              <input id="dist-nit" required value={nit} onChange={(e) => setNit(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label htmlFor="dist-city" className={labelCls}>Ciudad</label>
              <input id="dist-city" required value={city} onChange={(e) => setCity(e.target.value)} className={inputCls} />
            </div>
          </div>
          <div>
            <label htmlFor="dist-phone" className={labelCls}>Contacto (celular)</label>
            <input id="dist-phone" required value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} />
          </div>
          {error ? <p role="alert" className="text-sm text-danger">{error}</p> : null}
          <button type="submit" disabled={loading} className="rounded-full bg-white py-3 text-[15px] font-medium text-black disabled:opacity-60">
            {loading ? "Enviando…" : "Enviar solicitud"}
          </button>
        </form>
      </Container>
    </main>
  );
}
