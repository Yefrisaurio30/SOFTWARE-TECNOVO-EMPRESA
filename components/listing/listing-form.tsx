"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatCOP } from "@/lib/money";

const inputCls =
  "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[15px] text-text outline-none placeholder:text-text-faint focus:border-steel/60";
const labelCls = "mb-1 block text-xs font-medium tracking-wide text-text-muted uppercase";

export function ListingForm({
  defaults,
  remaining,
}: {
  defaults?: {
    name: string;
    brand: string;
    year: number;
    km: number;
    price: number;
    city: string;
    phone: string;
    description: string;
  };
  remaining: number;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [price, setPrice] = useState(defaults?.price ?? 0);
  const [year, setYear] = useState(defaults?.year ?? new Date().getFullYear() - 3);
  const [km, setKm] = useState(defaults?.km ?? 0);
  const [description, setDescription] = useState(defaults?.description ?? "");

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          brand: fd.get("brand"),
          year: Number(fd.get("year")),
          km: Number(fd.get("km")),
          price: Number(fd.get("price")),
          city: fd.get("city"),
          phone: fd.get("phone"),
          description: fd.get("description"),
        }),
      });
      const json = (await res.json()) as { id?: string; error?: string };
      if (!res.ok || !json.id) {
        setError(json.error ?? "No se pudo crear la publicación");
        return;
      }
      router.push(`/publicar/fotos?id=${json.id}`);
    } catch {
      setError("Error de red. Inténtalo de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="grid max-w-2xl gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="li-name" className={labelCls}>Modelo</label>
          <input id="li-name" name="name" required minLength={3} defaultValue={defaults?.name ?? ""} placeholder="TEC-ONE" className={inputCls} />
        </div>
        <div>
          <label htmlFor="li-brand" className={labelCls}>Marca</label>
          <input id="li-brand" name="brand" required minLength={2} defaultValue={defaults?.brand ?? ""} placeholder="TECNOVO" className={inputCls} />
        </div>
        <div>
          <label htmlFor="li-year" className={labelCls}>Año</label>
          <input id="li-year" name="year" type="number" min={1990} max={new Date().getFullYear() + 1} required value={year} onChange={(e) => setYear(Number(e.target.value))} className={inputCls} />
        </div>
        <div>
          <label htmlFor="li-km" className={labelCls}>Kilometraje</label>
          <input id="li-km" name="km" type="number" min={0} required value={km} onChange={(e) => setKm(Number(e.target.value))} className={inputCls} />
        </div>
        <div>
          <label htmlFor="li-price" className={labelCls}>Precio de venta (COP)</label>
          <input id="li-price" name="price" type="number" min={100000} step={50000} required value={price} onChange={(e) => setPrice(Number(e.target.value))} className={inputCls} />
          {price > 0 ? (
            <p className="mt-1 text-xs text-steel tabular-nums">Lo verá el comprador: {formatCOP(price)}</p>
          ) : null}
        </div>
        <div>
          <label htmlFor="li-city" className={labelCls}>Ciudad</label>
          <input id="li-city" name="city" required minLength={2} defaultValue={defaults?.city ?? ""} placeholder="Villavicencio" className={inputCls} />
        </div>
        <div>
          <label htmlFor="li-phone" className={labelCls}>Tu celular</label>
          <input id="li-phone" name="phone" type="tel" required defaultValue={defaults?.phone ?? ""} placeholder="312 277 9324" className={inputCls} />
          <p className="mt-1 text-xs text-text-faint">Lo ven los compradores del anuncio, no el público en general.</p>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="li-desc" className={labelCls}>Descripción (mínimo 40 caracteres)</label>
          <textarea id="li-desc" name="description" rows={5} required minLength={40} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Estado, batería, mantenimiento, por qué la vendes…" className={inputCls} />
          <p className="mt-1 text-xs text-text-faint tabular-nums">{description.trim().length}/40 mínimo</p>
        </div>
      </div>
      {error ? (
        <p role="alert" className="rounded-2xl border border-danger/40 bg-danger/10 p-4 text-sm text-danger">
          {error}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={saving || remaining <= 0}
          className="rounded-full bg-steel px-7 py-3 text-[15px] font-medium text-black disabled:opacity-50"
        >
          {saving ? "Guardando…" : "Continuar a las fotos"}
        </button>
        <p className="text-sm text-text-muted tabular-nums">
          Te quedan <strong>{remaining}</strong> publicaciones hoy.
        </p>
      </div>
    </form>
  );
}